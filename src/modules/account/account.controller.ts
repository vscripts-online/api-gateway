import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchRequestQueryParams } from 'src/common/util';
import { AdminGuard, AuthGuard } from 'src/guard';
import {
  AccountUpdateGoogleRequestDTO,
  NewAccountRequestDTO,
} from './account.request.dto';
import { AccountService } from './account.service';
import {
  AccountDeleteAccountResponseDocumentation,
  AccountGetAccountsResponseDocumentation,
  AccountLoginUrlGoogleResponseDocumentation,
  AccountNewAccountResponseDocumentation,
} from './account.swagger';

@UseGuards(AuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('account')
@Controller('/account')
export class AccountController {
  @Inject(forwardRef(() => AccountService))
  private readonly authService: AccountService;

  @Post('/new_account')
  @AccountNewAccountResponseDocumentation()
  new_account(@Body() body: NewAccountRequestDTO) {
    return this.authService.new_account(body);
  }

  @HttpCode(200)
  @Post('/login_url_google')
  @AccountLoginUrlGoogleResponseDocumentation()
  login_url_google(@Body() body: AccountUpdateGoogleRequestDTO) {
    return this.authService.login_url_google(body);
  }

  // @HttpCode(200)
  // @Post('/sync_size/:id')
  // @AccountSyncSizeResponseDocumentation()
  // sync_size(@Param('id') id: string) {
  //   return this.authService.sync_size(id);
  // }

  @Get('/accounts')
  @AccountGetAccountsResponseDocumentation()
  get_accounts(@Query() params: SearchRequestQueryParams) {
    return this.authService.get_accounts({ ...params });
  }

  @Delete('/:id')
  @AccountDeleteAccountResponseDocumentation()
  delete_account(@Param('id') id: string) {
    return this.authService.delete_account(id);
  }
}
