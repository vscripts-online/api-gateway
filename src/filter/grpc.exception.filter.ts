import { Metadata } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GrpcExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    if (exception.metadata instanceof Metadata) {
      const err = new BadRequestException(exception.details);
      httpAdapter.reply(ctx.getResponse(), err.getResponse(), err.getStatus());
    }
  }
}
