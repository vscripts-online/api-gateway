import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { USER_MS_CLIENT } from 'src/common/config/constants';
import { decodeVerifyCode } from 'src/common/helper';
import { BoolValue__Output } from 'src/pb/google/protobuf/BoolValue';
import { UserChangePasswordFromForgotPasswordRequestDTO__Output } from 'src/pb/user/UserChangePasswordFromForgotPasswordRequestDTO';
import { UserChangePasswordRequestDTO__Output } from 'src/pb/user/UserChangePasswordRequestDTO';
import { UserFineOneDTO__Output } from 'src/pb/user/UserFineOneDTO';
import { UserForgotPasswordRequestDTO__Output } from 'src/pb/user/UserForgotPasswordRequestDTO';
import { UserRegisterRequestDTO__Output } from 'src/pb/user/UserRegisterRequestDTO';
import { UserRegisterResponseDTO__Output } from 'src/pb/user/UserRegisterResponseDTO';
import { RedisService } from '../redis/redis.service';
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
import { HMAC_SECRET } from 'src/common/config';

interface IUserServiceMS {
  RegisterUser(
    data: UserRegisterRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  LoginUser(
    data: UserRegisterRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  ChangePassword(
    data: UserChangePasswordRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  ForgotPassword(
    data: UserForgotPasswordRequestDTO__Output,
  ): Observable<BoolValue__Output>;
  ChangePasswordFromForgot(
    data: UserChangePasswordFromForgotPasswordRequestDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
  FindOne(
    data: UserFineOneDTO__Output,
  ): Observable<UserRegisterResponseDTO__Output>;
}

@Injectable()
export class UserService implements OnModuleInit {
  @Inject(forwardRef(() => RedisService))
  private readonly redisService: RedisService;

  @Inject(forwardRef(() => USER_MS_CLIENT))
  private readonly client: ClientGrpc;

  private userService: IUserServiceMS;

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

    const { id, session } = await this.redisService.set(user.id);

    return { session: id + '|' + session };
  }

  async login(params: UserLoginRequestDTO): Promise<UserSessionResponseDTO> {
    const { email, password } = params;

    const user = await firstValueFrom(
      this.userService.LoginUser({ email, password }),
    );

    const { id, session } = await this.redisService.set(user.id);

    return { session: id + '|' + session };
  }

  async change_password(
    user_id: number,
    params: UserChangePasswordRequestDTO,
  ): Promise<UserSessionResponseDTO> {
    const { current_password, password } = params;

    const user = await firstValueFrom(
      this.userService.ChangePassword({
        currentPassword: current_password,
        id: user_id,
        password,
      }),
    );

    await this.redisService.delete_key(user.id);
    const { id, session } = await this.redisService.set(user.id);

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

    await this.redisService.delete_key(user.id);
    const { session, id: _id } = await this.redisService.set(user.id);

    return { session: _id + '|' + session };
  }
}
