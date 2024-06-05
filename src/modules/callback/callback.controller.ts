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
import { firstValueFrom } from 'rxjs';
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
    const { client_id, client_secret, label } = JSON.parse(
      decodeURIComponent(state),
    ) as CallbackGoogleRequestDTO__Output;

    try {
      await firstValueFrom(
        this.accountService.CallbackGoogle({
          code,
          client_id,
          client_secret,
          label,
        }),
      );

      // ! TODO add redirect here

      return '<h1>Sucessfull! Tab will close automatically after 5 seconds.</h1><script>setTimeout(() => {window.close()}, 5000)</script>';
    } catch (error) {
      return 'An error occured check credentials such as client_id or client_secret and try again';
    }
  }
}
