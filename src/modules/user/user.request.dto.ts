import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import * as bytes from 'bytes';
import { Expose, Type } from 'class-transformer';
import {
  IsISO8601,
  IsJSON,
  IsNumber,
  IsNumberString,
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

export class UserGetUsersRequestDTO extends SearchRequestQueryParams {
  @ApiProperty({ example: '-createdAt', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  sort?: string;

  @ApiProperty({ example: 'ISO Date', required: false })
  @IsOptional()
  @IsISO8601()
  @Expose()
  created_at_gte?: string;

  @ApiProperty({ example: 'ISO Date', required: false })
  @IsOptional()
  @IsISO8601()
  @Expose()
  created_at_lte?: string;

  @ApiProperty({ example: 'email', required: false })
  @IsOptional()
  @IsString()
  @Expose()
  email?: string;

  @ApiProperty({ example: 'name', required: false })
  @IsOptional()
  @IsString()
  @Expose()
  name?: string;

  @ApiProperty({ example: 'user', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Expose()
  user?: number;

  @ApiProperty({ example: 'ISO DATE', required: false })
  @IsOptional()
  @IsJSON()
  @Expose()
  // @Type(() => JSON.parse)
  metadata?: any;
}

export class UserGetFilesRequestDTO extends SearchRequestQueryParams {
  @ApiProperty({ example: 'mongo_id', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  _id?: string;

  @ApiProperty({ example: 'name', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  name?: string;

  @ApiProperty({ example: 'mime_type', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  mime_type?: string;

  @ApiProperty({ example: 'original_name', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  original_name?: string;

  @ApiProperty({ example: 'file_name', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  file_name?: string;

  @ApiProperty({ example: 'created_at_gte', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  created_at_gte?: string;

  @ApiProperty({ example: 'created_at_lte', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  created_at_lte?: string;

  @ApiProperty({ example: 'updated_at_gte', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  updated_at_gte?: string;

  @ApiProperty({ example: 'updated_at_lte', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  updated_at_lte?: string;

  @ApiProperty({ example: 'size_gte', required: false })
  @IsOptional()
  @IsNumberString()
  @Expose()
  size_gte?: string;

  @ApiProperty({ example: 'size_lte', required: false })
  @IsOptional()
  @IsNumberString()
  @Expose()
  size_lte?: string;

  @ApiProperty({ example: 'sortBy', required: false })
  @IsOptional()
  @IsString()
  @Length(1)
  @Expose()
  sortBy?: string;
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
