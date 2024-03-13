import {
  BadRequestException,
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
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { User_Id } from 'src/decorator';
import { AdminGuard, AuthGuard } from 'src/guard';
import {
  UpdateTotalRequestDTO,
  UserChangePasswordFromForgotPasswordRequestDTO,
  UserChangePasswordRequestDTO,
  UserForgotPasswordRequestDTO,
  UserGetFilesRequestDTO,
  UserGetUsersRequestDTO,
  UserLoginRequestDTO,
  UserRegisterRequestDTO,
  UserUpdateUserFilesRequestDTO,
} from './user.request.dto';
import { UserService } from './user.service';
import {
  UserChangePasswordFromForgotResponseDocumentation,
  UserChangePasswordResponseDocumentation,
  UserForgotPasswordResponseDocumentation,
  UserLoginResponseDocumentation,
  UserRegisterResponseDocumentation,
} from './user.swagger';

@ApiTags('user')
@Controller('/user')
export class UserController {
  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @Post('/register')
  @UserRegisterResponseDocumentation()
  register(@Body() body: UserRegisterRequestDTO) {
    return this.userService.register(body);
  }

  @HttpCode(200)
  @Post('/login')
  @UserLoginResponseDocumentation()
  login(@Body() body: UserLoginRequestDTO) {
    return this.userService.login(body);
  }

  @UseGuards(AuthGuard)
  @Post('/change_password')
  @ApiBearerAuth()
  @UserChangePasswordResponseDocumentation()
  change_password(
    @User_Id() id: number,
    @Body() body: UserChangePasswordRequestDTO,
  ) {
    return this.userService.change_password(id, body);
  }

  @Post('/forgot_password')
  @UserForgotPasswordResponseDocumentation()
  forgot_password(@Body() body: UserForgotPasswordRequestDTO) {
    return this.userService.forgot_password(body);
  }

  @HttpCode(200)
  @Post('/change_password_from_forgot')
  @UserChangePasswordFromForgotResponseDocumentation()
  change_password_from_forgot(
    @Body() body: UserChangePasswordFromForgotPasswordRequestDTO,
  ) {
    return this.userService.change_password_from_forgot(body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Get('/me')
  me(@User_Id() id: number) {
    return this.userService.me(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/files')
  async get_files(@Query() _params: any, @User_Id() user_id: number) {
    const params = plainToInstance(UserGetFilesRequestDTO, _params, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
    await validateOrReject(params).catch((e) => {
      throw new BadRequestException(Array.isArray(e) ? e[0].constraints : e);
    });

    return this.userService.get_files(user_id, params);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/files/:id')
  async get_file(@User_Id() user_id: number, @Param('id') file_id: string) {
    return this.userService.get_file(user_id, file_id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('/files/:id')
  async update_file(
    @User_Id() user_id: number,
    @Param('id') file_id: string,
    @Body() body: UserUpdateUserFilesRequestDTO,
  ) {
    return this.userService.update_file(user_id, file_id, body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('/files/:id')
  async delete_file(@User_Id() user_id: number, @Param('id') file_id: string) {
    return this.userService.delete_file(user_id, file_id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get('/users')
  async get_users(@Query() _params: any) {
    const params = plainToInstance(UserGetUsersRequestDTO, _params, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
    await validateOrReject(params).catch((e) => {
      throw new BadRequestException(Array.isArray(e) ? e[0].constraints : e);
    });

    return this.userService.get_users(params);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Post('/update_total')
  async update_total(@Body() body: UpdateTotalRequestDTO) {
    return this.userService.update_total(body);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get('/count')
  async count() {
    return this.userService.count();
  }
}
