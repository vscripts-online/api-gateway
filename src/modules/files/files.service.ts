import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import { Types } from 'mongoose';
import * as fs from 'node:fs';
import * as stream from 'node:stream';
import { File__Output } from 'pb/file/File';
import { FileServiceHandlers } from 'pb/file/FileService';
import { firstValueFrom, toArray } from 'rxjs';
import { FILE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { FileService } from 'src/modules/file/file.service';
import { FilesGetFilesRequestDTO } from './files.request.dto';
import { FilesGetFileLoadingExceptionDTO } from './files.response.dto';

@Injectable()
export class FilesService {
  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  @Inject(forwardRef(() => FILE_MS_CLIENT))
  private readonly client: ClientGrpc;

  private fileServiceMS: GrpcService<FileServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.client.getService('FileService');
  }

  async get_file_from_cloud(res: Response, file: File__Output) {
    const response = this.fileServiceMS.GetFileFromStorage(file);

    for (const { key, value } of file.headers || []) {
      res.set(key, value);
    }

    const local_stream = fs.createWriteStream('./upload/' + file.name);
    const pass = new stream.PassThrough();
    pass.pipe(res);
    pass.pipe(local_stream);

    response.subscribe({
      next(data) {
        const { value } = data;
        pass.write(value);
      },
      complete() {
        console.log('complete');
        pass.end();
      },
      error(err) {
        console.log('err', err);
      },
    });
  }

  async get_file(res: Response, slug: string) {
    const response = this.fileServiceMS.GetBySlug({ slug });
    const file = await firstValueFrom(response);

    if (file.loading_from_cloud_now) {
      const size = await this.fileService.get_file_length(file.name);
      if (!size) {
        throw new FilesGetFileLoadingExceptionDTO();
      }

      if (file.size === size + '') {
        await firstValueFrom(
          this.fileServiceMS.SetLoading({
            _id: file._id,
            loading_from_cloud_now: false,
          }),
        );
      }

      file.loading_from_cloud_now = false;
    }

    const file_stream = await this.fileService.get_file(
      file.name,
      0,
      parseInt(file.size as string),
    );

    if (file_stream instanceof Error) {
      if (file_stream.message.includes('no such file or directory')) {
        return this.get_file_from_cloud(res, file as File__Output);
      } else {
        throw new InternalServerErrorException();
      }
    }

    res.set('Content-Disposition', `filename="${file.file_name}"`);

    for (const { key, value } of file.headers || []) {
      res.set(key, value);
    }

    file_stream.on('end', () => {
      if (!file.loading_from_cloud_now) {
        return;
      }

      firstValueFrom(
        this.fileServiceMS.SetLoading({
          _id: file._id,
          loading_from_cloud_now: false,
        }),
      );
    });
    file_stream.pipe(res);
  }

  async get_files(params: FilesGetFilesRequestDTO) {
    const { limit, skip } = params;
    delete params.limit;
    delete params.skip;

    if (typeof params.size_gte === 'number') {
      params['size'] = { $gte: params.size_gte };
      delete params.size_gte;
    }

    if (typeof params.size_lte === 'number') {
      params['size'] = { ...params['size'], $lte: params.size_lte };
      delete params.size_lte;
    }

    if (params.headers_key) {
      params['headers.key'] = params.headers_key;
      delete params.headers_key;
    }

    if (params.headers_value) {
      params['headers.value'] = params.headers_value;
      delete params.headers_value;
    }

    if (params.owner) {
      params['parts.owner'] = new Types.ObjectId(params.owner);
      delete params.owner;
    }

    if (params.created_at_gte) {
      params['created_at'] = { gte: params.created_at_gte };
      delete params.created_at_gte;
    }

    if (params.created_at_lte) {
      params['created_at'] = {
        ...params['created_at'],
        lte: params.created_at_lte,
      };
      delete params.created_at_lte;
    }

    if (params.updated_at_gte) {
      params['updated_at'] = { gte: params.updated_at_gte };
      delete params.updated_at_gte;
    }

    if (params.updated_at_lte) {
      params['updated_at'] = {
        ...params['updated_at'],
        lte: params.updated_at_lte,
      };
      delete params.updated_at_lte;
    }

    const sort_by = params.sort_by;
    delete params.sort_by;

    const response = this.fileServiceMS.GetFiles({
      where: { ...params },
      limit: { limit, skip },
      sort_by,
    });

    return response.pipe(toArray());
  }
}
