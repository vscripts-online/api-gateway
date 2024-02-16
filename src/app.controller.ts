import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { SearchRequestQueryParams } from './common/type';
import { AdminGuard, AuthGuard } from './guard';

@ApiTags('file')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get('/files')
  get_files(@Query() params: SearchRequestQueryParams) {
    return this.appService.get_files(params);
  }

  @Get('/file/:id')
  get_file(@Res() res: Response, @Param('id') id: string) {
    return this.appService.get_file(res, id);
  }
}
