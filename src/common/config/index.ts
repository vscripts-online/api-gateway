import { getEnvOrThrow } from '../util';
import { ClientOptions } from '@grpc/grpc-js';
import { Transport } from '@nestjs/microservices';
import * as path from 'node:path';

const ENV_STRINGS = {
  PORT: 'PORT',
  JWT_SECRET: 'JWT_SECRET',
  ADMIN_KEY: 'ADMIN_KEY',

  MONGO_URI: 'MONGO_URI',

  RABBITMQ_HOST: 'RABBITMQ_HOST',
  RABBITMQ_PORT: 'RABBITMQ_PORT',
  RABBITMQ_USER: 'RABBITMQ_USER',
  RABBITMQ_PASS: 'RABBITMQ_PASS',

  SESSION_MS_URI: 'SESSION_MS_URI',
};

export const PORT = getEnvOrThrow(ENV_STRINGS.PORT);
export const JWT_SECRET = getEnvOrThrow(ENV_STRINGS.JWT_SECRET);

export const MONGO_URI = getEnvOrThrow(ENV_STRINGS.MONGO_URI);

export const RABBITMQ_HOST = getEnvOrThrow(ENV_STRINGS.RABBITMQ_HOST);
export const RABBITMQ_PORT = getEnvOrThrow(ENV_STRINGS.RABBITMQ_PORT);
export const RABBITMQ_USER = getEnvOrThrow(ENV_STRINGS.RABBITMQ_USER);
export const RABBITMQ_PASS = getEnvOrThrow(ENV_STRINGS.RABBITMQ_PASS);

export const SESSION_MS_URI = getEnvOrThrow(ENV_STRINGS.SESSION_MS_URI);

export const ADMIN_KEY = getEnvOrThrow(ENV_STRINGS.ADMIN_KEY);

const SESSION_PROTO_PATH = path.join(process.cwd(), 'src/proto/session.proto');

export const SESSION_MS_GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: SESSION_MS_URI,
    package: 'session',
    protoPath: SESSION_PROTO_PATH,
  },
};
