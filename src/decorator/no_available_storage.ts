import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const No_Available_Storage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.no_available_storage;
  },
);
