import { NextRequest, NextResponse } from 'next/server';
import { getMenuResponse, getAIFallbackResponse } from '@/shared/utils/chatResponses';

interface ChatRequest {
  message: string;
  useAI?: boolean;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(request: NextRequest) {
  try {
    const payload: ChatRequest = await request.json();
    const { message, useAI = false } = payload;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const upstreamUrl = getUpstreamChatApiUrl(request);
    if (upstreamUrl) {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, useAI }),
        cache: 'no-store',
      });

      const upstreamBody = await upstreamResponse.json().catch(() => null);

      if (upstreamResponse.ok && upstreamBody) {
        return NextResponse.json(upstreamBody, {
          status: upstreamResponse.status,
          headers: NO_STORE_HEADERS,
        });
      }

      console.error('Upstream chat API error:', upstreamResponse.status, upstreamBody);
    }

    if (!useAI) {
      return NextResponse.json({ response: getMenuResponse(message) }, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json(
      { response: getAIFallbackResponse(message) },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal error.',
        response: 'Please try again or contact support.',
      },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

function getUpstreamChatApiUrl(request: NextRequest): string | null {
  const configuredUrl = (
    process.env.CHAT_API_URL ||
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    ''
  ).trim();

  if (!configuredUrl || configuredUrl === '/api/chat') return null;

  try {
    const upstreamUrl = new URL(configuredUrl);
    const requestUrl = new URL(request.url);

    if (upstreamUrl.origin === requestUrl.origin && upstreamUrl.pathname === requestUrl.pathname) {
      return null;
    }

    return upstreamUrl.toString();
  } catch {
    return null;
  }
}
