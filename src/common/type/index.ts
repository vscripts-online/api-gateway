import { Type } from "class-transformer";
import { IsOptional, Min } from "class-validator";

export enum AccountTypes {
  GOOGLE = 'GOOGLE'
}

export interface ISearch {
  skip: number
  limit: number
}

export const DEFAULT_ISEARCH = { skip: 0, limit: 20 }

export class SearchRequestQueryParams {
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  skip: number

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  limit: number
}

export enum RABBITMQ_CHANNELS {
  NEW_FILE_UPLOAD_QUEUE = 'NEW_FILE_UPLOAD_QUEUE',
  SEND_EMAİL_QUEUE = 'SEND_EMAİL_QUEUE',
}

export interface INEW_FILE_UPLOAD_QUEUE_DATA {
  _id: string
  name: string
  offset: number
  size: number
}

export interface ISEND_EMAİL_QUEUE {
  _id: string
  email: string
  code: number
}

export interface RABBITMQ_CHANNELS_DATAS {
  [RABBITMQ_CHANNELS.NEW_FILE_UPLOAD_QUEUE]: INEW_FILE_UPLOAD_QUEUE_DATA
  [RABBITMQ_CHANNELS.SEND_EMAİL_QUEUE]: ISEND_EMAİL_QUEUE
}

export enum REDIS_NAMESPACES {
  SESSION = 'session'
}