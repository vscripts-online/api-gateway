import { Metadata } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GrpcExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const err =
      exception.metadata instanceof Metadata
        ? new BadRequestException(exception['details'])
        : exception;

    try {
      httpAdapter.reply(ctx.getResponse(), err.getResponse(), err.getStatus());
    } catch (error) {
      console.log('INTERNAL ERROR', exception);
      httpAdapter.reply(
        ctx.getResponse(),
        new InternalServerErrorException().getResponse(),
        500,
      );
    }
  }
}
