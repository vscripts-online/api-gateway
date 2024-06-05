import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import * as bytes from 'bytes';
import { Expose, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { UpdateFileRequestDTO__Output } from 'pb/file/UpdateFileRequestDTO';
import { SearchRequestQueryParams } from 'src/common/util';
import { UploadBodyRequestHeadersDTO } from '../upload/upload.request.dto';

export const ApiPropertyPassword = (options: ApiPropertyOptions = {}) => {
  const default_options = {
    example: 'Strong.Password1',
    minLength: 8,
    maxLength: 40,
    description:
      'Password must contain at least 1 lowercase, 1 uppercase, and 1 numeric character.',
  };
  return applyDecorators(ApiProperty({ ...default_options, ...options }));
};

export const ApiPropertyEmail = (options: ApiPropertyOptions = {}) => {
  const default_options = {
    example: 'email@example.com',
    minLength: 5,
    maxLength: 320,
  };
  return applyDecorators(ApiProperty({ ...default_options, ...options }));
};

export class UserGetFilesRequestDTO extends SearchRequestQueryParams {
  @ApiProperty({ example: 'suc0aNkQ', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  slug?: string;
}

export class UpdateTotalRequestDTO {
  @ApiProperty({ example: bytes('1gb'), required: true })
  @IsNumber()
  size: number;
}

export class UserUpdateUserFilesRequestDTO
  implements Omit<UpdateFileRequestDTO__Output, 'user' | '_id'>
{
  @ApiProperty({
    type: UploadBodyRequestHeadersDTO,
    isArray: true,
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => UploadBodyRequestHeadersDTO)
  headers: UploadBodyRequestHeadersDTO[];

  @ApiProperty({ example: 'file.mp4', required: true })
  @IsString()
  file_name: string;
}
