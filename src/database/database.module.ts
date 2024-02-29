import { Global, Module } from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  RABBITMQ_HOST,
  RABBITMQ_PASS,
  RABBITMQ_PORT,
  RABBITMQ_USER,
} from 'src/common/config';
import { RABBITMQ_CLIENT } from 'src/common/config/constants';

const rabbitmq_client = {
  provide: RABBITMQ_CLIENT,
  useFactory: async () => {
    const conn = await amqp.connect(
      `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`,
    );
    console.log('Connected to rabbitmq');
    return conn;
  },
};

const providers = [rabbitmq_client];

@Global()
@Module({
  imports: [],
  providers,
  exports: [...providers],
})
export class DatabaseModule {}
