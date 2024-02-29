import {
  BadRequestException,
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
import { Account__Output } from 'pb/account/Account';
import { AccountServiceHandlers } from 'pb/account/AccountService';
import { File__Output } from 'pb/file/File';
import { FileServiceHandlers } from 'pb/file/FileService';
import { BytesValue } from 'pb/google/protobuf/BytesValue';
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
  private accountServiceMS: GrpcService<AccountServiceHandlers>;

  onModuleInit() {
    this.fileServiceMS = this.client.getService('FileService');
    this.accountServiceMS = this.client.getService('AccountService');
  }

  async get_file_from_cloud(res: Response, file: File__Output) {
    await firstValueFrom(
      this.fileServiceMS.SetLoading({
        _id: file._id,
        loading_from_cloud_now: true,
      }),
    );

    const sorted_file_parts =
      file.parts?.sort((a, b) => a.offset - b.offset) || [];

    if (sorted_file_parts.length === 0) {
      throw new BadRequestException('File lost');
    }

    const local_stream = fs.createWriteStream('./upload/' + file.name);
    const pass = new stream.PassThrough();
    pass.pipe(res);
    pass.pipe(local_stream);

    for (const file_part of sorted_file_parts) {
      await new Promise(async (resolve, reject) => {
        const account = (await firstValueFrom(
          this.accountServiceMS.GetAccount({
            value: file_part.owner,
          }),
        )) as Account__Output;

        const cloud_stream = await this.fileServiceMS.GetFileFromStorage({
          account,
          part: file_part,
        });

        cloud_stream.subscribe({
          next({ value }: BytesValue) {
            pass.write(value);
          },
          error(error: any) {
            pass.end();
            reject(error);
          },
          complete() {
            resolve(undefined);
          },
        });

        // const cloud_stream = await this.storageService.get_file_from_storage(
        //   account,
        //   file_part,
        // );

        // cloud_stream.on('data', (data) => pass.write(data));
        // cloud_stream.on('error', (error) => {
        //   pass.end();
        //   reject(error);
        // });
        // cloud_stream.on('end', () => resolve(undefined));
      });
    }
    pass.end();
    return;
  }

  async get_file(res: Response, slug: string) {
    const response = this.fileServiceMS.GetBySlug({ slug });
    const file = await firstValueFrom(response);

    if (file.loading_from_cloud_now) {
      throw new FilesGetFileLoadingExceptionDTO();
    }

    for (const { key, value } of file.headers || []) {
      res.set(key, value);
    }

    const file_stream = await this.fileService.get_file(
      file.name,
      0,
      file.size,
    );

    if (file_stream instanceof Error) {
      if (file_stream.message.includes('no such file or directory')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return this.get_file_from_cloud(res, file);
      } else {
        throw new InternalServerErrorException();
      }
    }

    file_stream.pipe(res);
    file_stream.on(
      'end',
      async () =>
        await this.fileServiceMS.SetLoading({
          _id: file._id,
          loading_from_cloud_now: false,
        }),
    );
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

    if (params.time_gte) {
      params['time'] = { $gte: params.time_gte };
      delete params.time_gte;
    }

    if (params.time_lte) {
      params['time'] = { ...params['time'], $lte: params.time_lte };
      delete params.time_lte;
    }

    const sort_by = params.sort_by;
    delete params.sort_by;

    const response = this.fileServiceMS.GetFiles({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      where: params,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      limit: { limit, skip },
      sort_by,
    });

    return response.pipe(toArray());
  }
}
