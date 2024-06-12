import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import * as stream from 'node:stream';
import { File__Output } from 'pb/file/File';
import { FileServiceHandlers } from 'pb/file/FileService';
import { QueueServiceHandlers } from 'pb/queue/QueueService';
import { firstValueFrom } from 'rxjs';
import { FILE_MS_CLIENT, QUEUE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import {
  FileUpdateFileRequestDTO,
  FilesGetFilesRequestDTO,
} from './files.request.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class FilesService {
  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly fileMSClient: ClientGrpc;

  @Inject(forwardRef(() => QUEUE_MS_CLIENT))
  private readonly queueMSClient: ClientGrpc;

  @Inject(forwardRef(() => AuthService))
  private readonly authService: AuthService;

  private fileServiceMS: GrpcService<FileServiceHandlers>;
  private queueServiceMS: GrpcService<QueueServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.fileMSClient.getService('FileService');
    this.fileServiceMS = this.fileMSClient.getService('FileService');
    this.queueServiceMS = this.queueMSClient.getService('QueueService');
  }

  async get_file_from_cloud(res: Response, file: File__Output) {
    const response = this.fileServiceMS.GetFileFromStorage(file);

    for (const { key, value } of file.headers || []) {
      res.set(key, value);
    }

    const pass = new stream.PassThrough();
    pass.pipe(res);

    const subscription = response.subscribe({
      next(data) {
        const { value } = data;
        if (!res.closed) {
          pass.write(value);
        }
      },
      complete() {
        console.log('complete');
        pass.end();
      },
      error(err) {
        console.log('ERROR OCCURED WHILE GETTING FILE', file._id, err);
      },
    });

    res.on('close', () => {
      subscription.unsubscribe();
      pass.end();
    });
  }

  async get_file(res: Response, _id: string) {
    const { files } = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        limit: { limit: 1 },
        where: { _id },
      }),
      { defaultValue: undefined },
    );

    const file = files[0];

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return this.get_file_from_cloud(res, file as File__Output);

    // res.set('Content-Disposition', `filename="${file.file_name}"`);
  }

  async get_files(params: FilesGetFilesRequestDTO) {
    const { limit, skip } = params;
    delete params.limit;
    delete params.skip;

    const safeLimit = !limit ? 20 : limit > 100 ? 100 : limit;

    const response = this.fileServiceMS.GetFiles({
      where: params,
      limit: { limit: safeLimit, skip },
      sort_by: params.sortBy,
    });

    const data = await firstValueFrom(response);

    return data;
  }

  async get_file_by_id(_id: string) {
    const { files } = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { _id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    const file = files?.[0];

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async update_file_by_id(_id: string, params: FileUpdateFileRequestDTO) {
    const { file_name, headers } = params;
    const response = await firstValueFrom(
      this.fileServiceMS.UpdateFile({
        _id,
        file_name,
        headers,
        user: params.user,
      }),
    );

    return { ...response, parts: undefined, user: undefined };
  }

  async delete_file_by_id(_id: string) {
    const { files } = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        where: { _id },
        limit: { limit: 1, skip: 0 },
      }),
    );

    const file = files?.[0];

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await firstValueFrom(this.queueServiceMS.DeleteFile({ value: file._id }));

    const user = await this.authService.getUser(file.user, 1, 0);

    if (user) {
      await this.authService.setMetadata(user.user.id, {
        ...user.metadata,
        used: user.metadata.used - Number(file.size),
      });
    }

    return file;
  }
}
