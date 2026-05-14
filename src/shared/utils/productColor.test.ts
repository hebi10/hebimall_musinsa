import { getProductColorValue } from './productColor';

describe('getProductColorValue', () => {
  it('returns distinct swatches for compound jewelry color names', () => {
    expect(getProductColorValue('white gold')).toBe('#f4f4f0');
    expect(getProductColorValue('yellow gold')).toBe('#d4af37');
    expect(getProductColorValue('rose gold')).toBe('#b76e79');
    expect(getProductColorValue('silver')).toBe('#c0c0c0');
  });

  it('normalizes casing and whitespace before matching colors', () => {
    expect(getProductColorValue('  White Gold  ')).toBe('#f4f4f0');
  });
});
