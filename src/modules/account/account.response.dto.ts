import { ApiProperty } from '@nestjs/swagger';
import { AccountTypes } from 'src/common/type';
import * as bytes from 'bytes';
import { CustomBadRequestException } from 'src/common/util';
import { TotalStorageResponse } from 'pb/account/TotalStorageResponse';

export class AccountNewAccountResponseDTO {
  @ApiProperty({ example: '65ce68bd88c3b9818dbbd690' })
  _id: string;

  @ApiProperty({ example: 0 })
  storage_size: number;

  @ApiProperty({ example: 0 })
  available_size: number;

  @ApiProperty({ example: AccountTypes.GOOGLE, enum: AccountTypes })
  type: string;

  @ApiProperty({ example: 'example@gmail.com' })
  label: string;

  @ApiProperty({ example: '2024-02-15T19:39:08.259Z' })
  time: string;
}

export class AccountLoginUrlGoogleResponseDTO {
  @ApiProperty({
    example:
      'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&include_granted_scopes=true&state=65bf9bcf5f7af5dc2f037ab9&response_type=code&client_id=1017277025943-jjl670se9jabhdtira4jt9r8n5h2v1p7.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback_google',
  })
  authUrl: string;
}

export class AccountLoginUrlGoogleInvalidIdExceptionDTO extends CustomBadRequestException {
  @ApiProperty({ example: 'Invalid id' })
  message: string;

  constructor() {
    super('Invalid id');
  }
}

export class AccountSyncSizeResponseDTO extends AccountNewAccountResponseDTO {
  @ApiProperty({ example: bytes('15 gb') })
  storage_size: number;

  @ApiProperty({ example: bytes('15 gb') })
  available_size: number;
}

export class TotalStorageResponseDTO implements TotalStorageResponse {
  @ApiProperty({ example: bytes('14 gb') + '' })
  available_storage: string;

  @ApiProperty({ example: bytes('15 gb') + '' })
  total_storage: string;

  @ApiProperty({ example: 1 })
  total_accounts: number;
}
