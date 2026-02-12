import {
  formatPrice,
  formatPriceWithoutSymbol,
  calculateDiscountRate,
  formatDate,
  formatDateShort,
} from './format';

describe('calculateDiscountRate', () => {
  test('정상 할인율 계산', () => {
    expect(calculateDiscountRate(10000, 8000)).toBe(20);
  });

  test('반올림 처리 확인', () => {
    expect(calculateDiscountRate(9999, 6666)).toBe(33);
  });

  test('원가와 판매가가 같을 경우 0%', () => {
    expect(calculateDiscountRate(10000, 10000)).toBe(0);
  });

  test('판매가가 더 비싼 경우 음수 할인율', () => {
    expect(calculateDiscountRate(8000, 10000)).toBe(-25);
  });
});

describe('formatPrice', () => {
  test('문자열을 반환한다', () => {
    const result = formatPrice(10000);
    expect(typeof result).toBe('string');
  });

  test('빈 문자열이 아니다', () => {
    const result = formatPrice(10000);
    expect(result.length).toBeGreaterThan(0);
  });

  test('숫자 입력 시 예외가 발생하지 않는다', () => {
    expect(() => formatPrice(0)).not.toThrow();
  });
});

describe('formatPriceWithoutSymbol', () => {
  test('문자열을 반환한다', () => {
    const result = formatPriceWithoutSymbol(10000);
    expect(typeof result).toBe('string');
  });

  test('통화 기호 없이 숫자 포맷을 유지한다', () => {
    const result = formatPriceWithoutSymbol(10000);
    expect(result.replace(/[0-9,]/g, '')).toBe('');
  });
});

describe('formatDate', () => {
  test('문자열을 반환한다', () => {
    const date = new Date('2024-01-01T12:34:56');
    const result = formatDate(date);
    expect(typeof result).toBe('string');
  });

  test('빈 문자열이 아니다', () => {
    const date = new Date();
    const result = formatDate(date);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatDateShort', () => {
  test('문자열을 반환한다', () => {
    const date = new Date('2024-01-01');
    const result = formatDateShort(date);
    expect(typeof result).toBe('string');
  });

  test('날짜만 포함된 형식이다', () => {
    const date = new Date('2024-01-01T12:34:56');
    const result = formatDateShort(date);
    expect(result).not.toMatch(/:/);
  });
});
