import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User_Id } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import {
  UserChangePasswordFromForgotPasswordRequestDTO,
  UserChangePasswordRequestDTO,
  UserForgotPasswordRequestDTO,
  UserLoginRequestDTO,
  UserRegisterRequestDTO,
} from './user.request.dto';
import { UserService } from './user.service';
import {
  UserChangePasswordFromForgotResponseDocumentation,
  UserChangePasswordResponseDocumentation,
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
    @User_Id() _id: string,
    @Body() body: UserChangePasswordRequestDTO,
  ) {
    return this.userService.change_password(_id, body);
  }

  @Post('/forgot_password')
  @UserChangePasswordResponseDocumentation()
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
}
