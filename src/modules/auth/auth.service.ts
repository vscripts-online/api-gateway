import { Injectable } from '@nestjs/common';
import {
  AUTH_CLIENT_ID,
  AUTH_CLIENT_SECRET,
  AUTH_HOST_URI,
} from 'src/common/config';

export interface IUserMetadata {
  admin?: boolean;
  total?: number;
  used?: number;
}

export interface IAuthUser {
  avatar: string;
  email: string;
  has_password: boolean;
  id: number;
  name: string;
  role: 'USER' | 'ADMIN';
  metadata?: IUserMetadata;
}

interface IGetMeResponse {
  status: boolean;
  user?: IAuthUser;
}

interface IFailResponse {
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

export interface IGetUsersUser {
  metadata: IUserMetadata;
  user: Pick<IAuthUser, 'avatar' | 'email' | 'id' | 'name'>;
  createdAt: string;
}

export interface IGetUsersResponse {
  users: IGetUsersUser[];
}

export interface IGetUsersUserResponse {
  user: IGetUsersUser | null;
}

type StatusResponse<T> = IFailResponse | T;

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

  async setMetadata(id: number, metadata: IUserMetadata, update = false) {
    const url = new URL(AUTH_HOST_URI + '/api/app/user');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);
    url.searchParams.set('client_secret', AUTH_CLIENT_SECRET);
    url.searchParams.set('user', id + '');

    const response = await fetch(url, {
      method: update ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    const data: StatusResponse<ISetMetadataSuccessResponse> =
      await response.json();

    if (!(data as IFailResponse).status) {
      return false;
    }

    return (data as ISetMetadataSuccessResponse).user.metadata;
  }

  async getUsers() {
    const url = new URL(AUTH_HOST_URI + '/api/app/user');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);
    url.searchParams.set('client_secret', AUTH_CLIENT_SECRET);

    const response = await fetch(url);

    const data = (await response.json()) as any;

    if (!(data as IFailResponse).status) {
      return [];
    }

    return (data as IGetUsersResponse).users;
  }

  async getUser(userId: number) {
    const url = new URL(AUTH_HOST_URI + '/api/app/user');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);
    url.searchParams.set('client_secret', AUTH_CLIENT_SECRET);
    url.searchParams.set('user', userId + '');

    const response = await fetch(url);

    const data = (await response.json()) as any;

    return (data as IGetUsersUserResponse).user;
  }
}
