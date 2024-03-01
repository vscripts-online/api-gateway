export const REDIRECT_URI_GOOGLE = 'http://localhost:3000/callback_google';

export const RABBITMQ_CLIENT = Symbol('RABBITMQ_CLIENT');
export const SESSION_MS_CLIENT = Symbol('SESSION_MS_CLIENT');
export const USER_MS_CLIENT = Symbol('USER_MS_CLIENT');
export const FILE_MS_CLIENT = Symbol('FILE_MS_CLIENT');
export const QUEUE_MS_CLIENT = Symbol('QUEUE_MS_CLIENT');

/** Headers that are prohibited from being specified by the user */
export const EXCLUDE_HEADERS = [
  'content-disposition',
  'content-length',
  'cache-control',
  'transfer-encoding',
  'connection',
];

export const BCRYPT_SALT_ROUND = 12;
