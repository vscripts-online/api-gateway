import { Inject, Injectable, forwardRef } from '@nestjs/common';
import * as fs from 'node:fs';
import { AccountTypes } from 'src/common/type';
import { IAccountSchema, IFilePartSchema } from 'src/database';
import { AccountRepository } from 'src/database/repository/account.repository';
import { GoogleDrive } from './drives';

@Injectable()
export class StorageService {
  @Inject(forwardRef(() => AccountRepository))
  private readonly accountRepository: AccountRepository;

  private get_storage(account: IAccountSchema) {
    switch (account.type) {
      case AccountTypes.GOOGLE:
        return new GoogleDrive({
          account,
          accountRepository: this.accountRepository,
        });

      default:
        break;
    }
  }

  async upload(account: IAccountSchema, name: string, stream: fs.ReadStream) {
    const drive = await this.get_storage(account).get_drive();

    try {
      const file = await drive.files.create({
        media: { body: stream },
        fields: 'id',
        requestBody: { name },
      });

      return file.data.id;
    } catch (err) {
      console.error('Error on uploading listing files:', err);
      return false;
    }
  }

  async get_storage_sizes(account: IAccountSchema) {
    return this.get_storage(account).get_storage_sizes();
  }

  async get_file_from_storage(account: IAccountSchema, file: IFilePartSchema) {
    return this.get_storage(account).get_file(file);
  }
}
