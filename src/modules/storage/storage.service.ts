import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { drive_v3, google } from "googleapis";
import * as ms from 'ms';
import * as fs from 'node:fs';
import { AccountTypes } from "src/common/type";
import { IAccountSchema, IFilePartSchema } from "src/database";
import { AccountRepository } from "src/database/repository/account.repository";
import { FileRepository } from "src/database/repository/file.repository";
import { GoogleDrive } from "./drives";

@Injectable()
export class StorageService {
  @Inject(forwardRef(() => AccountRepository))
  private readonly accountRepository: AccountRepository;

  @Inject(forwardRef(() => FileRepository))
  private readonly fileRepository: FileRepository;

  private onApplicationBootstrap() {
    // this.test()
    // this.delete_unsynced_files()
  }

  async delete_unsynced_files() {
    const unsynced_files = await this.fileRepository.get_unsynced_files()
    for (const { name, _id } of unsynced_files) {
      console.log('removing', name)
      fs.promises.unlink('./upload/' + name).catch(() => void 0)
      this.fileRepository.delete_file_by_id(_id)
    }

  }

  private async test() {
    const account = await this.accountRepository.get_account_by_id('65bd702109866a1c1de36fac')
    const oAuth2Client = new google.auth.OAuth2(account.client_id, account.client_secret);
    oAuth2Client.setCredentials({ refresh_token: account.refresh_token, access_token: account.access_token });
    const { credentials: { access_token, expiry_date } } = await oAuth2Client.refreshAccessToken()
    this.accountRepository.set_access_token(account._id, access_token, expiry_date)
    oAuth2Client.setCredentials({ refresh_token: account.refresh_token, access_token });

    const drive = google.drive({ version: 'v3', auth: oAuth2Client })

    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(name, id)',
    });
    const files = response.data.files;

    console.log(files)
  }

  private get_storage(account: IAccountSchema) {
    switch (account.type) {
      case AccountTypes.GOOGLE:
        return new GoogleDrive({ account, accountRepository: this.accountRepository })

      default:
        break;
    }
  }

  async upload(account: IAccountSchema, name: string, stream: fs.ReadStream) {
    const drive = await this.get_storage(account).get_drive()

    try {
      const file = await drive.files.create({
        media: { body: stream },
        fields: 'id',
        requestBody: { name },
      });

      return file.data.id
    } catch (err) {
      console.error('Error on uploading listing files:', err);
      return false
    }
  }

  async get_storage_sizes(account: IAccountSchema) {
    return this.get_storage(account).get_storage_sizes()
  }

  async get_file_from_storage(account: IAccountSchema, file: IFilePartSchema) {
    return this.get_storage(account).get_file(file)
  }
}