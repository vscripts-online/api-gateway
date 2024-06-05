import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import { Types } from 'mongoose';
import * as stream from 'node:stream';
import { File__Output } from 'pb/file/File';
import { FileServiceHandlers } from 'pb/file/FileService';
import { firstValueFrom, from, toArray } from 'rxjs';
import { FILE_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';
import { FilesGetFilesRequestDTO } from './files.request.dto';

@Injectable()
export class FilesService {
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
    const file = await firstValueFrom(
      this.fileServiceMS.GetFiles({
        limit: { limit: 1 },
        where: { _id },
      }),
      { defaultValue: undefined },
    );

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

  async get_file_by_id(_id: string) {
    const response = this.fileServiceMS.GetFiles({
      where: { _id },
      limit: { limit: 1, skip: 0 },
    });

    const array = await response.pipe(toArray());
    const data = await firstValueFrom(from(array));
    return data[0];
  }
}
