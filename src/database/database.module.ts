import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as amqp from 'amqplib';
import {
  RABBITMQ_HOST,
  RABBITMQ_PASS,
  RABBITMQ_PORT,
  RABBITMQ_USER,
} from 'src/common/config';
import { RABBITMQ_CLIENT } from 'src/common/config/constants';
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
    const conn = await amqp.connect(
      `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`,
    );
    console.log('Connected to rabbitmq');
    return conn;
  },
};

const schemas = [
  { name: AccountSchema.name, schema: AccountSchemaClass },
  { name: FileSchema.name, schema: FileSchemaClass },
  { name: UserSchema.name, schema: UserSchemaClass },
];

const providers = [
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
