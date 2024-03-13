import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FileServiceHandlers } from 'pb/file/FileService';
import { QueueServiceHandlers } from 'pb/queue/QueueService';
import { UserServiceHandlers } from 'pb/user/UserService';
import { firstValueFrom, from, toArray } from 'rxjs';
import { HMAC_SECRET } from 'src/common/config';
import {
  FILE_MS_CLIENT,
  QUEUE_MS_CLIENT,
  USER_MS_CLIENT,
} from 'src/common/config/constants';
import { decodeVerifyCode } from 'src/common/helper';
import { GrpcService } from 'src/common/type';
import { SessionService } from '../session/session.service';
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
import {
  UserForgotPasswordInvalidQueryExceptionDTO,
  UserSessionResponseDTO,
} from './user.response.dto';
import { FilePart__Output } from 'pb/file/FilePart';
import { FileService } from '../file/file.service';

@Injectable()
export class UserService implements OnModuleInit {
  @Inject(forwardRef(() => SessionService))
  private readonly sessionService: SessionService;

  @Inject(forwardRef(() => USER_MS_CLIENT))
  private readonly user_ms_client: ClientGrpc;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly file_ms_client: ClientGrpc;

  @Inject(forwardRef(() => QUEUE_MS_CLIENT))
  private readonly queue_ms_client: ClientGrpc;

  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  private userServiceMS: GrpcService<UserServiceHandlers>;
  private fileServiceMS: GrpcService<FileServiceHandlers>;
  private queueServiceMS: GrpcService<QueueServiceHandlers>;

  onModuleInit() {
    this.userServiceMS = this.user_ms_client.getService('UserService');
    this.fileServiceMS = this.file_ms_client.getService('FileService');
    this.queueServiceMS = this.queue_ms_client.getService('QueueService');
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
      sort_by: '-created_at',
    });

    const array = await response.pipe(toArray());
    const data = await firstValueFrom(from(array));
    return data.map((x) => ({ ...x, user: undefined, parts: undefined }));
  }

  async get_file(user: number, _id: string) {
    const response = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { user, _id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    return { ...response, parts: undefined, user: undefined };
  }

  async update_file(
    user: number,
    _id: string,
    params: UserUpdateUserFilesRequestDTO,
  ) {
    const { file_name, headers } = params;
    const response = await firstValueFrom(
      this.fileServiceMS.UpdateFile({
        _id,
        file_name,
        headers,
        user,
      }),
    );

    return { ...response, parts: undefined, user: undefined };
  }

  async delete_file(user: number, _id: string) {
    const file = await firstValueFrom(
      this.fileServiceMS.DeleteFile({
        _id,
        user,
      }),
    );

    for (const part of file.parts) {
      await firstValueFrom(
        this.queueServiceMS.DeleteFile(part as FilePart__Output),
      );
    }

    const response = await firstValueFrom(
      this.userServiceMS.IncreaseUsedSize({
        size: 0 - parseInt(file.size as string) + '',
        user,
      }),
    );

    this.fileService.delete_file(file.name);

    return response.value;
  }

  async get_users(params: UserGetUsersRequestDTO) {
    const response = this.userServiceMS.GetUsers(params);
    return response.pipe(toArray());
  }

  async update_total(params: UpdateTotalRequestDTO) {
    const { size, user } = params;
    const response = await firstValueFrom(
      this.userServiceMS.SetTotalDrive({ size, user }),
    );

    return response.value;
  }

  async count() {
    const response = await firstValueFrom(this.userServiceMS.UsersCount({}));
    return response.value;
  }
}
