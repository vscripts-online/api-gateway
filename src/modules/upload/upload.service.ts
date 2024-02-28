import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import { FileServiceHandlers } from 'pb/file/FileService';
import { firstValueFrom } from 'rxjs';
import { FILE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { IFileHeaderSchema } from 'src/database';
import { FileService } from '../file/file.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class UploadService {
  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  @Inject(forwardRef(() => QueueService))
  private readonly queueService: QueueService;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly client: ClientGrpc;

  private fileServiceMS: GrpcService<FileServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.client.getService('FileService');
  }

  async upload(
    uploaded_file: Express.Multer.File,
    headers: IFileHeaderSchema[],
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
      }),
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this.queueService.new_file(file);
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
