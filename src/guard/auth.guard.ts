import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import type { Request } from 'express';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(forwardRef(() => RedisService))
  private readonly redisService: RedisService;

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

    const [id_b64, session] = authorization.split('|');
    const id_str = Buffer.from(id_b64, 'base64url').toString('hex');
    const id = Number(id_str);

    const valid = await this.redisService.exists(id, session);

    if (valid) {
      request['_id'] = id;
    }

    return true;
  }
}
