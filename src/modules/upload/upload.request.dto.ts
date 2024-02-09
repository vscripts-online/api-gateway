import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsDefined, IsNotIn, IsNumberString, IsString, Length, ValidateNested } from 'class-validator';
import { EXCLUDE_HEADERS } from 'src/common/config';

export class UploadBodyRequestHeadersDTO {
  @IsString()
  @Transform((obj: TransformFnParams) => {
    if (typeof obj.value === 'string')
      return obj.value.toLowerCase().trim()
    return obj.value
  })
  @IsNotIn(EXCLUDE_HEADERS)
  @Length(1)
  key: string

  @IsString()
  @Length(1)
  value: string
}

export class UploadBodyRequestDTO {
  @ValidateNested({ each: true })
  @Type(() => UploadBodyRequestHeadersDTO)
  headers?: UploadBodyRequestHeadersDTO[]
}

export class UploadGetFileQueryDTO {
  @IsDefined()
  @IsNumberString({ no_symbols: true })
  start: number

  @IsDefined()
  @IsNumberString({ no_symbols: true })
  end: number
}