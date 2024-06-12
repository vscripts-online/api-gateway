import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import type { Response } from 'express';
import { AdminGuard, AuthGuard } from 'src/guard';
import {
  FileUpdateFileRequestDTO,
  FilesGetFilesRequestDTO,
} from './files.request.dto';
import { FilesService } from './files.service';
import {
  // FilesGetFileResponseDocumentation,
  FilesGetFilesResponseDocumentation,
} from './files.swagger';

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
    await validateOrReject(params);

    return this.filesService.get_files(params);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('/file/:_id')
  get_file_by_id(@Param('_id') _id: string) {
    return this.filesService.get_file_by_id(_id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Put('/file/:_id')
  update_file_by_id(
    @Param('_id') _id: string,
    @Body() body: FileUpdateFileRequestDTO,
  ) {
    return this.filesService.update_file_by_id(_id, body);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('/file/:_id')
  delete_file_by_id(@Param('_id') _id: string) {
    return this.filesService.delete_file_by_id(_id);
  }

  @Get('/:_id')
  get_file(@Res() res: Response, @Param('_id') _id: string) {
    return this.filesService.get_file(res, _id);
  }
}
