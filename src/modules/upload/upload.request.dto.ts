import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotIn,
  IsNumber,
  IsNumberString,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { EXCLUDE_HEADERS } from 'src/common/config/constants';

export class UploadBodyRequestHeadersDTO {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @Transform((obj: TransformFnParams) => {
    if (typeof obj.value === 'string') {
      return obj.value.toLowerCase().trim();
    }
    return obj.value;
  })
  @IsNotIn(EXCLUDE_HEADERS)
  @Length(1)
  key: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  value: string;
}

export class UploadBodyRequestDTO {
  @ApiProperty({
    type: UploadBodyRequestHeadersDTO,
    isArray: true,
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => UploadBodyRequestHeadersDTO)
  headers?: UploadBodyRequestHeadersDTO[];
}

export class UploadGetFileQueryDTO {
  @IsDefined()
  @IsNumberString({ no_symbols: true })
  start: number;

  @IsDefined()
  @IsNumberString({ no_symbols: true })
  end: number;
}

export class UploadAvailableDTO {
  @IsNumber()
  size: number;
}
