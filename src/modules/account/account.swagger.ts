import { NotFoundException, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { classToSwaggerJson } from 'src/common/util';
import {
  AccountLoginUrlGoogleInvalidIdExceptionDTO,
  AccountLoginUrlGoogleResponseDTO,
  AccountNewAccountResponseDTO,
  AccountSyncSizeResponseDTO,
  TotalStorageResponseDTO,
} from './account.response.dto';

export const AccountNewAccountResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new account' }),
    ApiResponse({
      status: 201,
      description: 'Returns created account data',
      type: AccountNewAccountResponseDTO,
    }),
  );

export const AccountLoginUrlGoogleResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get account new auth url' }),
    ApiResponse({
      status: 200,
      description: 'Returns account auth url',
      type: AccountLoginUrlGoogleResponseDTO,
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If id is not registered': {
              value:
                new AccountLoginUrlGoogleInvalidIdExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );

export const AccountSyncSizeResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Sync account available_size and storage_size' }),
    ApiResponse({
      status: 200,
      description: 'Returns account auth url',
      type: AccountSyncSizeResponseDTO,
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If id is not registered': {
              value: new NotFoundException().getResponse(),
            },
          },
        },
      },
    }),
  );

export const AccountGetAccountsResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get accounts' }),
    ApiResponse({
      status: 200,
      description: 'Returns accounts',
      type: AccountSyncSizeResponseDTO,
      isArray: true,
    }),
  );

export const AccountDeleteAccountResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete account' }),
    ApiResponse({
      status: 200,
      content: {
        'application/json': {
          examples: {
            'If successful': {
              value: classToSwaggerJson(AccountSyncSizeResponseDTO),
            },
            'If its not successfull (empty response)': {
              value: '',
            },
          },
        },
      },
    }),
  );

export const AccountTotalStorageResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get total storage' }),
    ApiResponse({
      status: 200,
      content: {
        'application/json': {
          examples: {
            'If successful': {
              value: classToSwaggerJson(TotalStorageResponseDTO),
            },
          },
        },
      },
    }),
  );
