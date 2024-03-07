import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import * as bytes from 'bytes';
import { SearchRequestQueryParams } from 'src/common/util';

export class FilesGetFilesRequestDTO extends SearchRequestQueryParams {
  @ApiProperty({ example: '65c2589d8fe830a23156b85e', required: false })
  @Expose()
  _id?: string;

  @ApiProperty({ example: 'suc0aNkQ', required: false })
  @Expose()
  slug?: string;

  @ApiProperty({ example: 'ffb185daf164738eaecd918901d87722', required: false })
  @Expose()
  name?: string;

  @ApiProperty({ example: bytes('100mb'), required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Expose()
  size_gte?: number;

  @ApiProperty({ example: bytes('100mb'), required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Expose()
  size_lte?: number;

  @ApiProperty({ example: 'video/mp4', required: false })
  @Expose()
  mime_type?: string;

  @ApiProperty({ example: 'content-type', required: false })
  @Expose()
  headers_key?: string;

  @ApiProperty({ example: 'text/html', required: false })
  @Expose()
  headers_value?: string;

  @ApiProperty({ example: '65bf9927d638b6736e0037dc', required: false })
  @Expose()
  owner?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  @Transform((e) => {
    if (e.value === 'true') {
      return true;
    }

    if (e.value === 'false') {
      return false;
    }

    return undefined;
  })
  @Expose()
  loading_from_cloud_now?: boolean;

  @ApiProperty({ example: '-_id size', required: false })
  @Expose()
  sort_by?: string;

  @ApiProperty({ example: 1, required: false })
  @Expose()
  user?: number;

  @ApiProperty({ example: '2024-02-04T22:23:07.165Z', required: false })
  @IsOptional()
  @IsDateString()
  @Expose()
  created_at_lte?: string;

  @ApiProperty({ example: '2024-02-04T22:23:07.165Z', required: false })
  @IsOptional()
  @IsDateString()
  @Expose()
  created_at_gte?: string;

  @ApiProperty({ example: '2024-02-04T22:23:07.165Z', required: false })
  @IsOptional()
  @IsDateString()
  @Expose()
  updated_at_lte?: string;

  @ApiProperty({ example: '2024-02-04T22:23:07.165Z', required: false })
  @IsOptional()
  @IsDateString()
  @Expose()
  updated_at_gte?: string;
}
