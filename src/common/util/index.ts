import * as xxhash from '@node-rs/xxhash';
import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { XXHASH_SEED_MOD } from '../config/constants';
import { Class } from '../type';

export const getEnvOrThrow = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw Error(`${key} not found in .env`);
  }

  return value;
};

export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export function randomInteger(min, max): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateSeed(hex1: string, hex2: string, code: number) {
  const p1 = parseInt(hex1.slice(0, 8), 16);
  const p2 = parseInt(hex1.slice(8, 16), 16);
  const p3 = parseInt(hex1.slice(16), 16);
  const p4 = parseInt(hex2.slice(0, 8), 16);
  const p5 = parseInt(hex2.slice(8, 16), 16);
  const p6 = parseInt(hex2.slice(16), 16);
  const sum = p1 + p2 + p3 + p4 + p5 + p6;
  return (sum % XXHASH_SEED_MOD) + code;
}

export function generateEncodedVerifyCode(_id: string, code: number) {
  const new_time_hex = (parseInt(_id.slice(0, 8), 16) + code).toString(16);
  const new_id = new_time_hex + _id.slice(8);
  const seed = calculateSeed(_id, new_id, code);
  const signature = xxhash.xxh32(new_id + _id, seed).toString(16);
  const query =
    Buffer.from(new_id + signature, 'hex').toString('base64url') +
    code.toString(36);
  return query;
}

export function decodeVerifyCode(query: string) {
  const code_excluded_query = query.slice(0, -4);
  const query_code_in_36_radix = query.slice(-4);
  const code = parseInt(query_code_in_36_radix, 36);
  const query_hex = Buffer.from(code_excluded_query, 'base64url').toString(
    'hex',
  );
  const query_signature = query_hex.slice(-8);
  const query_id = query_hex.slice(0, 24);
  const time_part = query_hex.slice(0, 8);
  const time = parseInt(time_part, 16);
  const real_time = time - code;
  const _id = real_time.toString(16) + query_hex.slice(8, -8);
  const query_seed = calculateSeed(_id, query_id, code);
  const new_signature = xxhash.xxh32(query_id + _id, query_seed).toString(16);
  if (new_signature !== query_signature) {
    return null;
  }

  return { _id, code };
}

export function IsNotEqualWith(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotEqualWith',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            typeof value === 'string' &&
            typeof relatedValue === 'string' &&
            value !== relatedValue
          );
        },
      },
    });
  };
}

export function classToSwaggerJson(_class: Class) {
  const instance = new _class();
  const methods = Reflect.getMetadata(
    'swagger/apiModelPropertiesArray',
    instance,
  );

  const keys = {};

  for (const method of methods) {
    const key = method[0] === ':' ? method.slice(1) : method;
    const { example } = Reflect.getMetadata(
      'swagger/apiModelProperties',
      instance,
      key,
    );
    keys[key] = example;
  }

  return keys;
}
