/**
 * @jest-environment node
 */

import { POST } from './route';

describe('/api/coupon', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'hebimall';
    delete process.env.COUPON_FUNCTION_URL;

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: { userCouponId: 'user-coupon-1' },
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('proxies coupon requests to the Firebase Function URL in local Next dev', async () => {
    const response = await POST(new Request('http://localhost:3000/api/coupon/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ action: 'register', couponCode: 'WELCOME' }),
    }) as never);

    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://us-central1-hebimall.cloudfunctions.net/coupon',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(body).toEqual({ success: true, data: { userCouponId: 'user-coupon-1' } });
  });
});
