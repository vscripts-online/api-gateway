import { getEnvOrThrow } from "../util";

export const ENV_STRINGS = {
  PORT: 'PORT',
  JWT_ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  MONGO_HOST: 'MONGO_HOST',
  MONGO_PORT: 'MONGO_PORT',
  MONGO_DATABASE: 'MONGO_DATABASE',
  RABBITMQ_HOST: 'RABBITMQ_HOST',
  RABBITMQ_PORT: 'RABBITMQ_PORT',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_DATABASE: 'REDIS_DATABASE',
  ADMIN_KEY: 'ADMIN_KEY'
}

export const PORT = getEnvOrThrow(ENV_STRINGS.PORT)
export const JWT_ACCESS_SECRET = getEnvOrThrow(ENV_STRINGS.JWT_ACCESS_SECRET)
export const JWT_REFRESH_SECRET = getEnvOrThrow(ENV_STRINGS.JWT_REFRESH_SECRET)

export const REDIRECT_URI_GOOGLE = 'http://localhost:3000/callback_google'

export const MONGO_HOST = getEnvOrThrow(ENV_STRINGS.MONGO_HOST)
export const MONGO_PORT = getEnvOrThrow(ENV_STRINGS.MONGO_PORT)
export const MONGO_DATABASE = getEnvOrThrow(ENV_STRINGS.MONGO_DATABASE)

export const RABBITMQ_CLIENT = Symbol('RABBITMQ_CLIENT')
export const RABBITMQ_HOST = getEnvOrThrow(ENV_STRINGS.RABBITMQ_HOST)
export const RABBITMQ_PORT = getEnvOrThrow(ENV_STRINGS.RABBITMQ_PORT)

export const REDIS_CLIENT = Symbol('REDIS_CLIENT')
export const REDIS_HOST = getEnvOrThrow(ENV_STRINGS.REDIS_HOST)
export const REDIS_PORT = getEnvOrThrow(ENV_STRINGS.REDIS_PORT)
export const REDIS_DATABASE = getEnvOrThrow(ENV_STRINGS.REDIS_DATABASE)

export const ADMIN_KEY = getEnvOrThrow(ENV_STRINGS.ADMIN_KEY)

export const EXCLUDE_HEADERS = ['content-disposition', 'content-length', 'cache-control', 'transfer-encoding', 'connection']
export const XXHASH_SEED_MOD = 40408379
export const BCRYPT_SALT_ROUND = 12