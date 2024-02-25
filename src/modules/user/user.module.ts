import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientsModule } from '@nestjs/microservices';
import { USER_MS_CLIENT } from 'src/common/config/constants';
import { USER_MS_GRPC_OPTIONS } from 'src/common/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_MS_CLIENT,
        ...USER_MS_GRPC_OPTIONS,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
