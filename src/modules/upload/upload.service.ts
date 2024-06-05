import {
  BadRequestException,
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
import { firstValueFrom } from 'rxjs';
import { FILE_MS_CLIENT, QUEUE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { AccountService } from '../account/account.service';
import { AuthService, IAuthUser } from '../auth/auth.service';
import { FileService } from '../file/file.service';

@Injectable()
export class UploadService {
  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  @Inject(forwardRef(() => AccountService))
  private readonly accountService: AccountService;

  @Inject(forwardRef(() => AuthService))
  private readonly authService: AuthService;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly file_ms_client: ClientGrpc;

  @Inject(forwardRef(() => QUEUE_MS_CLIENT))
  private readonly queue_ms_client: ClientGrpc;

  private fileServiceMS: GrpcService<FileServiceHandlers>;
  private queueServiceMS: GrpcService<QueueServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.file_ms_client.getService('FileService');
    this.queueServiceMS = this.queue_ms_client.getService('QueueService');
  }

  async file_filter_guard(length: number, user: IAuthUser) {
    return user.metadata.total > user.metadata.used + length;
  }

  async total_file_guard(length: number) {
    const total_storage = await this.accountService.total_storage();
    return +total_storage.available_storage > length;
  }

  async upload(
    user: IAuthUser,
    uploaded_file: Express.Multer.File,
    headers: FileHeader__Output[],
    file_name: string,
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
        size: size + '',
        user: user.id,
        file_name,
      }),
    );

    firstValueFrom(this.queueServiceMS.NewFileUploaded({ value: file._id }));

    this.authService.setMetadata(user.id, {
      ...user.metadata,
      used: user.metadata.used + size,
    });

    return file;
  }

  async get_file(res: Response, name: string, start: number, end: number) {
    const file_stream = await this.fileService.get_file(name, start, end);
    if (file_stream instanceof Error) {
      throw new InternalServerErrorException();
    }

    file_stream.pipe(res);
  }

  async del_file(_id: string) {
    console.log('DELETE FILE', _id);

    const file = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { _id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    const parts_size =
      file.parts.map((x) => +x.size).reduce((old, val) => old + val, 0) +
      file.parts.length -
      1;

    if (+file.size !== parts_size) {
      throw new BadRequestException('File is not fully loaded');
    }

    this.fileService.delete_file(file.name);
  }
}
