import { CanActivate, ExecutionContext, Inject, Injectable, forwardRef } from '@nestjs/common';
import type { Request } from 'express';
import { AccountRepository, UserRepository } from 'src/database';

@Injectable()
export class AdminGuard implements CanActivate {
  @Inject(forwardRef(() => UserRepository))
  private readonly userRepository: UserRepository

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const _id = request['_id'];

    const user = await this.userRepository.find_one_by_id(_id)
    return user.admin;
  }
}