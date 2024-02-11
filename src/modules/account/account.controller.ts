import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { SearchRequestQueryParams } from 'src/common/type';
import { AdminGuard, AuthGuard } from 'src/guard';
import {
  AccountUpdateGoogleRequestDTO,
  NewAccountRequestDTO,
} from './account.request.dto';
import { AccountService } from './account.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('account')
@Controller('/account')
export class AccountController {
  @Inject(forwardRef(() => AccountService))
  private readonly authService: AccountService;

  @Post('/new_account')
  new_account(@Body() body: NewAccountRequestDTO) {
    return this.authService.new_account(body);
  }

  @Post('/sync_size/:id')
  sync_size(@Param('id') id: string) {
    return this.authService.sync_size(id);
  }

  @Get('/accounts')
  get_accounts(@Query() params: SearchRequestQueryParams) {
    return this.authService.get_accounts({ ...params });
  }

  @Delete('/:id')
  delete_account(@Param('id') id: string) {
    return this.authService.delete_account(id);
  }

  @Post('/login_url_google')
  login_url_google(@Body() body: AccountUpdateGoogleRequestDTO) {
    return this.authService.login_url_google(body);
  }
}
