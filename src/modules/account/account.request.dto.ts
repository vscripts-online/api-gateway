import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { AccountTypes } from 'src/common/type';

export class NewAccountRequestDTO {
  @ApiProperty({ example: AccountTypes.GOOGLE, enum: AccountTypes })
  @IsEnum(AccountTypes)
  type: AccountTypes;

  @ApiProperty({ example: 'example@gmail.com', required: false })
  @IsOptional()
  @IsString()
  label: string;
}

export class AccountUpdateGoogleRequestDTO {
  @ApiProperty({
    example: '65bf9bcf5f7af5dc2f037ab9',
    minLength: 10,
  })
  @IsString()
  @Length(10)
  id: string;

  @ApiProperty({
    example:
      '1017277025943-jjl670se9jabhdtira4jt9r8n5h2v1p7.apps.googleusercontent.com',
    minLength: 10,
  })
  @IsString()
  @Length(10)
  client_id: string;

  @ApiProperty({
    example: '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',
    minLength: 10,
  })
  @IsString()
  @Length(10)
  client_secret: string;
}
