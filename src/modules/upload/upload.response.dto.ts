import { ApiProperty } from '@nestjs/swagger';
import { CustomBadRequestException } from 'src/common/exception';

export class UploadFileMissingExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Please upload a file' })
  message: string;

  constructor() {
    super('Please upload a file');
  }
}
