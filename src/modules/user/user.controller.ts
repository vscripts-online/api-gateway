import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserChangePasswordFromForgotPasswordRequestDTO,
  UserChangePasswordRequestDTO,
  UserForgotPasswordRequestDTO,
  UserLoginRequestDTO,
  UserRegisterRequestDTO,
} from './user.request.dto';
import { User_Id } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('/user')
export class UserController {
  @Inject(forwardRef(() => UserService))
  private readonly userService: UserService;

  @Post('/register')
  register(@Body() body: UserRegisterRequestDTO) {
    return this.userService.register(body);
  }

  @Post('/login')
  login(@Body() body: UserLoginRequestDTO) {
    return this.userService.login(body);
  }

  @UseGuards(AuthGuard)
  @Post('/change_password')
  change_password(
    @User_Id() _id: string,
    @Body() body: UserChangePasswordRequestDTO,
  ) {
    return this.userService.change_password(_id, body);
  }

  @Post('/forgot_password')
  forgot_password(@Body() body: UserForgotPasswordRequestDTO) {
    return this.userService.forgot_password(body);
  }

  @Post('/change_password_from_forgot')
  change_password_from_forgot(
    @Body() body: UserChangePasswordFromForgotPasswordRequestDTO,
  ) {
    return this.userService.change_password_from_forgot(body);
  }
}
