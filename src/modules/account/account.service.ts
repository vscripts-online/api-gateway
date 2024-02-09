import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { google } from 'googleapis';
import { REDIRECT_URI_GOOGLE } from "src/common/config";
import { AccountTypes, DEFAULT_ISEARCH, ISearch } from "src/common/type";
import { AccountRepository } from "src/database/repository/account.repository";
import { StorageService } from "../storage/storage.service";
import { AccountUpdateGoogleRequestDTO, NewAccountRequestDTO } from "./account.request.dto";

@Injectable()
export class AccountService {
  @Inject(forwardRef(() => AccountRepository))
  private readonly accountRepository: AccountRepository;

  @Inject(forwardRef(() => StorageService))
  private readonly storageService: StorageService;

  async new_account(params: NewAccountRequestDTO): Promise<any> {
    const { type, label } = params
    return this.accountRepository.new_account(type, label)
  }

  async sync_size(id: string): Promise<any> {
    const account = await this.accountRepository.get_account_by_id(id)
    if (!account)
      throw new NotFoundException()

    const size = await this.storageService.get_storage_sizes(account)
    return this.accountRepository.sync_size(id, size)
  }

  async get_accounts(params: ISearch = DEFAULT_ISEARCH) {
    return this.accountRepository.get_accounts(params)
  }

  async delete_account(id: string) {
    return this.accountRepository.delete_account(id)
  }

  async login_url_google(params: AccountUpdateGoogleRequestDTO) {
    const { client_id, client_secret, id } = params

    const account = await this.accountRepository.get_account_by_id(id)
    if (account.type !== AccountTypes.GOOGLE)
      throw new BadRequestException('Invalid id')

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI_GOOGLE);

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      include_granted_scopes: true,
      state: id
    });

    account.client_id = client_id
    account.client_secret = client_secret

    await account.save()

    return { authUrl }
  }
}