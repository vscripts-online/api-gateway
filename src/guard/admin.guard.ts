import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import type { Request } from 'express';
import { UserServiceHandlers } from 'pb/user/UserService';
import { firstValueFrom } from 'rxjs';
import { USER_MS_CLIENT } from 'src/common/config/constants';
import { GrpcService } from 'src/common/type';

@Injectable()
export class AdminGuard implements CanActivate {
  @Inject(forwardRef(() => USER_MS_CLIENT))
  private readonly client: ClientGrpc;

  private userService: GrpcService<UserServiceHandlers>;

  onModuleInit() {
    this.userService = this.client.getService('UserService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const id = request['_id'];

    const is_admin = await firstValueFrom(
      this.userService.IsAdmin({ value: id }),
    );

    return is_admin.value;
  }
}
