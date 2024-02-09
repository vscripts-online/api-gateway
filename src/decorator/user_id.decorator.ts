import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User_Id = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request._id;
  },
);