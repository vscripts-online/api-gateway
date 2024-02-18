import { getEnvOrThrow } from '../util';

const ENV_STRINGS = {
  PORT: 'PORT',
  JWT_SECRET: 'JWT_SECRET',
  MONGO_HOST: 'MONGO_HOST',
  MONGO_PORT: 'MONGO_PORT',
  MONGO_DATABASE: 'MONGO_DATABASE',
  RABBITMQ_HOST: 'RABBITMQ_HOST',
  RABBITMQ_PORT: 'RABBITMQ_PORT',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_DATABASE: 'REDIS_DATABASE',
  ADMIN_KEY: 'ADMIN_KEY',
};

export const PORT = getEnvOrThrow(ENV_STRINGS.PORT);
export const JWT_SECRET = getEnvOrThrow(ENV_STRINGS.JWT_SECRET);

export const MONGO_HOST = getEnvOrThrow(ENV_STRINGS.MONGO_HOST);
export const MONGO_PORT = getEnvOrThrow(ENV_STRINGS.MONGO_PORT);
export const MONGO_DATABASE = getEnvOrThrow(ENV_STRINGS.MONGO_DATABASE);
export const RABBITMQ_HOST = getEnvOrThrow(ENV_STRINGS.RABBITMQ_HOST);
export const RABBITMQ_PORT = getEnvOrThrow(ENV_STRINGS.RABBITMQ_PORT);

export const REDIS_HOST = getEnvOrThrow(ENV_STRINGS.REDIS_HOST);
export const REDIS_PORT = getEnvOrThrow(ENV_STRINGS.REDIS_PORT);
export const REDIS_DATABASE = getEnvOrThrow(ENV_STRINGS.REDIS_DATABASE);

export const ADMIN_KEY = getEnvOrThrow(ENV_STRINGS.ADMIN_KEY);
