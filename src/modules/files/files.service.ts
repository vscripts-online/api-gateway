import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'node:fs';
import * as stream from 'node:stream';
import { AccountRepository, FileRepository, IFileSchema } from 'src/database';
import { FileService } from 'src/modules/file/file.service';
import { StorageService } from 'src/modules/storage/storage.service';
import { FilesGetFilesRequestDTO } from './files.request.dto';
import {
  FilesGetFileLoadingExceptionDTO,
  FilesGetFileNotFoundExceptionDTO,
} from './files.response.dto';
import { Types } from 'mongoose';

@Injectable()
export class FilesService {
  @Inject(forwardRef(() => FileRepository))
  private readonly fileRepository: FileRepository;

  @Inject(forwardRef(() => AccountRepository))
  private readonly accountRepository: AccountRepository;

  @Inject(forwardRef(() => StorageService))
  private readonly storageService: StorageService;

  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  async get_file_from_cloud(res: Response, file: IFileSchema) {
    await this.fileRepository.set_loading_from_cloud_now(file._id, true);
    const local_stream = fs.createWriteStream('./upload/' + file.name);
    const pass = new stream.PassThrough();
    pass.pipe(res);
    pass.pipe(local_stream);

    const sorted_file_parts = file.parts.sort((a, b) => a.offset - b.offset);
    for (const file_part of sorted_file_parts) {
      await new Promise(async (resolve, reject) => {
        const account = await this.accountRepository.get_account_by_id(
          file_part.owner as unknown as string,
        );
        const cloud_stream = await this.storageService.get_file_from_storage(
          account,
          file_part,
        );
        cloud_stream.on('data', (data) => pass.write(data));
        cloud_stream.on('error', (error) => {
          pass.end();
          reject(error);
        });
        cloud_stream.on('end', () => resolve(undefined));
      });
    }

    pass.end();
    return;
  }

  async get_file(res: Response, slug: string) {
    const file = await this.fileRepository.get_by_slug(slug);
    if (!file) {
      throw new FilesGetFileNotFoundExceptionDTO();
    }

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
        return this.get_file_from_cloud(res, file);
      } else {
        throw new InternalServerErrorException();
      }
    }

    file_stream.pipe(res);
    file_stream.on(
      'end',
      async () =>
        await this.fileRepository.set_loading_from_cloud_now(file._id, false),
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

    return this.fileRepository.get_files(params, { limit, skip }, sort_by);
  }
}
