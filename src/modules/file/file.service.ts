import { Injectable } from "@nestjs/common";
import * as fs from 'node:fs';

@Injectable()
export class FileService {
  get_file(name: string, start: number, end: number): Promise<fs.ReadStream | Error> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream('upload/' + name, { start, end })
      stream.on('ready', () => resolve(stream))
      stream.on('error', error => resolve(error))
    })
  }
}