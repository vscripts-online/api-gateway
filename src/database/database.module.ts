import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as amqp from 'amqplib';
import { createClient } from 'redis';
import {
  RABBITMQ_HOST,
  RABBITMQ_PORT,
  REDIS_HOST,
  REDIS_PORT,
} from 'src/common/config';
import { RABBITMQ_CLIENT, REDIS_CLIENT } from 'src/common/config/constants';
import {
  AccountSchema,
  AccountSchemaClass,
  FileSchema,
  FileSchemaClass,
  UserSchema,
  UserSchemaClass,
} from './model';
import { UserRepository } from './repository';
import { AccountRepository } from './repository/account.repository';
import { FileRepository } from './repository/file.repository';

const rabbitmq_client = {
  provide: RABBITMQ_CLIENT,
  useFactory: async () => {
    const conn = await amqp.connect(`amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`);

    console.log('Connected to rabbitmq');
    return conn;
  },
};

const redis_client = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const conn = await createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    });
    conn.on('error', (error) => {
      console.log('REDIS ERROR', error);
      process.exit(1);
    });

    await conn.connect();
    console.log('Connected to redis');

    return conn;
  },
};

const schemas = [
  { name: AccountSchema.name, schema: AccountSchemaClass },
  { name: FileSchema.name, schema: FileSchemaClass },
  { name: UserSchema.name, schema: UserSchemaClass },
];

const providers = [
  redis_client,
  rabbitmq_client,
  AccountRepository,
  FileRepository,
  UserRepository,
];

@Global()
@Module({
  imports: [MongooseModule.forFeature(schemas)],
  providers,
  exports: [MongooseModule.forFeature(schemas), ...providers],
})
export class DatabaseModule {}
