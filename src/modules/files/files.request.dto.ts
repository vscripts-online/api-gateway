import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  UserGetFilesRequestDTO,
  UserUpdateUserFilesRequestDTO,
} from '../user/user.request.dto';
import { IsNumber } from 'class-validator';

export class FilesGetFilesRequestDTO extends UserGetFilesRequestDTO {
  @ApiProperty({ example: 1, required: false })
  @Expose()
  user?: number;
}

export class FileUpdateFileRequestDTO extends UserUpdateUserFilesRequestDTO {
  @ApiProperty({ example: 'User Id', required: true })
  @IsNumber()
  user: number;
}
