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
  AccountGetAccountDTO,
  AccountUpdateLabelDTO,
  NewAccountRequestDTO,
  ObjectIdDTO,
} from './account.request.dto';
import { AccountService } from './account.service';
import {
  AccountDeleteAccountResponseDocumentation,
  AccountGetAccountsResponseDocumentation,
  AccountNewAccountResponseDocumentation,
  AccountSyncSizeResponseDocumentation,
  AccountTotalStorageResponseDocumentation,
} from './account.swagger';

@UseGuards(AuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('account')
@Controller('/account')
export class AccountController {
  @Inject(forwardRef(() => AccountService))
  private readonly accountService: AccountService;

  @Post('/new_account')
  @AccountNewAccountResponseDocumentation()
  new_account(@Body() body: NewAccountRequestDTO) {
    return this.accountService.new_account(body);
  }

  @HttpCode(200)
  @Post('/sync_size/:id')
  @AccountSyncSizeResponseDocumentation()
  sync_size(@Param('id') id: string) {
    return this.accountService.sync_size(id);
  }

  @Get('/accounts')
  @AccountGetAccountsResponseDocumentation()
  get_accounts(@Query() params: SearchRequestQueryParams) {
    return this.accountService.get_accounts({ ...params });
  }

  @Get('/account/:_id')
  // @AccountGetAccountsResponseDocumentation()
  get_account(@Param() params: AccountGetAccountDTO) {
    return this.accountService.get_account(params._id);
  }

  @Delete('/:_id')
  @AccountDeleteAccountResponseDocumentation()
  delete_account(@Param() params: AccountDeleteAccountDTO) {
    return this.accountService.delete_account(params._id);
  }

  @Get('/total_storage')
  @AccountTotalStorageResponseDocumentation()
  total_storage() {
    return this.accountService.total_storage();
  }

  @Put('/:_id')
  update_label(
    @Body() body: AccountUpdateLabelDTO,
    @Param() params: ObjectIdDTO,
  ) {
    return this.accountService.update_label({
      _id: params._id,
      label: body.label,
    });
  }
}
