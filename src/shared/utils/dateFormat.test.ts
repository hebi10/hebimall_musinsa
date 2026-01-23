import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPrice,
  useSafeDate,
} from './dateFormat';

// 오류 콘솔 안나오게
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('dateFormat utilities', () => {
  describe('formatDate', () => {
    test('Date 객체를 YYYY.MM.DD 형식으로 변환한다', () => {
      const date = new Date('2026-01-22');
      expect(formatDate(date)).toBe('2026.01.22');
    });

    test('문자열 날짜도 정상 변환된다', () => {
      expect(formatDate('2026-01-22')).toBe('2026.01.22');
    });

    test('잘못된 날짜는 "-"를 반환한다', () => {
      expect(formatDate('invalid-date')).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    test('YYYY.MM.DD HH:mm 형식으로 변환한다', () => {
      const date = new Date('2026-01-22T14:05:00');
      expect(formatDateTime(date)).toBe('2026.01.22 14:05');
    });

    test('잘못된 날짜는 "-"를 반환한다', () => {
      expect(formatDateTime('invalid-date')).toBe('-');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-22T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('1분 미만이면 "방금"을 반환한다', () => {
      const date = new Date('2026-01-22T11:59:30');
      expect(formatRelativeTime(date)).toBe('방금');
    });

    test('몇 분 전 형식으로 반환한다', () => {
      const date = new Date('2026-01-22T11:30:00');
      expect(formatRelativeTime(date)).toBe('30분 전');
    });

    test('몇 시간 전 형식으로 반환한다', () => {
      const date = new Date('2026-01-22T09:00:00');
      expect(formatRelativeTime(date)).toBe('3시간 전');
    });

    test('몇 일 전 형식으로 반환한다', () => {
      const date = new Date('2026-01-20T12:00:00');
      expect(formatRelativeTime(date)).toBe('2일 전');
    });

    test('30일 이상이면 formatDate 결과를 반환한다', () => {
      const date = new Date('2025-12-01T12:00:00');
      expect(formatRelativeTime(date)).toBe('2025.12.01');
    });

    test('잘못된 날짜는 "-"를 반환한다', () => {
      expect(formatRelativeTime('invalid-date')).toBe('-');
    });
  });
  
  describe('formatPrice', () => {
    test('숫자를 한국 로케일 콤마 형식으로 변환한다', () => {
      expect(formatPrice(1000000)).toBe('1,000,000');
    });

    test('0도 정상적으로 변환된다', () => {
      expect(formatPrice(0)).toBe('0');
    });
  });
  
  describe('useSafeDate', () => {
    test('formatSafeDate는 항상 문자열을 반환한다', () => {
      const { formatSafeDate } = useSafeDate();
      const result = formatSafeDate('2026-01-22');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('formatSafeDateTime은 항상 문자열을 반환한다', () => {
      const { formatSafeDateTime } = useSafeDate();
      const result = formatSafeDateTime('2026-01-22T10:30:00');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

});
