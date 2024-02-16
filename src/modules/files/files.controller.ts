import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Res,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminGuard, AuthGuard } from 'src/guard';
import { FilesGetFilesRequestDTO } from './files.request.dto';
import { FilesService } from './files.service';
import {
  FilesGetFileResponseDocumentation,
  FilesGetFilesResponseDocumentation,
} from './files.swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@ApiTags('files')
@Controller('/files')
export class FilesController {
  @Inject(forwardRef(() => FilesService))
  private readonly filesService: FilesService;

  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @FilesGetFilesResponseDocumentation()
  @Get('/')
  async get_files(@Query() _params: any) {
    const params = plainToInstance(FilesGetFilesRequestDTO, _params, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
    await validateOrReject(params).catch((e) => {
      throw new BadRequestException(Array.isArray(e) ? e[0].constraints : e);
    });

    return this.filesService.get_files(params);
  }

  @Get('/:slug')
  @FilesGetFileResponseDocumentation()
  get_file(@Res() res: Response, @Param('slug') slug: string) {
    return this.filesService.get_file(res, slug);
  }
}
