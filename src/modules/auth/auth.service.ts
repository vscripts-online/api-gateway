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
  count: number;
}

type StatusResponse<T> = IFailResponse | T;

type GetUsersParams = {
  limit?: number;
  skip?: number;
  user?: number;
  metadata?: any;
  created_at_gte?: string;
  created_at_lte?: string;
  name?: string;
  email?: string;
  sort?: string;
};

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

  async getUsers(params: GetUsersParams) {
    const {
      created_at_gte,
      created_at_lte,
      email,
      limit,
      metadata,
      name,
      skip,
      sort,
      user,
    } = params;

    const url = new URL(AUTH_HOST_URI + '/api/app/user');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);
    url.searchParams.set('client_secret', AUTH_CLIENT_SECRET);

    url.searchParams.set('limit', (limit || 20) + '');
    url.searchParams.set('skip', (skip || 0) + '');

    created_at_gte &&
      url.searchParams.set(
        'created_at_gte',
        new Date(created_at_gte).toISOString(),
      );

    created_at_lte &&
      url.searchParams.set(
        'created_at_lte',
        new Date(created_at_lte).toISOString(),
      );

    email && url.searchParams.set('email', email);
    name && url.searchParams.set('name', name);
    user && url.searchParams.set('user', user + '');
    metadata && url.searchParams.set('metadata', JSON.stringify(metadata));

    if (sort) {
      const desc = sort[0] === '-' ? 'desc' : undefined;
      const key = desc ? sort.slice(1) : sort;
      const value = desc || 'asc';

      const _sort = { [key]: value };

      url.searchParams.set('sort', JSON.stringify(_sort));
    }

    const response = await fetch(url);

    const data = (await response.json()) as any;

    // if (!(data as IFailResponse).status) {
    //   return [];
    // }

    return data as IGetUsersResponse;
  }

  async getUser(userId: number, limit = 1, skip = 0) {
    const url = new URL(AUTH_HOST_URI + '/api/app/user');
    url.searchParams.set('client_id', AUTH_CLIENT_ID);
    url.searchParams.set('client_secret', AUTH_CLIENT_SECRET);
    url.searchParams.set('user', userId + '');
    url.searchParams.set('limit', limit + '');
    url.searchParams.set('skip', skip + '');

    const response = await fetch(url);

    const data = (await response.json()) as any;

    return (data as IGetUsersResponse).users[0];
  }
}
