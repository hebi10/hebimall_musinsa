import { NextRequest, NextResponse } from 'next/server';
import { getMenuResponse, getAIFallbackResponse } from '@/shared/utils/chatResponses';

interface ChatRequest {
  message: string;
  useAI?: boolean;
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(request: NextRequest) {
  try {
    const { message, useAI = false }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400, headers: NO_STORE_HEADERS },
      );
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
