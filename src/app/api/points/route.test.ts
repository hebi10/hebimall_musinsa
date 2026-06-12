/**
 * @jest-environment node
 */

import { POST } from './route';

describe('/api/points', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'hebimall';
    delete process.env.POINTS_FUNCTION_URL;

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: { pointBalance: 5000 },
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('proxies point requests to the Firebase Function URL in local Next dev', async () => {
    const response = await POST(new Request('http://localhost:3000/api/points/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ action: 'balance' }),
    }) as never);

    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://us-central1-hebimall.cloudfunctions.net/points',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(body).toEqual({ success: true, data: { pointBalance: 5000 } });
  });
});
