import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'src/common/config';

@Injectable()
export class PrivateGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    let authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('Authorization header required');
    }

    if (!/Bearer [a-zA-Z\-\.0-9]*/.test(authorization)) {
      throw new UnauthorizedException('Authorization header format');
    }

    authorization = authorization.slice(7);

    return !!jwt.verify(authorization, JWT_SECRET);
  }
}
