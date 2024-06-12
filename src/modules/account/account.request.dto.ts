import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { AccountUpdateGoogleRequestDTO__Output } from 'pb/account/AccountUpdateGoogleRequestDTO';
import { NewAccountRequestDTO__Output } from 'pb/account/NewAccountRequestDTO';
import { AccountTypes } from 'src/common/type';

export class NewAccountRequestDTO implements NewAccountRequestDTO__Output {
  @ApiProperty({ example: AccountTypes.GOOGLE, enum: AccountTypes })
  @IsEnum(AccountTypes)
  type: AccountTypes;

  @ApiProperty({ example: 'example@gmail.com', required: false })
  @IsOptional()
  @IsString()
  label: string;

  @ApiProperty({
    example:
      '1017277025943-jjl670se9jabhdtira4jt9r8n5h2v1p7.apps.googleusercontent.com',
    minLength: 10,
  })
  @IsString()
  @Length(10)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  client_id: string;

  @ApiProperty({
    example: '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',
    minLength: 10,
  })
  @IsString()
  @Length(10)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  client_secret: string;
}

export class ObjectIdDTO {
  @ApiProperty({
    example: '65bf9bcf5f7af5dc2f037ab9',
    minLength: 10,
  })
  @IsMongoId()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  _id: string;
}

export class AccountUpdateGoogleRequestDTO
  extends ObjectIdDTO
  implements AccountUpdateGoogleRequestDTO__Output {}

export class AccountDeleteAccountDTO extends ObjectIdDTO {}

export class AccountGetAccountDTO extends ObjectIdDTO {}

export class AccountUpdateLabelDTO {
  @ApiProperty({ example: 'example@gmail.com', required: false })
  @IsOptional()
  @IsString()
  label: string;
}
