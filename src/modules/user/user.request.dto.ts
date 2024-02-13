import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import {
  IsAscii,
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { IsNotEqualWith } from 'src/common/util';

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

export class UserLoginRequestDTO {
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

export class UserRegisterRequestDTO extends UserLoginRequestDTO {
  @ApiPropertyOptional({
    example: null,
    description:
      'When the application is first run, if there is no admin user, it prints admin_key' +
      ' to the console. The user who registers with this key is registered as admin.',
  })
  @IsOptional()
  @IsString()
  admin_key: string;
}

export class UserChangePasswordRequestDTO {
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

export class UserForgotPasswordRequestDTO {
  @ApiPropertyEmail()
  @IsEmail()
  @Length(5, 320)
  email: string;
}

export class UserChangePasswordFromForgotPasswordRequestDTO {
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
