import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors, forwardRef } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as bytes from "bytes";
import { plainToClass } from 'class-transformer';
import { validateOrReject } from "class-validator";
import type { Response } from 'express';
import * as fs from 'node:fs';
import { AuthGuard } from "src/guard";
import { UploadBodyRequestDTO, UploadGetFileQueryDTO } from "./upload.request.dto";
import { UploadService } from "./upload.service";

@UseGuards(AuthGuard)
@Controller('/upload')
export class UploadController {
  @Inject((forwardRef(() => UploadService)))
  private readonly uploadService: UploadService

  @Post('/')
  @UseInterceptors(FileInterceptor('file', { dest: './upload' }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file)
      throw new BadRequestException('Please upload a file')

    let headers = []

    if (body.headers) {
      try {
        headers = JSON.parse(body.headers)
        const validated = plainToClass(UploadBodyRequestDTO, { headers })
        await validateOrReject(validated, { validationError: { target: false, value: false } })
      } catch (error) {
        fs.unlink('./upload/' + file.filename, err => err ? console.log(err) : void 0)
        throw new BadRequestException(error.message || error)
      }
    }

    return this.uploadService.upload(file, headers)
  }

  @Get('/file/:id')
  async get_file(@Res() res: Response, @Param('id') id: string, @Query() query: UploadGetFileQueryDTO) {
    let { start, end } = query
    start = Number(start)
    end = Number(end)

    if (end < 0 || end > bytes('100 mb'))
      throw new BadRequestException('End must be between 0 and 100mb')

    if (start < 0 || start > end)
      throw new BadRequestException('Start can not be less than end and must can not be negative')

    return this.uploadService.get_file(res, id, start, end)
  }
}