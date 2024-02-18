import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class CustomBadRequestException extends BadRequestException {
  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  constructor(message: string) {
    super(message);
  }
}

export class SearchRequestQueryParams {
  @ApiProperty({ example: 20, minLength: 0, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  skip: number;

  @ApiProperty({ example: 20, minLength: 0, required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  limit: number;
}
