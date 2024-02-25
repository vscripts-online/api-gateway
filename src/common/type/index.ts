export enum AccountTypes {
  GOOGLE = 'GOOGLE',
}

export interface ISearch {
  skip: number;
  limit: number;
}

export enum RABBITMQ_CHANNELS {
  NEW_FILE_UPLOAD_QUEUE = 'NEW_FILE_UPLOAD_QUEUE',
  SEND_EMAİL_QUEUE = 'SEND_EMAİL_QUEUE',
}

export interface INEW_FILE_UPLOAD_QUEUE_DATA {
  _id: string;
  name: string;
  offset: number;
  size: number;
}

export interface ISEND_EMAİL_QUEUE {
  id: number;
  email: string;
  code: number;
}

export interface RABBITMQ_CHANNELS_DATAS {
  [RABBITMQ_CHANNELS.NEW_FILE_UPLOAD_QUEUE]: INEW_FILE_UPLOAD_QUEUE_DATA;
  [RABBITMQ_CHANNELS.SEND_EMAİL_QUEUE]: ISEND_EMAİL_QUEUE;
}

export enum REDIS_NAMESPACES {
  SESSION = 'session',
}

export type Class = { new (...args: any[]): any };
