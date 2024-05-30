import { getEnvOrThrow } from '../util';
import { Transport, ClientOptions, GrpcOptions } from '@nestjs/microservices';
import * as path from 'node:path';

const ENV_STRINGS = {
  PORT: 'PORT',
  HMAC_SECRET: 'HMAC_SECRET',
  JWT_SECRET: 'JWT_SECRET',
  AUTH_HOST_URI: 'AUTH_HOST_URI',
  AUTH_CLIENT_ID: 'AUTH_CLIENT_ID',
  AUTH_CLIENT_SECRET: 'AUTH_CLIENT_SECRET',

  QUEUE_MS_URI: 'QUEUE_MS_URI',
  SESSION_MS_URI: 'SESSION_MS_URI',
  USER_MS_URI: 'USER_MS_URI',
  FILE_MS_URI: 'FILE_MS_URI',
};

export const PORT = getEnvOrThrow(ENV_STRINGS.PORT);
export const HMAC_SECRET = getEnvOrThrow(ENV_STRINGS.HMAC_SECRET);
export const JWT_SECRET = getEnvOrThrow(ENV_STRINGS.JWT_SECRET);
export const AUTH_HOST_URI = getEnvOrThrow(ENV_STRINGS.AUTH_HOST_URI);
export const AUTH_CLIENT_ID = getEnvOrThrow(ENV_STRINGS.AUTH_CLIENT_ID);
export const AUTH_CLIENT_SECRET = getEnvOrThrow(ENV_STRINGS.AUTH_CLIENT_SECRET);

export const SESSION_MS_URI = getEnvOrThrow(ENV_STRINGS.SESSION_MS_URI);
export const USER_MS_URI = getEnvOrThrow(ENV_STRINGS.USER_MS_URI);
export const FILE_MS_URI = getEnvOrThrow(ENV_STRINGS.FILE_MS_URI);
export const QUEUE_MS_URI = getEnvOrThrow(ENV_STRINGS.QUEUE_MS_URI);

const SESSION_PROTO_PATH = path.join(process.cwd(), 'proto/session.proto');
const USER_PROTO_PATH = path.join(process.cwd(), 'proto/user.proto');
const FILE_PROTO_PATH = path.join(process.cwd(), 'proto/file.proto');
const ACCOUNT_PROTO_PATH = path.join(process.cwd(), 'proto/account.proto');
const QUEUE_PROTO_PATH = path.join(process.cwd(), 'proto/queue.proto');

const loader: GrpcOptions['options']['loader'] = {
  keepCase: true,
  enums: String,
  longs: String,
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

export const USER_MS_GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: USER_MS_URI,
    package: 'user',
    protoPath: USER_PROTO_PATH,
    loader,
  },
};

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
