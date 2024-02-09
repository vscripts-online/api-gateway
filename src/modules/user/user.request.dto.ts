import {
  IsAscii,
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { IsNotEqualWith } from 'src/common/util';

export class UserRegisterRequestDTO {
  @IsEmail()
  @Length(5, 320)
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  @IsAscii()
  @Length(8, 40)
  password: string;

  @IsOptional()
  @IsString()
  admin_key: string;
}

export class UserLoginRequestDTO extends UserRegisterRequestDTO {}

export class UserChangePasswordRequestDTO {
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  @IsAscii()
  @Length(8, 40)
  current_password: string;

  @IsNotEqualWith('current_password', {
    message: 'New password can not be equal with current password',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  @IsAscii()
  @Length(8, 40)
  password: string;
}

export class UserForgotPasswordRequestDTO {
  @IsEmail()
  @Length(5, 320)
  email: string;
}

export class UserChangePasswordFromForgotPasswordRequestDTO {
  @IsString()
  @Length(1)
  query: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  @IsAscii()
  @Length(8, 40)
  password: string;
}
