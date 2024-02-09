import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { google } from "googleapis";
import { AccountTypes } from "src/common/type";
import { AccountRepository } from "src/database/repository/account.repository";
import { StorageService } from "../storage/storage.service";
import { REDIRECT_URI_GOOGLE } from "src/common/config";

@Injectable()
export class CallbackService {
  @Inject(forwardRef(() => AccountRepository))
  private readonly accountRepository: AccountRepository;

  @Inject(forwardRef(() => StorageService))
  private readonly storageService: StorageService;

  async onApplicationBootstrap() {
  }

  async callback_google(id: string, code: string) {
    const account = await this.accountRepository.get_account_by_id(id)
    if (!account)
      throw new BadRequestException('Account not found')

    if (account.type !== AccountTypes.GOOGLE)
      throw new BadRequestException('Invalid id')

    if (!account.client_id || !account.client_secret)
      throw new BadRequestException('Client id or client secret is invalid')

    const oAuth2Client = new google.auth.OAuth2(account.client_id, account.client_secret, REDIRECT_URI_GOOGLE);
    console.log(id, code)

    const { tokens } = await oAuth2Client.getToken({ code });
    console.log('tokens', tokens)

    account.code = code || account.code
    account.access_token = tokens.access_token || account.access_token
    account.refresh_token = tokens.refresh_token || account.refresh_token
    account.access_token_expiry_time = tokens.expiry_date || account.access_token_expiry_time

    const { available_size, storage_size } = await this.storageService.get_storage_sizes(account)

    account.storage_size = storage_size
    account.available_size = available_size

    return account.save()
  }
}