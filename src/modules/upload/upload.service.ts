import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import { FileHeader__Output } from 'pb/file/FileHeader';
import { FileServiceHandlers } from 'pb/file/FileService';
import { QueueServiceHandlers } from 'pb/queue/QueueService';
import { UserServiceHandlers } from 'pb/user/UserService';
import { firstValueFrom } from 'rxjs';
import {
  FILE_MS_CLIENT,
  QUEUE_MS_CLIENT,
  USER_MS_CLIENT,
} from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { FileService } from '../file/file.service';

@Injectable()
export class UploadService {
  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly file_ms_client: ClientGrpc;

  @Inject(forwardRef(() => USER_MS_CLIENT))
  private readonly user_ms_client: ClientGrpc;

  @Inject(forwardRef(() => QUEUE_MS_CLIENT))
  private readonly queue_ms_client: ClientGrpc;

  private fileServiceMS: GrpcService<FileServiceHandlers>;
  private queueServiceMS: GrpcService<QueueServiceHandlers>;
  private userServiceMS: GrpcService<UserServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.file_ms_client.getService('FileService');
    this.userServiceMS = this.user_ms_client.getService('UserService');
    this.queueServiceMS = this.queue_ms_client.getService('QueueService');
  }

  async file_filter_guard(length: number, id: number) {
    const user = await firstValueFrom(this.userServiceMS.FindOne({ id }));
    return user.total_drive > user.used_size + length;
  }

  async upload(
    user: number,
    uploaded_file: Express.Multer.File,
    headers: FileHeader__Output[],
  ) {
    const {
      mimetype: mime_type,
      filename: name,
      originalname: original_name,
      size,
    } = uploaded_file;

    const file = await firstValueFrom(
      this.fileServiceMS.CreateFile({
        headers,
        mime_type,
        name,
        original_name,
        size,
        user,
      }),
    );

    firstValueFrom(this.queueServiceMS.NewFileUploaded({ value: file._id }));

    firstValueFrom(
      this.userServiceMS.IncreaseUsedSize({ user, size: size + '' }),
    );

    return file;
  }

  async get_file(res: Response, name: string, start: number, end: number) {
    const file_stream = await this.fileService.get_file(name, start, end);
    if (file_stream instanceof Error) {
      throw new InternalServerErrorException();
    }

    file_stream.pipe(res);
  }
}
