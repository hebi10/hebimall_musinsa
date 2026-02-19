import { NextRequest, NextResponse } from 'next/server';
import { getMenuResponse, getAIFallbackResponse } from '@/shared/utils/chatResponses';

interface ChatRequest {
  message: string;
  useAI?: boolean;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

const SYSTEM_PROMPT = `당신은 STYNA 온라인 패션 쇼핑몰의 전문 고객지원 AI입니다.

=== 회사 정보 ===
회사명: STYNA (패션 플랫폼)
사업분야: 최신 트렌드 패션 의류, 액세서리, 신발 전문
위치: 대한민국 서울특별시 강남구
주의사항: 쇼핑몰과 무관한 답변 금지
해당 사이트는 실제 사이트가 아닌 박도영의 포트폴리오 사이트입니다.
고객센터 이메일: sevim0104@naver.com
고객센터 전화: 010-4789-7410 (평일 10시~19시)

=== 서비스 정책 ===
배송비: 3,000원 (50,000원 이상 무료)
배송시간: 평일 오후 2시 이전 주문 시 당일발송 / 1~3일 소요
반품·교환: 수령 후 7일 이내, 태그 및 포장 상태 유지
결제: 신용카드, 무통장입금, 카카오페이, 네이버페이, 페이코, 토스페이

"이모지 금지"
고객의 문의를 정확히 파악하고 친절하고 전문적으로 답변해주세요.`;

export async function POST(request: NextRequest) {
  try {
    const { message, useAI = false, conversationHistory = [] }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: '메시지가 비어있습니다.' }, { status: 400 });
    }

    if (!useAI) {
      return NextResponse.json({ response: getMenuResponse(message) });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ response: getAIFallbackResponse(message) });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory.slice(-10),
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      throw new Error(`OpenAI API error: ${openaiRes.status}`);
    }

    const data = await openaiRes.json();
    const aiResponse = data.choices[0]?.message?.content ?? '죄송합니다. 응답을 생성할 수 없습니다.';

    return NextResponse.json({ response: aiResponse });

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
