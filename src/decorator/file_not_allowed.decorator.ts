import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const File_Not_Allowed = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.file_not_allowed;
  },
);
