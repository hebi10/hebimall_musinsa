/**
 * @jest-environment node
 */

import { POST } from './route';

describe('/api/admin/users', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'hebimall';
    delete process.env.ADMIN_USERS_FUNCTION_URL;

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: { userId: 'user-1', role: 'admin' },
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('proxies admin user requests to the Firebase Function URL in local Next dev', async () => {
    const response = await POST(new Request('http://localhost:3000/api/admin/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({ action: 'setRole', userId: 'user-1', role: 'admin' }),
    }) as never);

    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://us-central1-hebimall.cloudfunctions.net/adminUsers',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      }),
    );
    expect(body).toEqual({ success: true, data: { userId: 'user-1', role: 'admin' } });
  });
});
