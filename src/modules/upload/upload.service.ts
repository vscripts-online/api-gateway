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
import { firstValueFrom } from 'rxjs';
import { FILE_MS_CLIENT, QUEUE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { FileService } from '../file/file.service';
import { QueueServiceHandlers } from 'pb/queue/QueueService';

@Injectable()
export class UploadService {
  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

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
