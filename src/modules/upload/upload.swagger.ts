import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadFileMissingExceptionDTO } from './upload.response.dto';

export const UploadResponseDocumentation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Upload a new file' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          headers: {
            type: 'string',
            format: 'json',
            example: '[{ key: "content-type", value: "application/json" }]',
            description: 'schema: UploadBodyRequestDTO',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      content: {
        'application/json': {
          examples: {
            'If file is not given': {
              value: new UploadFileMissingExceptionDTO().getResponse(),
            },
          },
        },
      },
    }),
  );
