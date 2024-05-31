import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AccountServiceHandlers } from 'pb/account/AccountService';
import { UpdateLabelDTO__Output } from 'pb/account/UpdateLabelDTO';
import { firstValueFrom, toArray } from 'rxjs';
import { FILE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService, ISearch } from 'src/common/type';
import { DEFAULT_SEARCH } from 'src/common/util';
import {
  AccountUpdateGoogleRequestDTO,
  NewAccountRequestDTO,
} from './account.request.dto';

@Injectable()
export class AccountService implements OnModuleInit {
  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly client: ClientGrpc;

  private accountServiceMS: GrpcService<AccountServiceHandlers>;

  onModuleInit() {
    this.accountServiceMS = this.client.getService('AccountService');
  }

  async new_account(params: NewAccountRequestDTO) {
    const account = await firstValueFrom(
      this.accountServiceMS.NewAccount(params),
    );

    return account;
  }

  async login_url_google(params: AccountUpdateGoogleRequestDTO) {
    const url = await firstValueFrom(
      this.accountServiceMS.LoginUrlGoogle(params),
    );

    return url;
  }

  async get_accounts(params: ISearch = DEFAULT_SEARCH) {
    const response = this.accountServiceMS.GetAccounts(params);
    return response.pipe(toArray());
  }

  async get_account(_id: string) {
    const account = await firstValueFrom(
      this.accountServiceMS.GetAccount({ value: _id }),
    );

    return account;
  }

  async delete_account(_id: string) {
    const account = await firstValueFrom(
      this.accountServiceMS.DeleteAccount({ value: _id }),
    );

    return account;
  }

  async total_storage() {
    const storage = firstValueFrom(this.accountServiceMS.TotalStorage({}));
    return storage;
  }

  async update_label(params: UpdateLabelDTO__Output) {
    const storage = await firstValueFrom(
      this.accountServiceMS.UpdateLabel(params),
    );
    return storage.value;
  }

  async sync_size(value: string) {
    const result = await firstValueFrom(
      this.accountServiceMS.SyncSize({ value }),
    );
    return result.value;
  }
}
