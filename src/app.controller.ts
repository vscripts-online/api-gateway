import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'node:fs';
import * as stream from 'node:stream';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/file/:id')
  get_file(@Res() res: Response, @Param('id') id: string) {
    return this.appService.get_file(res, id);
  }

  @Get('/test')
  async test(@Res() res: Response) {
    const local_stream = fs.createWriteStream('./upload/test');
    const pass = new stream.PassThrough();
    pass.pipe(res);
    pass.pipe(local_stream);

    const test1 = fs.createReadStream('./upload/test1.txt');
    const test2 = fs.createReadStream('./upload/test2.txt');
    const test3 = fs.createReadStream('./upload/test3.txt');

    const cloud_streams = [test1, test2, test3];
    for (const cloud_stream of cloud_streams) {
      await new Promise((resolve) => {
        cloud_stream.on('data', (data) => pass.write(data));
        cloud_stream.on('end', () => resolve(undefined));
      });
    }
    pass.end();

    console.log('ok');
  }
}
