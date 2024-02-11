import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/file/:id')
  get_file(@Res() res: Response, @Param('id') id: string) {
    return this.appService.get_file(res, id);
  }
}
