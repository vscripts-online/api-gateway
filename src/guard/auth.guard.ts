import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import * as bytes from 'bytes';
import type { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(forwardRef(() => AuthService))
  private readonly authService: AuthService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const session = request.cookies.session;

    const user = await this.authService.getMe(session);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      user.metadata?.total === undefined ||
      user.metadata?.used === undefined
    ) {
      const new_metadata = { ...user.metadata, total: bytes('500mb'), used: 0 };

      const metadata = await this.authService.setMetadata(
        user.id,
        new_metadata,
      );
      if (!metadata) {
        return false;
      }

      user.metadata = metadata;
    }

    request['user'] = user;

    return true;
  }
}
