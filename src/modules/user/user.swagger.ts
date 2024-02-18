import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  UserAlreadyExistsExceptionDTO,
  UserForgotPasswordInvalidCodeExceptionDTO,
  UserForgotPasswordInvalidQueryExceptionDTO,
  UserForgotPasswordTooManyRequestExceptionDTO,
  UserNotFoundExceptionDTO,
  UserPasswordEqualityExceptionDTO,
  UserResendEmailRequiredExceptionDTO,
  UserSessionResponseDTO,
  UserWrongPasswordExceptionDTO,
} from './user.response.dto';

export const UserRegisterResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiResponse({
      status: 201,
      description: 'Returns token',
      type: UserSessionResponseDTO,
    }),
    ApiResponse({
      status: 400,
      description: 'If email already exists',
      type: UserAlreadyExistsExceptionDTO,
    }),
  );

export const UserLoginResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiExtraModels(UserNotFoundExceptionDTO, UserWrongPasswordExceptionDTO),
    ApiResponse({
      status: 200,
      description: 'Returns token',
      type: UserSessionResponseDTO,
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If passwords do not matches': {
              value: new UserWrongPasswordExceptionDTO().getResponse(),
            },
            'If email is not registered': {
              value: new UserNotFoundExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );

export const UserChangePasswordResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Change user password' }),
    ApiExtraModels(UserNotFoundExceptionDTO, UserWrongPasswordExceptionDTO),
    ApiResponse({
      status: 200,
      description: 'Returns token',
      type: UserSessionResponseDTO,
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If passwords do not matches': {
              value: new UserWrongPasswordExceptionDTO().getResponse(),
            },
            'If email is not registered': {
              value: new UserNotFoundExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );

export const UserForgotPasswordResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'User forgot password requests' }),
    ApiExtraModels(
      UserNotFoundExceptionDTO,
      UserForgotPasswordTooManyRequestExceptionDTO,
    ),
    ApiResponse({
      status: 200,
      description:
        'Returns whether the mail has been added to the sending queue',
      type: Boolean,
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If email is not registered': {
              value: new UserNotFoundExceptionDTO().getResponse(),
            },
            'If more than 3 requests have been sent in the last 24 hours': {
              value:
                new UserForgotPasswordTooManyRequestExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );

export const UserChangePasswordFromForgotResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Change user password' }),
    ApiExtraModels(
      UserForgotPasswordInvalidQueryExceptionDTO,
      UserNotFoundExceptionDTO,
      UserResendEmailRequiredExceptionDTO,
      UserForgotPasswordInvalidCodeExceptionDTO,
      UserPasswordEqualityExceptionDTO,
    ),
    ApiResponse({
      status: 200,
      description: 'Returns token',
      type: UserSessionResponseDTO,
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If query is invalid': {
              value:
                new UserForgotPasswordInvalidQueryExceptionDTO().getResponse(),
            },
            'If email is not registered': {
              value: new UserNotFoundExceptionDTO().getResponse(),
            },
            'If the code was entered incorrectly 3 times': {
              value: new UserResendEmailRequiredExceptionDTO().getResponse(),
            },
            'If the code was incorrect': {
              value:
                new UserForgotPasswordInvalidCodeExceptionDTO().getResponse(),
            },
            'If the old password and new password is same': {
              value: new UserPasswordEqualityExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );
