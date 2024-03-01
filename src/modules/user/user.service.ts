import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserServiceHandlers } from 'pb/user/UserService';
import { firstValueFrom } from 'rxjs';
import { HMAC_SECRET } from 'src/common/config';
import { USER_MS_CLIENT } from 'src/common/config/constants';
import { decodeVerifyCode } from 'src/common/helper';
import { GrpcService } from 'src/common/type';
import { SessionService } from '../session/session.service';
import {
  UserChangePasswordFromForgotPasswordRequestDTO,
  UserChangePasswordRequestDTO,
  UserForgotPasswordRequestDTO,
  UserLoginRequestDTO,
  UserRegisterRequestDTO,
} from './user.request.dto';
import {
  UserForgotPasswordInvalidQueryExceptionDTO,
  UserSessionResponseDTO,
} from './user.response.dto';

@Injectable()
export class UserService implements OnModuleInit {
  @Inject(forwardRef(() => SessionService))
  private readonly sessionService: SessionService;

  @Inject(forwardRef(() => USER_MS_CLIENT))
  private readonly client: ClientGrpc;

  private userService: GrpcService<UserServiceHandlers>;

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async register(
    params: UserRegisterRequestDTO,
  ): Promise<UserSessionResponseDTO> {
    const { email, password } = params;

    const user = await firstValueFrom(
      this.userService.RegisterUser({ email, password }),
    );

    const { id, session } = await this.sessionService.set(user.id);

    return { session: id + '|' + session };
  }

  async login(params: UserLoginRequestDTO): Promise<UserSessionResponseDTO> {
    const { email, password } = params;

    const user = await firstValueFrom(
      this.userService.LoginUser({ email, password }),
    );

    const { id, session } = await this.sessionService.set(user.id);

    return { session: id + '|' + session };
  }

  async change_password(
    user_id: number,
    params: UserChangePasswordRequestDTO,
  ): Promise<UserSessionResponseDTO> {
    const { current_password, password } = params;

    const user = await firstValueFrom(
      this.userService.ChangePassword({
        current_password: current_password,
        id: user_id,
        password,
      }),
    );

    await this.sessionService.delete_key(user.id);
    const { id, session } = await this.sessionService.set(user.id);

    return { session: id + '|' + session };
  }

  async forgot_password(
    params: UserForgotPasswordRequestDTO,
  ): Promise<boolean> {
    const { email } = params;

    const response = await firstValueFrom(
      this.userService.ForgotPassword({ email }),
    );

    return response.value;
  }

  async change_password_from_forgot(
    params: UserChangePasswordFromForgotPasswordRequestDTO,
  ): Promise<UserSessionResponseDTO> {
    const { password, query } = params;
    const decoded = decodeVerifyCode(query, HMAC_SECRET);
    if (!decoded) {
      throw new UserForgotPasswordInvalidQueryExceptionDTO();
    }

    const { id, code } = decoded;

    const user = await firstValueFrom(
      this.userService.ChangePasswordFromForgot({ code, id, password }),
    );

    await this.sessionService.delete_key(user.id);
    const { session, id: _id } = await this.sessionService.set(user.id);

    return { session: _id + '|' + session };
  }
}
