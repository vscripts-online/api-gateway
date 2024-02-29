import { getEnvOrThrow } from '../util';
import { Transport, ClientOptions, GrpcOptions } from '@nestjs/microservices';
import * as path from 'node:path';

const ENV_STRINGS = {
  PORT: 'PORT',
  HMAC_SECRET: 'HMAC_SECRET',
  JWT_SECRET: 'JWT_SECRET',
  ADMIN_KEY: 'ADMIN_KEY',

  RABBITMQ_HOST: 'RABBITMQ_HOST',
  RABBITMQ_PORT: 'RABBITMQ_PORT',
  RABBITMQ_USER: 'RABBITMQ_USER',
  RABBITMQ_PASS: 'RABBITMQ_PASS',

  QUEUE_MS_URI: 'QUEUE_MS_URI',
  SESSION_MS_URI: 'SESSION_MS_URI',
  USER_MS_URI: 'USER_MS_URI',
  FILE_MS_URI: 'FILE_MS_URI',
};

export const PORT = getEnvOrThrow(ENV_STRINGS.PORT);
export const HMAC_SECRET = getEnvOrThrow(ENV_STRINGS.HMAC_SECRET);
export const JWT_SECRET = getEnvOrThrow(ENV_STRINGS.JWT_SECRET);

export const RABBITMQ_HOST = getEnvOrThrow(ENV_STRINGS.RABBITMQ_HOST);
export const RABBITMQ_PORT = getEnvOrThrow(ENV_STRINGS.RABBITMQ_PORT);
export const RABBITMQ_USER = getEnvOrThrow(ENV_STRINGS.RABBITMQ_USER);
export const RABBITMQ_PASS = getEnvOrThrow(ENV_STRINGS.RABBITMQ_PASS);

export const SESSION_MS_URI = getEnvOrThrow(ENV_STRINGS.SESSION_MS_URI);
export const USER_MS_URI = getEnvOrThrow(ENV_STRINGS.USER_MS_URI);
export const FILE_MS_URI = getEnvOrThrow(ENV_STRINGS.FILE_MS_URI);
export const QUEUE_MS_URI = getEnvOrThrow(ENV_STRINGS.QUEUE_MS_URI);

const SESSION_PROTO_PATH = path.join(process.cwd(), 'proto/session.proto');

const loader: GrpcOptions['options']['loader'] = {
  keepCase: true,
  enums: String,
};

export const SESSION_MS_GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: SESSION_MS_URI,
    package: 'session',
    protoPath: SESSION_PROTO_PATH,
    loader,
  },
};

const USER_PROTO_PATH = path.join(process.cwd(), 'proto/user.proto');

export const USER_MS_GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: USER_MS_URI,
    package: 'user',
    protoPath: USER_PROTO_PATH,
    loader,
  },
};

const FILE_PROTO_PATH = path.join(process.cwd(), 'proto/file.proto');
const ACCOUNT_PROTO_PATH = path.join(process.cwd(), 'proto/account.proto');
const QUEUE_PROTO_PATH = path.join(process.cwd(), 'proto/queue.proto');

export const FILE_MS_GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: FILE_MS_URI,
    package: ['file', 'account'],
    protoPath: [FILE_PROTO_PATH, ACCOUNT_PROTO_PATH],
    loader,
  },
};

export const QUEUE_MS_GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: QUEUE_MS_URI,
    package: 'queue',
    protoPath: QUEUE_PROTO_PATH,
    loader,
  },
};
