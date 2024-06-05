import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FilePart__Output } from 'pb/file/FilePart';
import { FileServiceHandlers } from 'pb/file/FileService';
import { QueueServiceHandlers } from 'pb/queue/QueueService';
import { firstValueFrom, from, toArray } from 'rxjs';
import { FILE_MS_CLIENT, QUEUE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { AuthService, IAuthUser } from '../auth/auth.service';
import { FileService } from '../file/file.service';
import {
  UserGetFilesRequestDTO,
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

    const response = this.fileServiceMS.GetFiles({
      where: { ...params, user: user.id },
      limit: { limit, skip },
      sort_by: '-created_at',
    });

    const array = await response.pipe(toArray());
    const data = await firstValueFrom(from(array));
    return data.map((x) => ({ ...x, user: undefined, parts: undefined }));
  }

  async get_file(user: IAuthUser, _id: string) {
    const file = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { user: user.id, _id },
        limit: { limit: 1, skip: 0 },
      }),
      { defaultValue: undefined },
    );

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
    const file = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { _id, user: user.id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    for (const part of file.parts || []) {
      try {
        await firstValueFrom(
          this.queueServiceMS.DeleteFile(part as FilePart__Output),
        );
      } catch (error) {
        console.log('error error errorrrrr', error);
        throw new BadRequestException('Can not deleted. Try again later');
      }
    }

    await firstValueFrom(
      this.fileServiceMS.DeleteFile({
        _id,
        user: user.id,
      }),
    );

    await this.authService.setMetadata(user.id, {
      ...user.metadata,
      used: user.metadata.used - Number(file.size),
    });

    this.fileService.delete_file(file.name);

    return file;
  }

  async get_users() {
    const users = await this.authService.getUsers();
    return { users };
  }

  async get_user(userId: number) {
    const user = await this.authService.getUser(userId);
    return user;
  }

  async get_user_files(userId: number) {
    const response = this.fileServiceMS.GetFiles({
      where: { user: userId },
      limit: { limit: 20, skip: 0 },
      sort_by: '-created_at',
    });

    const array = await response.pipe(toArray());
    const data = await firstValueFrom(from(array));
    return data;
  }

  async update_total(userId: number, total: number) {
    await this.authService.setMetadata(userId, { total }, true);
    return true;
  }
}
