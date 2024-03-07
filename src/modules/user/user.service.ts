import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserServiceHandlers } from 'pb/user/UserService';
import { firstValueFrom, toArray } from 'rxjs';
import { HMAC_SECRET } from 'src/common/config';
import { FILE_MS_CLIENT, USER_MS_CLIENT } from 'src/common/config/constants';
import { decodeVerifyCode } from 'src/common/helper';
import { GrpcService } from 'src/common/type';
import { SessionService } from '../session/session.service';
import {
  UserChangePasswordFromForgotPasswordRequestDTO,
  UserChangePasswordRequestDTO,
  UserForgotPasswordRequestDTO,
  UserGetFilesRequestDTO,
  UserGetUsersRequestDTO,
  UserLoginRequestDTO,
  UserRegisterRequestDTO,
} from './user.request.dto';
import {
  UserForgotPasswordInvalidQueryExceptionDTO,
  UserSessionResponseDTO,
} from './user.response.dto';
import { FileServiceHandlers } from 'pb/file/FileService';
import { AccountServiceHandlers } from 'pb/account/AccountService';

@Injectable()
export class UserService implements OnModuleInit {
  @Inject(forwardRef(() => SessionService))
  private readonly sessionService: SessionService;

  @Inject(forwardRef(() => USER_MS_CLIENT))
  private readonly user_ms_client: ClientGrpc;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly file_ms_client: ClientGrpc;

  private userServiceMS: GrpcService<UserServiceHandlers>;
  private fileServiceMS: GrpcService<FileServiceHandlers>;
  private accountServiceMS: GrpcService<AccountServiceHandlers>;

  onModuleInit() {
    this.userServiceMS = this.user_ms_client.getService('UserService');
    this.fileServiceMS = this.file_ms_client.getService('FileService');
    this.accountServiceMS = this.file_ms_client.getService('AccountService');
  }

  async register(
    params: UserRegisterRequestDTO,
  ): Promise<UserSessionResponseDTO> {
    const { email, password } = params;

    const user = await firstValueFrom(
      this.userServiceMS.RegisterUser({ email, password }),
    );

    const { id, session } = await this.sessionService.set(user.id);

    return { session: id + '|' + session };
  }

  async login(params: UserLoginRequestDTO): Promise<UserSessionResponseDTO> {
    const { email, password } = params;

    const user = await firstValueFrom(
      this.userServiceMS.LoginUser({ email, password }),
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
      this.userServiceMS.ChangePassword({
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
      this.userServiceMS.ForgotPassword({ email }),
    );

    return response.success;
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
      this.userServiceMS.ChangePasswordFromForgot({ code, id, password }),
    );

    await this.sessionService.delete_key(user.id);
    const { session, id: _id } = await this.sessionService.set(user.id);

    return { session: _id + '|' + session };
  }

  async me(id: number) {
    const user = await firstValueFrom(this.userServiceMS.me({ id }));
    return user;
  }

  async get_files(user: number, params: UserGetFilesRequestDTO) {
    const { limit, skip } = params;
    delete params.limit;
    delete params.skip;

    const response = this.fileServiceMS.GetFiles({
      where: { ...params, user },
      limit: { limit, skip },
      sort_by: 'created_at',
    });

    return response.pipe(toArray());
  }

  async get_users(params: UserGetUsersRequestDTO) {
    const response = this.userServiceMS.GetUsers(params);
    return response.pipe(toArray());
  }
}
