import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import type { Response } from 'express';
import { nanoid } from 'nanoid';
import { IFileHeaderSchema } from 'src/database';
import { FileRepository } from 'src/database/repository/file.repository';
import { FileService } from '../file/file.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class UploadService {
  @Inject(forwardRef(() => FileRepository))
  private readonly fileRepository: FileRepository;

  @Inject(forwardRef(() => FileService))
  private readonly fileService: FileService;

  @Inject(forwardRef(() => QueueService))
  private readonly queueService: QueueService;

  private async createSlug() {
    const slug = nanoid(8);

    if (
      ['-', '_'].includes(slug[0]) ||
      ['-', '_'].includes(slug[slug.length - 1])
    ) {
      return this.createSlug();
    }

    const exists = await this.fileRepository.is_slug_exists(slug);
    if (exists) {
      return this.createSlug();
    }

    return slug;
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
    const slug = await this.createSlug();
    const file = await this.fileRepository.new_file({
      mime_type,
      name,
      original_name,
      size,
      slug,
      headers,
      parts: [],
    });
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
