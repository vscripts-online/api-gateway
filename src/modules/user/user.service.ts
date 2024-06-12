import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FileServiceHandlers } from 'pb/file/FileService';
import { QueueServiceHandlers } from 'pb/queue/QueueService';
import { firstValueFrom } from 'rxjs';
import { FILE_MS_CLIENT, QUEUE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { AuthService, IAuthUser } from '../auth/auth.service';
import { FileService } from '../file/file.service';
import { FilesGetFilesRequestDTO } from '../files/files.request.dto';
import {
  UserGetFilesRequestDTO,
  UserGetUsersRequestDTO,
  UserUpdateUserFilesRequestDTO,
} from './user.request.dto';

@Injectable()
export class UserService implements OnModuleInit {
  @Inject(forwardRef(() => AuthService))
  private readonly authService: AuthService;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly file_ms_client: ClientGrpc;

  @Inject(forwardRef(() => QUEUE_MS_CLIENT))
  private readonly queue_ms_client: ClientGrpc;

  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  private fileServiceMS: GrpcService<FileServiceHandlers>;
  private queueServiceMS: GrpcService<QueueServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.file_ms_client.getService('FileService');
    this.queueServiceMS = this.queue_ms_client.getService('QueueService');
  }

  async get_files(user: IAuthUser, params: UserGetFilesRequestDTO) {
    const { limit, skip } = params;
    delete params.limit;
    delete params.skip;

    const safeLimit = !limit ? 20 : limit > 100 ? 100 : limit;

    const response = this.fileServiceMS.GetFiles({
      where: { ...params, user: user.id },
      limit: { limit: safeLimit, skip },
      sort_by: params.sortBy,
    });

    const data = await firstValueFrom(response);

    data.files =
      data.files?.map((x) => ({
        ...x,
        user: undefined,
        parts: undefined,
      })) || [];

    return data;
  }

  async get_file(user: IAuthUser, _id: string) {
    const { files } = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { user: user.id, _id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    const file = files?.[0];

    if (!file) {
      throw new BadRequestException('File not found');
    }

    return { ...file, parts: undefined, user: undefined };
  }

  async update_file(
    user: IAuthUser,
    _id: string,
    params: UserUpdateUserFilesRequestDTO,
  ) {
    const { file_name, headers } = params;
    const response = await firstValueFrom(
      this.fileServiceMS.UpdateFile({
        _id,
        file_name,
        headers,
        user: user.id,
      }),
    );

    return { ...response, parts: undefined, user: undefined };
  }

  async delete_file(user: IAuthUser, _id: string) {
    const { files } = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { _id, user: user.id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    const file = files?.[0];

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await firstValueFrom(this.queueServiceMS.DeleteFile({ value: file._id }));

    await this.authService.setMetadata(user.id, {
      ...user.metadata,
      used: user.metadata.used - Number(file.size),
    });

    this.fileService.delete_file(file.name);

    return file;
  }

  async get_users(params: UserGetUsersRequestDTO) {
    const response = await this.authService.getUsers(params);
    return response;
  }

  async get_user(userId: number) {
    const user = await this.authService.getUser(userId);
    return user;
  }

  async get_user_files(userId: number, params: FilesGetFilesRequestDTO) {
    const { limit, skip } = params;
    delete params.limit;
    delete params.skip;

    const safeLimit = !limit ? 20 : limit > 100 ? 100 : limit;

    const response = this.fileServiceMS.GetFiles({
      where: { ...params, user: userId },
      limit: { limit: safeLimit, skip },
      sort_by: params.sortBy,
    });

    const data = await firstValueFrom(response);

    return data;
  }

  async update_total(userId: number, total: number) {
    await this.authService.setMetadata(userId, { total }, true);
    return true;
  }
}
