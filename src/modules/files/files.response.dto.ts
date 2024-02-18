import { ApiProperty } from '@nestjs/swagger';
import { CustomBadRequestException } from 'src/common/util';

export class FilesGetFileNotFoundExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'File not found' })
  message: string;

  constructor() {
    super('File not found');
  }
}

export class FilesGetFileLoadingExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'File is loading' })
  message: string;

  constructor() {
    super('File is loading');
  }
}

export class FilesGetFilesResponseDTO {
  @ApiProperty({ example: '65ce68bd88c3b9818dbbd690' })
  _id: string;

  @ApiProperty({ example: '2024-02-06T16:09:55.563Z' })
  time: string;

  @ApiProperty({ example: 'dbe6cc3ab3c636e825df33dc9815e79b' })
  name: string;

  @ApiProperty({ example: 'Ruel - Face To Face (Official Video).mp4' })
  original_name: string;

  @ApiProperty({ example: 'video/mp4' })
  mime_type: string;

  @ApiProperty({ example: 27156162 })
  size: number;

  @ApiProperty({ example: 'Zu8vFFzb' })
  slug: string;

  @ApiProperty({
    example: [{ key: 'content-type', value: 'application/json' }],
  })
  headers: { key: string; value: string }[];

  @ApiProperty({
    example: [
      {
        owner: '65bf9927d638b6736e0037dc',
        name: 'ffb185daf164738eaecd918901d87722',
        offset: 0,
        size: 27156162,
        id: '1ZdUgie1V2TfP9RYRkQ881VX7wgf2LGhS',
        uploaded_size: 0,
      },
    ],
  })
  parts: {
    owner: string;
    name: string;
    offset: number;
    size: number;
    id: string;
  }[];

  @ApiProperty({ example: false })
  loading_from_cloud_now: boolean;
}
