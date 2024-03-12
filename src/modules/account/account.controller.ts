import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchRequestQueryParams } from 'src/common/util';
import { AdminGuard, AuthGuard } from 'src/guard';
import {
  AccountDeleteAccountDTO,
  AccountUpdateGoogleRequestDTO,
  NewAccountRequestDTO,
} from './account.request.dto';
import { AccountService } from './account.service';
import {
  AccountDeleteAccountResponseDocumentation,
  AccountGetAccountsResponseDocumentation,
  AccountLoginUrlGoogleResponseDocumentation,
  AccountNewAccountResponseDocumentation,
  AccountTotalStorageResponseDocumentation,
} from './account.swagger';
import { UpdateLabelDTO__Output } from 'pb/account/UpdateLabelDTO';

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

  @Delete('/:_id')
  @AccountDeleteAccountResponseDocumentation()
  delete_account(@Param() params: AccountDeleteAccountDTO) {
    return this.authService.delete_account(params._id);
  }

  @Get('/total_storage')
  @AccountTotalStorageResponseDocumentation()
  total_storage() {
    return this.authService.total_storage();
  }

  @Put('/update_label')
  update_label(@Body() body: UpdateLabelDTO__Output) {
    return this.authService.update_label(body);
  }
}
