import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User_Id } from 'src/decorator';
import { AdminGuard, AuthGuard } from 'src/guard';
import {
  UserChangePasswordFromForgotPasswordRequestDTO,
  UserChangePasswordRequestDTO,
  UserForgotPasswordRequestDTO,
  UserGetFilesRequestDTO,
  UserGetUsersRequestDTO,
  UserLoginRequestDTO,
  UserRegisterRequestDTO,
} from './user.request.dto';
import { UserService } from './user.service';
import {
  UserChangePasswordFromForgotResponseDocumentation,
  UserChangePasswordResponseDocumentation,
  UserForgotPasswordResponseDocumentation,
  UserLoginResponseDocumentation,
  UserRegisterResponseDocumentation,
} from './user.swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

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
}
