import { NextRequest, NextResponse } from 'next/server';

// GPT API 연결을 위한 인터페이스 정의
interface ChatRequest {
  message: string;
  useAI?: boolean; // AI 상담원 연결 여부
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { message, useAI = false, conversationHistory = [] }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: '메시지가 비어있습니다.' },
        { status: 400 }
      );
    }

    // AI 상담원 연결을 원하지 않는 경우 일반 응답
    if (!useAI) {
      return NextResponse.json({
        response: getTemporaryResponse(message)
      });
    }

    // AI 상담원 연결 요청인 경우 실제 OpenAI API 사용
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('OpenAI API 키가 없어서 개발용 응답 사용');
      return NextResponse.json({
        response: getAIDevResponse(message)
      });
    }

    // 실제 OpenAI API 호출
    try {
      const systemPrompt = `당신은 HEBIMALL 온라인 패션 쇼핑몰의 전문 고객지원 AI입니다.

=== 회사 정보 ===
• 회사명: HEBIMALL (무신사 스타일 패션 플랫폼)
• 사업분야: 최신 트렌드 패션 의류, 액세서리, 신발 전문
• 특징: 현대적 그라디언트 디자인, 완전 반응형 쇼핑몰

=== 플랫폼 주요 기능 ===
**사용자 기능:**
• 회원가입/로그인 (이메일, 소셜로그인 지원)
• 상품 검색/필터링/카테고리별 조회
• 장바구니 및 위시리스트 관리
• 주문/결제 시스템
• 마이페이지 (주문내역, 개인정보, 쿠폰함)
• 상품 리뷰 작성 및 평점 시스템
• QnA 1:1 문의 시스템
• 포인트 적립/사용 시스템
• 쿠폰 발급/사용 시스템
• 이벤트 참여 시스템

=== 서비스 정책 ===
**배송 정보:**
• 배송비: 3,000원 (5만원 이상 무료배송)
• 배송시간: 평일 오후 2시 이전 주문시 당일발송
• 배송기간: 1-3일 (도서/산간지역 제외)

**반품/교환:**
• 기간: 상품 수령 후 7일 이내
• 조건: 상품 태그 유지, 포장 상태 양호

**결제 방법:**
• 신용카드, 무통장입금, 간편결제 지원

고객의 문의를 정확히 파악하고, 친절하고 전문적으로 답변해주세요.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10),
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';

      return NextResponse.json({
        response: aiResponse
      });

    } catch (openaiError) {
      console.error('OpenAI API 오류:', openaiError);
      // OpenAI API 오류 시 대체 응답
      return NextResponse.json({
        response: '죄송합니다. AI 상담원 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담 서비스는 계속 이용하실 수 있습니다.'
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.',
        response: '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담 서비스는 계속 이용하실 수 있습니다. 아래 번호를 선택해 주세요:\n\n1️⃣ 주문/배송 2️⃣ 반품/교환 3️⃣ 쿠폰/할인'
      },
      { status: 500 }
    );
  }
}

// AI 상담원 개발 환경 응답 함수
function getAIDevResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // 일반적인 AI 상담원 응답
  return `🤖 AI 상담원: "${message}"에 대한 문의를 받았습니다.

개발 환경에서는 실제 AI 기능이 제한적이지만, 프로덕션에서는 더욱 정확하고 개인화된 답변을 제공할 수 있습니다.

현재 도움드릴 수 있는 내용:
• 📦 주문/배송 관련 문의
• 🔄 반품/교환 절차
• 🎫 쿠폰/할인 혜택
• 👕 사이즈 가이드
• 💳 결제 방법

구체적인 질문을 해주시면 더 자세히 안내해드리겠습니다! 😊`;
}

// 임시 응답 함수 (선택지 기반 응답)
function getTemporaryResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // 특별 명령어 처리 - AI 상담원 연결
  if (lowerMessage === '상담원연결' || lowerMessage === '상담원 연결') {
    return `개발 환경에서는 AI 상담원 기능이 제한됩니다. 
    
프로덕션 환경에서는 실제 AI 상담원과 연결됩니다! 🤖

현재는 기본 상담 서비스를 이용해 주세요:

1️⃣ 주문/배송 2️⃣ 반품/교환 3️⃣ 쿠폰/할인`;
  }
  
  // 초기 선택지 제공 (숫자 입력은 제외)
  if (lowerMessage.includes('안녕') || lowerMessage.includes('도움') || lowerMessage.includes('문의') || 
      (message.length < 10 && !lowerMessage.match(/^[1-6]$/) && !lowerMessage.includes('주문') && !lowerMessage.includes('배송') && !lowerMessage.includes('반품') && !lowerMessage.includes('교환') && !lowerMessage.includes('쿠폰') && !lowerMessage.includes('할인'))) {
    return `안녕하세요! HEBIMALL 고객지원팀입니다. 😊

어떤 도움이 필요하신가요? 아래 번호를 선택하거나 직접 문의해 주세요:

1️⃣ 주문/배송 문의
2️⃣ 반품/교환 안내  
3️⃣ 쿠폰/할인 혜택
4️⃣ 사이즈 가이드
5️⃣ 결제 방법 안내
6️⃣ 회원 혜택 정보

🤖 상담원연결 - AI 상담원과 1:1 맞춤 상담 (프로덕션 환경에서 사용 가능)

번호를 입력하시거나 궁금한 점을 직접 말씀해 주세요!`;
  }

  // 숫자 선택지 처리
  if (lowerMessage === '1' || lowerMessage.includes('주문') || lowerMessage.includes('배송')) {
    return `📦 주문/배송 안내

• 주문 확인: 마이페이지 > 주문내역에서 확인 가능
• 배송 시간: 평일 오후 2시 이전 주문시 당일발송
• 배송비: 3,000원 (5만원 이상 무료배송)
• 배송 기간: 1-3일 (도서/산간 지역 제외)
• 제주/도서산간: 추가 배송비 3,000원

📞 배송 관련 문의: 고객센터 1588-0000

다른 궁금한 점이 있으시면 번호를 선택하시거나 상담원연결을 입력해 주세요!`;
  }
  
  if (lowerMessage === '2' || lowerMessage.includes('반품') || lowerMessage.includes('교환')) {
    return `🔄 반품/교환 안내

• 기간: 상품 수령 후 7일 이내
• 조건: 상품 태그 및 포장 상태 유지
• 방법: 마이페이지에서 신청 또는 고객센터 연락
• 비용: 단순 변심시 왕복 배송비 고객 부담

✅ 교환/반품 불가 상품
- 속옷, 양말 등 위생용품
- 커스텀 제작 상품

📞 고객센터: 1588-0000

다른 도움이 필요하시면 상담원연결을 입력해 주세요!`;
  }

  if (lowerMessage === '3' || lowerMessage.includes('쿠폰') || lowerMessage.includes('할인')) {
    return `🎫 쿠폰/할인 혜택

💝 현재 진행중인 혜택:
• 신규 회원 10% 할인 쿠폰
• 생일쿠폰 15% 할인 (생일월)
• 5만원 이상 무료배송
• 구매금액 1% 적립금 지급

📱 쿠폰 확인: 마이페이지 > 쿠폰함
🎁 등급별 혜택: 실버/골드/플래티넘 등급별 추가 할인

더 자세한 혜택 정보는 상담원연결을 통해 문의해 주세요!`;
  }

  if (lowerMessage === '4' || lowerMessage.includes('사이즈') || lowerMessage.includes('크기')) {
    return `📏 사이즈 가이드

👕 의류 사이즈:
• 상품 상세페이지 내 사이즈표 확인
• 모델 착용 정보 참고
• 실측 사이즈 제공

👟 신발 사이즈:
• 230-280mm (5mm 단위)
• 브랜드별 핏 정보 제공

🔧 사이즈 교환:
• 7일 이내 무료 교환 (1회)
• 왕복 배송비 무료

사이즈 고민이 있으시면 상담원연결로 1:1 맞춤 상담 받아보세요!`;
  }

  if (lowerMessage === '5' || lowerMessage.includes('결제') || lowerMessage.includes('카드')) {
    return `💳 결제 방법 안내

💰 지원 결제수단:
• 신용카드 (국내 모든 카드)
• 무통장입금
• 카카오페이
• 네이버페이  
• 페이코
• 토스페이

🛡️ 안전결제:
• SSL 보안 결제 시스템
• 개인정보 암호화 보호

❗ 결제 오류시 고객센터(1588-0000) 또는 상담원연결로 문의해 주세요!`;
  }

  if (lowerMessage === '6' || lowerMessage.includes('회원') || lowerMessage.includes('가입')) {
    return `👑 회원 혜택 정보

🎁 신규 회원 혜택:
• 즉시 사용 가능한 10% 할인 쿠폰
• 첫 구매 무료배송
• 1,000원 적립금 지급

⭐ 등급별 혜택:
• 실버: 1% 적립 + 생일쿠폰 10%
• 골드: 2% 적립 + 생일쿠폰 15%  
• 플래티넘: 3% 적립 + 생일쿠폰 20%
• VIP: 5% 적립 + 생일쿠폰 25%

💎 VIP 혜택: 신상품 우선 구매, 특별 할인 이벤트

더 자세한 혜택은 상담원연결을 통해 확인해 보세요!`;
  }

  // 기본 응답
  return `감사합니다. 고객님의 문의사항을 확인했습니다.

빠른 답변을 원하시면 아래 번호를 선택해 주세요:

1️⃣ 주문/배송 2️⃣ 반품/교환 3️⃣ 쿠폰/할인
4️⃣ 사이즈 가이드 5️⃣ 결제 방법 6️⃣ 회원 혜택

🤖 상담원연결 - AI 상담원과 1:1 맞춤 상담 (프로덕션 환경)

📞 고객센터: 1588-0000 (평일 9시-18시)`;
}
