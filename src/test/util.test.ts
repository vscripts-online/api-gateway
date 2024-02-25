import { decodeVerifyCode, generateEncodedVerifyCode } from 'src/common/helper';

const id = 1;
const secret = 'secret';

test('should return correct code', () => {
  expect(generateEncodedVerifyCode(id, 123456, secret)).toBe(
    'MXwybjljfE5WS21yZGItNUd2TDNqbTdiZS1wdFE',
  );
  expect(generateEncodedVerifyCode(id, 654321, secret)).toBe(
    'MXxlMHZsfEVZbzJxaDhFQnZXT1llM0lYSzFCalE',
  );
});

test('should return correct code and _id', () => {
  expect(
    decodeVerifyCode('MXwybjljfE5WS21yZGItNUd2TDNqbTdiZS1wdFE', secret),
  ).toStrictEqual({ id, code: 123456 });
  expect(
    decodeVerifyCode('MXxlMHZsfEVZbzJxaDhFQnZXT1llM0lYSzFCalE', secret),
  ).toStrictEqual({ id, code: 654321 });
});
