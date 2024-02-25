import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ClientsModule } from '@nestjs/microservices';
import { SESSION_MS_CLIENT } from 'src/common/config/constants';
import { SESSION_MS_GRPC_OPTIONS } from 'src/common/config';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: SESSION_MS_CLIENT,
        ...SESSION_MS_GRPC_OPTIONS,
      },
    ]),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
