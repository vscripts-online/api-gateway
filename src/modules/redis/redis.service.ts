import * as crypto from 'node:crypto'
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { RedisClientType } from "redis";
import { REDIS_NAMESPACES } from 'src/common/type';
import { UserRepository } from 'src/database';
import { REDIS_CLIENT } from 'src/common/config/constants';

@Injectable()
export class RedisService {
  @Inject(forwardRef(() => REDIS_CLIENT))
  private readonly redisClient: RedisClientType

  async set(_id: string, namespace: REDIS_NAMESPACES) {
    const key = crypto.randomBytes(16).toString('base64url')
    const result = await this.redisClient.LPUSH(namespace + ':' + _id, key)
    if (!result)
      return this.set(_id, namespace)
    return key
  }

  async delete_key(_id: string, namespace: REDIS_NAMESPACES) {
    return this.redisClient.DEL(namespace + ':' + _id)
  }

  async exists(key: string, _id: string, namespace: REDIS_NAMESPACES) {
    const keys = await this.redisClient.LRANGE(namespace + ':' + _id, 0, 100)
    return keys.includes(key)
  }
}