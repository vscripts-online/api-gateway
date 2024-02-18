import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  FilesGetFileLoadingExceptionDTO,
  FilesGetFileNotFoundExceptionDTO,
  FilesGetFilesResponseDTO,
} from './files.response.dto';
import { classToSwaggerJson } from 'src/common/util';
import { FilesGetFilesRequestDTO } from './files.request.dto';

export const FilesGetFileResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get file by slug' }),
    ApiResponse({
      status: 200,
      content: {
        'application/json': {
          examples: {
            'If correct slug': {
              value: '[File Binary Data]',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If slug is not exists': {
              value: new FilesGetFileNotFoundExceptionDTO().getResponse(),
            },
            'If file is loading from cloud right now': {
              value: new FilesGetFileLoadingExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );

export const FilesGetFilesResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Advenced search files' }),
    ApiQuery({ type: FilesGetFilesRequestDTO }),
    ApiResponse({
      status: 200,
      content: {
        'application/json': {
          examples: {
            successful: {
              value: [classToSwaggerJson(FilesGetFilesResponseDTO)],
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If query validation failed example: size_gte passed as string value':
              {
                value: {
                  min: 'size_gte must not be less than 0',
                  isInt: 'size_gte must be an integer number',
                },
              },
          },
        },
      },
    }),
  );
