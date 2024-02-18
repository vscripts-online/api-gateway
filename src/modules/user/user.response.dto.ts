import { ApiProperty } from '@nestjs/swagger';
import { CustomBadRequestException } from 'src/common/util';

export class UserSessionResponseDTO {
  @ApiProperty({ example: 'Zcon63hwvDO-wt7H|7BR4flOxTUv8yom6wGDXwQ' })
  session: string;
}

export class UserAlreadyExistsExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Email already exists' })
  message: string;

  constructor() {
    super('Email already exists');
  }
}

export class UserNotFoundExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'User not found' })
  message: string;

  constructor() {
    super('User not found');
  }
}

export class UserWrongPasswordExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Wrong Password' })
  message: string;

  constructor() {
    super('Wrong Password');
  }
}

export class UserForgotPasswordTooManyRequestExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Too many requests, please try again later' })
  message: string;

  constructor() {
    super('Too many requests, please try again later');
  }
}

export class UserForgotPasswordInvalidQueryExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Invalid query' })
  message: string;

  constructor() {
    super('Invalid query');
  }
}

export class UserForgotPasswordInvalidCodeExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Invalid code' })
  message: string;

  constructor() {
    super('Invalid code');
  }
}

export class UserResendEmailRequiredExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Resend email required' })
  message: string;

  constructor() {
    super('Resend email required');
  }
}

export class UserPasswordEqualityExceptionDTO extends CustomBadRequestException {
  @ApiProperty({
    example: 'New password can not be equal with current password',
  })
  message: string;

  constructor() {
    super('New password can not be equal with current password');
  }
}
