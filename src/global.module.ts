import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { FILE_MS_GRPC_OPTIONS, QUEUE_MS_GRPC_OPTIONS } from './common/config';
import { FILE_MS_CLIENT, QUEUE_MS_CLIENT } from './common/config/constants';
import { AuthModule } from './modules/auth/auth.module';

const microservices = [
  ClientsModule.register([
    {
      name: FILE_MS_CLIENT,
      ...FILE_MS_GRPC_OPTIONS,
    },
  ]),
  ClientsModule.register([
    {
      name: QUEUE_MS_CLIENT,
      ...QUEUE_MS_GRPC_OPTIONS,
    },
  ]),
];

@Global()
@Module({
  imports: [...microservices, AuthModule],
  exports: [...microservices, AuthModule],
})
export class GlobalModule {}
