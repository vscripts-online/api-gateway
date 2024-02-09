import {
  generateEncodedVerifyCode,
  decodeVerifyCode,
  calculateSeed,
} from 'src/common/util';

test('should calculate seed correctly', () => {
  const _id = '65c4efa0b3da8a1d8773f87d';

  expect(calculateSeed(_id, '65c6d1e0b3da8a1d8773f87d', 123456)).toBe(13694774);
  expect(calculateSeed(_id, '65ceeb91b3da8a1d8773f87d', 654321)).toBe(14756504);
});

test('should return correct code', () => {
  const _id = '65c4efa0b3da8a1d8773f87d';

  expect(generateEncodedVerifyCode(_id, 123456)).toBe(
    'ZcbR4LPaih2Hc_h9c-3fpA2n9c',
  );
  expect(generateEncodedVerifyCode(_id, 654321)).toBe(
    'Zc7rkbPaih2Hc_h9LCA9hwe0vl',
  );
});

test('should return correct code and _id', () => {
  expect(decodeVerifyCode('ZcbR4LPaih2Hc_h9c-3fpA2n9c')).toStrictEqual({
    _id: '65c4efa0b3da8a1d8773f87d',
    code: 123456,
  });
  expect(decodeVerifyCode('Zc7rkbPaih2Hc_h9LCA9hwe0vl')).toStrictEqual({
    _id: '65c4efa0b3da8a1d8773f87d',
    code: 654321,
  });
});
