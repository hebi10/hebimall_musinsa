import { NextRequest, NextResponse } from 'next/server';
import { getMenuResponse, getAIFallbackResponse } from '@/shared/utils/chatResponses';

interface ChatRequest {
  message: string;
  useAI?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { message, useAI = false }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: '메시지가 비어있습니다.' }, { status: 400 });
    }

    if (!useAI) {
      return NextResponse.json({ response: getMenuResponse(message) });
    }

    // OpenAI API 키는 Firebase Functions Secret Manager에서 관리됩니다.
    // 프로덕션 AI 응답은 firebase.json rewrite를 통해 chatAPI (Firebase Functions)가 처리합니다.
    // 로컬 개발 환경에서는 fallback 응답을 반환합니다.
    return NextResponse.json({ response: getAIFallbackResponse(message) });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        response: '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(sevim0104@naver.com)로 연락해 주세요.',
      },
      { status: 500 },
    );
  }
}
