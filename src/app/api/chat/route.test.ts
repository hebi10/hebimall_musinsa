/**
 * @jest-environment node
 */

process.env.NEXT_PUBLIC_CHAT_API_URL = 'https://example.com/chat';

import { POST } from './route';

describe('/api/chat', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { response: '연동 응답입니다.' } }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('proxies to configured upstream chat API when it is available', async () => {
    const response = await POST(new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '배송 문의', useAI: true }),
    }) as never);

    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/chat',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(body).toEqual({ success: true, data: { response: '연동 응답입니다.' } });
  });
});
