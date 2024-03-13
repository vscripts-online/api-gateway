import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bytes from 'bytes';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import type { Response } from 'express';
import * as fs from 'node:fs';
import { AuthGuard } from 'src/guard';
import {
  UploadBodyRequestDTO,
  UploadGetFileQueryDTO,
} from './upload.request.dto';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { PrivateGuard } from 'src/guard/private.guard';
import { UploadResponseDocumentation } from './upload.swagger';
import { UploadFileMissingExceptionDTO } from './upload.response.dto';
import { File_Not_Allowed, User_Id } from 'src/decorator';

@UseGuards(AuthGuard)
@ApiTags('upload')
@Controller('/upload')
export class UploadController {
  @Inject(forwardRef(() => UploadService))
  private readonly uploadService: UploadService;

  @UseGuards(AuthGuard)
  @Post('/')
  @ApiBearerAuth()
  @UploadResponseDocumentation()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @File_Not_Allowed() allowed: boolean,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @User_Id() id: number,
  ) {
    if (!allowed) {
      throw new BadRequestException(
        'You have reached your storage limit. Please upload a smaller file.',
      );
    }

    if (!file) {
      throw new UploadFileMissingExceptionDTO();
    }

    let headers = [];

    if (body.headers) {
      try {
        headers = JSON.parse(body.headers);
        const validated = plainToClass(UploadBodyRequestDTO, { headers });
        await validateOrReject(validated, {
          validationError: { target: false, value: false },
        });
      } catch (error) {
        fs.unlink('./upload/' + file.filename, (err) =>
          err ? console.log(err) : void 0,
        );
        throw new BadRequestException(error.message || error);
      }
    }

    return this.uploadService.upload(
      id,
      file,
      headers,
      body.file_name || file.originalname,
    );
  }

  @UseGuards(PrivateGuard)
  @ApiExcludeEndpoint()
  @Get('/file/:id')
  async get_file(
    @Res() res: Response,
    @Param('id') id: string,
    @Query() query: UploadGetFileQueryDTO,
  ) {
    let { start, end } = query;
    start = Number(start);
    end = Number(end);

    const between = end - start;

    if (between < 0 || between > bytes('100 mb') - 1) {
      throw new BadRequestException(
        'You cannot request more than 100 megabytes of data',
      );
    }

    if (start < 0 || start > end) {
      throw new BadRequestException(
        'Start can not be less than end and must can not be negative',
      );
    }

    return this.uploadService.get_file(res, id, start, end);
  }
}
