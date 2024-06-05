import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import type { Request } from 'express';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  @Inject(forwardRef(() => UploadService))
  private readonly uploadService: UploadService;

  createMulterOptions(): MulterModuleOptions {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      dest: './upload',
      async fileFilter(req: Request, file, callback) {
        const length = Number(req.headers['content-length']);
        const user = req['user'];
        const accept = await self.uploadService.file_filter_guard(length, user);
        const available = await self.uploadService.total_file_guard(length);

        req['file_not_allowed'] = accept;
        req['no_available_storage'] = available;

        callback(null, accept);
      },
    };
  }
}
