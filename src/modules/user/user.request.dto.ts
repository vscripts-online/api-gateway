import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsAscii,
  IsEmail,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { UserChangePasswordFromForgotPasswordRequestDTO__Output } from 'pb/user/UserChangePasswordFromForgotPasswordRequestDTO';
import { UserChangePasswordRequestDTO__Output } from 'pb/user/UserChangePasswordRequestDTO';
import { UserForgotPasswordRequestDTO__Output } from 'pb/user/UserForgotPasswordRequestDTO';
import { UserRegisterRequestDTO__Output } from 'pb/user/UserRegisterRequestDTO';
import { IsNotEqualWith } from 'src/common/helper';
import { SearchRequestQueryParams } from 'src/common/util';

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

export class UserLoginRequestDTO implements UserRegisterRequestDTO__Output {
  @ApiPropertyEmail()
  @IsEmail()
  @Length(5, 320)
  email: string;

  @ApiPropertyPassword()
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

export class UserRegisterRequestDTO extends UserLoginRequestDTO {}

export class UserChangePasswordRequestDTO
  implements Omit<UserChangePasswordRequestDTO__Output, 'id'>
{
  @ApiPropertyPassword()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  @IsAscii()
  @Length(8, 40)
  current_password: string;

  @ApiPropertyPassword({
    example: 'Strong.Password2',
    description: 'Can not be equal with current password',
  })
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

export class UserForgotPasswordRequestDTO
  implements UserForgotPasswordRequestDTO__Output
{
  @ApiPropertyEmail()
  @IsEmail()
  @Length(5, 320)
  email: string;
}

export class UserChangePasswordFromForgotPasswordRequestDTO
  implements
    Omit<UserChangePasswordFromForgotPasswordRequestDTO__Output, 'id' | 'code'>
{
  @ApiProperty({
    minLength: 1,
  })
  @IsString()
  @Length(1)
  query: string;

  @ApiPropertyPassword()
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

export class UserGetFilesRequestDTO extends SearchRequestQueryParams {
  @ApiProperty({ example: 'suc0aNkQ', required: false })
  @Expose()
  slug?: string;
}

export class UserGetUsersRequestDTO extends SearchRequestQueryParams {}
