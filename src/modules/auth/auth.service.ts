import { Injectable } from '@nestjs/common';
import { AUTH_CLIENT_ID, AUTH_HOST_URI } from 'src/common/config';

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

    const data = await response.json();

    if (!data.status) {
      return false;
    }

    return data.user;
  }
}
