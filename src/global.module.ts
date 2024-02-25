import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { SESSION_MS_CLIENT, USER_MS_CLIENT } from './common/config/constants';
import { SESSION_MS_GRPC_OPTIONS, USER_MS_GRPC_OPTIONS } from './common/config';

const microservices = [
  ClientsModule.register([
    {
      name: USER_MS_CLIENT,
      ...USER_MS_GRPC_OPTIONS,
    },
  ]),
  ClientsModule.register([
    {
      name: SESSION_MS_CLIENT,
      ...SESSION_MS_GRPC_OPTIONS,
    },
  ]),
];

@Global()
@Module({
  imports: microservices,
  exports: microservices,
})
export class GlobalModule {}
