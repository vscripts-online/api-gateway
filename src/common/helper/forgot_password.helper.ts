/** This file contains helpers functions to create the verify code
 * for forgot_password. See readme for more details */

import { XXHASH_SEED_MOD } from '../config/constants';
import * as xxhash from '@node-rs/xxhash';

/** Calculates the seed used to create the xxhash signature */
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

/** Generates query based on user _id and code, see readme for further */
export function generateEncodedVerifyCode(_id: string, code: number) {
  // assume _id = 65c4efa0b3da8a1d8773f87d and code = 123456
  // new_time_hex = ((1707405216) + 123456).toHexString() = 65c6d1e0
  const new_time_hex = (parseInt(_id.slice(0, 8), 16) + code).toString(16);

  // new_id = 65c6d1e0 + b3da8a1d8773f87d = 65c6d1e0b3da8a1d8773f87d
  const new_id = new_time_hex + _id.slice(8);

  // seed = 13694774
  const seed = calculateSeed(_id, new_id, code);

  // signature = 1944969124.toHexString() = 73eddfa4
  const signature = xxhash.xxh32(new_id + _id, seed).toString(16);

  // buffer_hex = (65c6d1e0b3da8a1d8773f87d + 73eddfa4) = 65c6d1e0b3da8a1d8773f87d73eddfa4
  // b64url = Buffer.from(buffer_hex).toBase64UrlString = ZcbR4LPaih2Hc_h9c-3fpA
  // code_radix = 123456.to36Radix() = 2n9c (It always gives 4 character output for 6 digit numbers)
  // query = b64url + code_radix = ZcbR4LPaih2Hc_h9c-3fpA2n9c
  const query =
    Buffer.from(new_id + signature, 'hex').toString('base64url') +
    code.toString(36);

  return query;
}

/** Extracts user _id and code from the generated query, see readme for further */
export function decodeVerifyCode(
  query: string,
): { _id: string; code: number } | null {
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
