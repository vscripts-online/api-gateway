import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export class FileService {
  async get_file_length(name: string): Promise<number | undefined> {
    try {
      const stat = await fs.promises.stat('upload/' + name);
      return stat.size;
    } catch (error) {
      return undefined;
    }
  }

  get_file(
    name: string,
    start: number,
    end: number,
  ): Promise<fs.ReadStream | Error> {
    return new Promise((resolve) => {
      const stream = fs.createReadStream('upload/' + name, { start, end });
      stream.on('ready', () => resolve(stream));
      stream.on('error', (error) => resolve(error));
    });
  }

  delete_file(name: string) {
    try {
      fs.unlinkSync('upload/' + name);
    } catch (error) {}
  }
}
