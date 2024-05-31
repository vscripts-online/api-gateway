import { Injectable } from '@nestjs/common';
import * as bytes from 'bytes';
import {
  AUTH_CLIENT_ID,
  AUTH_CLIENT_SECRET,
  AUTH_HOST_URI,
} from 'src/common/config';

interface IUserMetadata {
  admin?: boolean;
  total?: number;
  used?: number;
}

interface IGetMeResponse {
  status: boolean;
  user?: {
    avatar: string;
    email: string;
    has_password: boolean;
    id: number;
    name: string;
    role: 'USER' | 'ADMIN';
    metadata?: IUserMetadata;
  };
}

interface ISetMetadataFailResponse {
  status: false;
  message: string;
}

interface ISetMetadataSuccessResponse {
  user: {
    id: number;
    userId: number;
    appId: string;
    metadata: IUserMetadata;
  };
}

type SetMetadataResponse =
  | ISetMetadataFailResponse
  | ISetMetadataSuccessResponse;

@Injectable()
export class AuthService {
  async getMe(session: string) {
    const url = new URL(AUTH_HOST_URI + '/api/user/me');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);

    const response = await fetch(url, {
      headers: {
        cookie: `session=${session}`,
      },
    });

    const data: IGetMeResponse = await response.json();

    if (!data.status) {
      return false;
    }

    return data.user;
  }

  async setMetadata(id: number) {
    const url = new URL(AUTH_HOST_URI + '/api/app/user');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);
    url.searchParams.set('client_secret', AUTH_CLIENT_SECRET);
    url.searchParams.set('user', id + '');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ total: bytes('500mb'), used: 0 } as IUserMetadata),
    });

    const data: SetMetadataResponse = await response.json();

    if (!(data as ISetMetadataFailResponse).status) {
      return false;
    }

    return (data as ISetMetadataSuccessResponse).user.metadata;
  }
}
