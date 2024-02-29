import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from 'src/modules/session/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(forwardRef(() => SessionService))
  private readonly sessionService: SessionService;

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

    const [id_radix_36, session] = authorization.split('|');
    const id = parseInt(id_radix_36, 36);

    const valid = await this.sessionService.exists(id, session);

    if (valid) {
      request['_id'] = id;
    }

    return true;
  }
}
