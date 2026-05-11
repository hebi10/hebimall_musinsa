import {
  hashQnAPassword,
  toSafeQnA,
  verifyQnASecret,
} from '../src/domain/qnaDomain';

describe('qna domain logic', () => {
  test('verifies salted secret hashes and rejects wrong passwords', () => {
    const salt = 'fixed-test-salt';
    const passwordHash = hashQnAPassword('1234', salt);

    expect(verifyQnASecret({ passwordHash, passwordSalt: salt }, '1234')).toBe(true);
    expect(verifyQnASecret({ passwordHash, passwordSalt: salt }, '9999')).toBe(false);
    expect(verifyQnASecret({ passwordHash, passwordSalt: salt }, undefined)).toBe(false);
  });

  test('keeps legacy plain password verification for migration', () => {
    expect(verifyQnASecret({ password: '1234' }, '1234')).toBe(true);
    expect(verifyQnASecret({ password: '1234' }, '9999')).toBe(false);
  });

  test('safe QnA response omits password material', () => {
    const safe = toSafeQnA('qna-1', {
      userId: 'user-1',
      userEmail: 'u@example.com',
      userName: '사용자',
      category: 'product',
      title: '문의',
      content: '내용',
      isSecret: true,
      status: 'waiting',
      views: 3,
      isNotified: false,
      createdAt: { toDate: () => new Date('2026-05-11T00:00:00.000Z') },
      updatedAt: { toDate: () => new Date('2026-05-11T01:00:00.000Z') },
      passwordHash: 'hash',
      passwordSalt: 'salt',
      password: '1234',
    });

    expect(safe).toMatchObject({
      id: 'qna-1',
      title: '문의',
      isSecret: true,
      createdAt: '2026-05-11T00:00:00.000Z',
      updatedAt: '2026-05-11T01:00:00.000Z',
    });
    expect(safe).not.toHaveProperty('passwordHash');
    expect(safe).not.toHaveProperty('passwordSalt');
    expect(safe).not.toHaveProperty('password');
  });
});
