export const REDIRECT_URI_GOOGLE = 'http://localhost:3000/callback_google';

export const RABBITMQ_CLIENT = Symbol('RABBITMQ_CLIENT');
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const EXCLUDE_HEADERS = [
  'content-disposition',
  'content-length',
  'cache-control',
  'transfer-encoding',
  'connection',
];
export const XXHASH_SEED_MOD = 40408379;
export const BCRYPT_SALT_ROUND = 12;
