import { NextRequest, NextResponse } from 'next/server';
import { getMenuResponse, getAIFallbackResponse } from '@/shared/utils/chatResponses';

interface ChatRequest {
  message: string;
  useAI?: boolean;
  conversationHistory?: Array<{ role: string; content: unknown }>;
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_CONTENT_LENGTH = 800;

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

이모지 금지. 정중하게 답변하세요.
고객의 문의를 정확히 파악하고 친절하고 전문적으로 답변해주세요.`;

export async function POST(request: NextRequest) {
  try {
    const payload: ChatRequest = await request.json();
    const { message, useAI = false, conversationHistory = [] } = payload;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: 'Message is too long.' },
        { status: 413, headers: NO_STORE_HEADERS },
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

    const openAIResponse = await getOpenAIChatResponse(
      message,
      sanitizeConversationHistory(conversationHistory),
    );
    if (openAIResponse) {
      return NextResponse.json({ response: openAIResponse }, { headers: NO_STORE_HEADERS });
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

async function getOpenAIChatResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
      cache: 'no-store',
    });

    if (!openaiRes.ok) {
      console.error('OpenAI chat API error:', openaiRes.status, await openaiRes.text());
      return null;
    }

    const data = await openaiRes.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error('OpenAI chat API request failed:', error);
    return null;
  }
}

function sanitizeConversationHistory(
  conversationHistory: ChatRequest['conversationHistory'] = [],
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(conversationHistory)) {
    return [];
  }

  return conversationHistory
    .filter((item): item is { role: 'user' | 'assistant'; content: string } =>
      (item?.role === 'user' || item?.role === 'assistant') &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0,
    )
    .map(item => ({
      role: item.role,
      content: item.content.slice(0, MAX_HISTORY_CONTENT_LENGTH),
    }))
    .slice(-MAX_HISTORY_ITEMS);
}
