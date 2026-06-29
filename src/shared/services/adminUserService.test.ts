import { getAuth } from 'firebase/auth';
import { getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { AdminUserService } from './adminUserService';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'server-time'),
  getDoc: jest.fn(),
}));

jest.mock('@/shared/libs/firebase/firebase', () => ({
  db: {},
}));

describe('AdminUserService.updateUserPoints', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    (global as typeof globalThis & { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
    jest.mocked(getAuth).mockReturnValue({
      currentUser: {
        getIdToken: jest.fn().mockResolvedValue('admin-token'),
      },
    } as unknown as ReturnType<typeof getAuth>);
    jest.mocked(getDoc).mockReset();
    jest.mocked(updateDoc).mockReset();
    jest.mocked(addDoc).mockReset();
  });

  test('routes admin point changes through the points API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { newBalance: 6000 } }),
    });

    await AdminUserService.updateUserPoints({
      userId: 'user-1',
      amount: 1000,
      description: '관리자 지급',
      type: 'add',
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({
        action: 'add',
        userId: 'user-1',
        amount: 1000,
        description: '관리자 지급',
      }),
    });
    expect(getDoc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
  });
});
