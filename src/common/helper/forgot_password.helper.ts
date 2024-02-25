/** This file contains helpers functions to create the verify code
 * for forgot_password. See readme for more details */

import * as crypto from 'node:crypto';

/** Generates query based on user id and code, see readme for further */
export function generateEncodedVerifyCode(
  id: number,
  code: number,
  secret: string,
) {
  const signature = crypto
    .createHmac('md5', secret)
    .update(id + '|' + code)
    .digest('base64url');

  const data = id.toString(36) + '|' + code.toString(36) + '|' + signature;
  return Buffer.from(data).toString('base64url');
}

/** Extracts user id and code from the generated query, see readme for further */
export function decodeVerifyCode(
  query: string,
  secret: string,
): { id: number; code: number } | null {
  const decoded = Buffer.from(query, 'base64url').toString('utf-8');
  const [id_radix_36, code_radix_36, signature] = decoded.split('|');
  const id = parseInt(id_radix_36, 36);
  const code = parseInt(code_radix_36, 36);

  const _signature = crypto
    .createHmac('md5', secret)
    .update(id + '|' + code)
    .digest('base64url');

  if (_signature !== signature) {
    return null;
  }

  return { id, code };
}
