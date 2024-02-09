import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { AccountTypes } from 'src/common/type';

export class NewAccountRequestDTO {
  @IsEnum(AccountTypes)
  type: AccountTypes;

  @IsOptional()
  @IsString()
  label: string;
}

export class AccountUpdateGoogleRequestDTO {
  @IsString()
  @Length(10)
  id: string;

  @IsString()
  @Length(10)
  client_id: string;

  @IsString()
  @Length(10)
  client_secret: string;
}
