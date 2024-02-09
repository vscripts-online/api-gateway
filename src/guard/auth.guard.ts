import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException, forwardRef, } from '@nestjs/common';
import type { Request } from 'express';
import { REDIS_NAMESPACES } from 'src/common/type';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(forwardRef(() => RedisService))
  private readonly redisService: RedisService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    let authorization = request.headers.authorization;
    if (!authorization)
      throw new UnauthorizedException('Authorization header required');

    if (!/Bearer [a-zA-Z\-\.0-9]*/.test(authorization))
      throw new UnauthorizedException('Authorization header format');

    authorization = authorization.slice(7)

    const [_id_b64, session] = authorization.split('|')
    const _id = Buffer.from(_id_b64, 'base64url').toString('hex')

    const valid = await this.redisService.exists(session, _id, REDIS_NAMESPACES.SESSION)
    if (valid)
      request['_id'] = _id;

    return true;
  }
}