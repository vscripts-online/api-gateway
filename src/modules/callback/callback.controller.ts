import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Query,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { AccountServiceHandlers } from 'pb/account/AccountService';
import { CallbackGoogleRequestDTO__Output } from 'pb/account/CallbackGoogleRequestDTO';
import { FILE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';

@ApiExcludeController()
@Controller('/')
export class CallbackController implements OnModuleInit {
  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly client: ClientGrpc;

  private accountService: GrpcService<AccountServiceHandlers>;

  onModuleInit() {
    this.accountService = this.client.getService('AccountService');
  }

  @Get('/callback_google')
  async callback_google(
    @Query('state') state: string,
    @Query('code') code: string,
  ) {
    const { _id, client_id, client_secret } = JSON.parse(
      decodeURIComponent(state),
    ) as CallbackGoogleRequestDTO__Output;

    const account = await this.accountService.CallbackGoogle({
      _id,
      client_id,
      client_secret,
      code,
    });

    return account;
  }
}
