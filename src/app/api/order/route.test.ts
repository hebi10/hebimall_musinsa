/**
 * @jest-environment node
 */

import { POST } from './route';

describe('/api/order', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'hebimall';
    delete process.env.ORDER_FUNCTION_URL;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { orderId: 'order-1' },
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('proxies order requests to the Firebase Function URL in local Next dev', async () => {
    const response = await POST(new Request('http://localhost:3000/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ items: [{ productId: 'p1', quantity: 1 }] }),
    }) as never);

    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://us-central1-hebimall.cloudfunctions.net/order',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(body).toEqual({ success: true, data: { orderId: 'order-1' } });
  });
});
