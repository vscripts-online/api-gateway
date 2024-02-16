import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'node:fs';
import * as stream from 'node:stream';
import { FileRepository } from './database/repository/file.repository';
import { StorageService } from './modules/storage/storage.service';
import { AccountRepository } from './database/repository/account.repository';
import { FileService } from './modules/file/file.service';
import { IFileSchema } from './database';
import { DEFAULT_ISEARCH, ISearch } from './common/type';

@Injectable()
export class AppService {
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
      throw new BadRequestException('Not found');
    }

    if (file.loading_from_cloud_now) {
      throw new Error('File is loading');
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

    return 'poıng';
  }

  async get_files(params: ISearch = DEFAULT_ISEARCH) {
    return this.fileRepository.get_files(params);
  }
}
