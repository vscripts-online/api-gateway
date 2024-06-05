import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import * as bytes from 'bytes';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import type { Response } from 'express';
import * as fs from 'node:fs';
import { AuthUser, File_Not_Allowed } from 'src/decorator';
import { AuthGuard } from 'src/guard';
import { PrivateGuard } from 'src/guard/private.guard';
import { IAuthUser } from '../auth/auth.service';
import {
  UploadAvailableDTO,
  UploadBodyRequestDTO,
  UploadGetFileQueryDTO,
} from './upload.request.dto';
import { UploadFileMissingExceptionDTO } from './upload.response.dto';
import { UploadService } from './upload.service';
import { UploadResponseDocumentation } from './upload.swagger';
import { No_Available_Storage } from 'src/decorator/no_available_storage';

@ApiTags('upload')
@Controller('/upload')
export class UploadController {
  @Inject(forwardRef(() => UploadService))
  private readonly uploadService: UploadService;

  @UseGuards(AuthGuard)
  @Post('/available')
  @ApiBearerAuth()
  async available(@Body() body: UploadAvailableDTO) {
    return this.uploadService.total_file_guard(body.size);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  @ApiBearerAuth()
  @UploadResponseDocumentation()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @File_Not_Allowed() allowed: boolean,
    @No_Available_Storage() no_available_storage: boolean,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @AuthUser() user: IAuthUser,
  ) {
    if (!allowed) {
      throw new BadRequestException(
        'You have reached your storage limit. Please upload a smaller file.',
      );
    }

    if (!no_available_storage) {
      throw new BadRequestException(
        'There is no space in storage. Try again later',
      );
    }

    if (!file) {
      throw new UploadFileMissingExceptionDTO();
    }

    console.log('NEW UPLOAD');

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
      user,
      file,
      headers,
      body.file_name || file.originalname,
    );
  }

  @UseGuards(PrivateGuard)
  @ApiExcludeEndpoint()
  @Get('/file/:_id')
  async get_file(
    @Res() res: Response,
    @Param('_id') _id: string,
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

    return this.uploadService.get_file(res, _id, start, end);
  }

  @UseGuards(PrivateGuard)
  @ApiExcludeEndpoint()
  @Delete('/file/:_id')
  async del_file(@Param('_id') _id: string) {
    return this.uploadService.del_file(_id);
  }
}
