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

interface ChatResponse {
  response: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, useAI = false, conversationHistory = [] }: ChatRequest = await request.json();
    const userMessage = message; // catch 블록에서 사용하기 위해 저장

    if (!message?.trim()) {
      return NextResponse.json(
        { error: '메시지가 비어있습니다.' },
        { status: 400 }
      );
    }

    // AI 상담원 연결을 원하지 않거나 API 키가 없는 경우 일반 응답
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!useAI || !apiKey) {
      return NextResponse.json({
        response: getTemporaryResponse(message)
      });
    }

    // GPT API 호출 설정
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

**관리자 기능:**
• 실시간 대시보드 (매출, 주문, 회원 통계)
• 상품 관리 (등록, 수정, 재고 관리)
• 주문 관리 (처리, 배송, 환불)
• 회원 관리 (권한, 등급, 상태)
• 카테고리 관리
• 쿠폰 생성/관리
• 이벤트 생성/관리
• QnA 답변 관리
• 리뷰 관리

=== 서비스 정책 ===
**배송 정보:**
• 배송비: 3,000원 (5만원 이상 무료배송)
• 배송시간: 평일 오후 2시 이전 주문시 당일발송
• 배송기간: 1-3일 (도서/산간지역 제외)
• 제주/도서산간: 추가 배송비 3,000원

**반품/교환:**
• 기간: 상품 수령 후 7일 이내
• 조건: 상품 태그 유지, 포장 상태 양호
• 교환 가능: 사이즈, 색상 (재고 있는 경우)
• 반품 불가: 속옷, 양말, 커스텀 제작 상품
• 비용: 단순변심시 왕복배송비 고객부담

**결제 방법:**
• 신용카드 (모든 국내카드)
• 무통장입금 (입금확인 후 발송)
• 간편결제: 카카오페이, 네이버페이, 페이코, 토스페이
• 할부: 2-12개월 (5만원 이상)

**회원 혜택:**
• 신규가입: 10% 할인쿠폰 + 1,000원 적립금
• 등급별 적립률: 실버(1%), 골드(2%), 플래티넘(3%), VIP(5%)
• 생일쿠폰: 실버(10%), 골드(15%), 플래티넘(20%), VIP(25%)
• VIP 혜택: 신상품 우선구매, 특별할인 이벤트

**쿠폰 시스템:**
• 신규회원 10% 할인쿠폰
• 생일쿠폰 (등급별 차등)
• 이벤트 쿠폰 (기간한정)
• 리뷰작성 쿠폰 (3% 할인)
• 재구매 쿠폰 (구매 후 1개월)

**포인트 시스템:**
• 적립: 구매금액의 등급별 차등 적립
• 사용: 1포인트 = 1원 (1,000포인트부터 사용가능)
• 소멸: 적립일로부터 1년

=== 고객지원 정보 ===
• 고객센터: 1588-0000 (평일 9:00-18:00)
• 카카오톡 상담: @HEBIMALL (24시간)
• 이메일: help@hebimall.co.kr
• 실시간 채팅: 평일 9:00-18:00

=== 응답 가이드라인 ===
1. **친절하고 전문적인 톤**: 항상 정중하고 도움이 되는 방식으로 응답
2. **정확한 정보 제공**: 위의 정책 정보를 정확히 안내
3. **단계별 안내**: 복잡한 절차는 단계적으로 설명
4. **개인화 응답**: 고객의 상황에 맞는 맞춤형 조언
5. **추가 도움 제안**: 필요시 고객센터나 관련 페이지 안내
6. **이모지 활용**: 적절한 이모지로 친근감 표현
7. **구체적 해결책**: 추상적 답변보다 실용적 해결방안 제시
8. **쇼핑몰 관련 질문이 아닐시**: 응답 내용에서 벗어났다고 안내

=== 자주 묻는 질문 대응 ===
**주문 관련**: 주문 확인, 주문 변경/취소, 배송조회, 배송지 변경
**상품 관련**: 사이즈 문의, 재입고 알림, 상품 추천, 코디 제안
**결제 관련**: 결제 오류, 카드 문제, 무통장입금, 영수증 발급
**회원 관련**: 회원가입, 로그인 문제, 개인정보 수정, 회원탈퇴
**혜택 관련**: 쿠폰 사용법, 적립금 사용, 등급 혜택, 이벤트 참여

고객의 문의를 정확히 파악하고, 위의 정보를 바탕으로 최적의 답변을 제공하세요.`;

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // 또는 'gpt-4'
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10), // 최근 10개 메시지만 포함
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

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.',
        response: '죄송합니다. AI 상담원 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담 서비스는 계속 이용하실 수 있습니다. 아래 번호를 선택해 주세요:\n\n1️⃣ 주문/배송 2️⃣ 반품/교환 3️⃣ 쿠폰/할인'
      },
      { status: 500 }
    );
  }
}

// 임시 응답 함수 (선택지 기반 응답)
function getTemporaryResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // 특별 명령어 처리 - AI 상담원 연결
  if (lowerMessage === '상담원연결' || lowerMessage === '상담원 연결') {
    // useAI가 false인 경우에만 이 메시지를 보여주고, 실제로는 AI 모드로 전환되어야 함
    return `상담원 연결을 위해 노력중이니 잠시만 기다려주세요. 고객센터 상담원이 곧 연결될 예정입니다. 📞✨

잠시만 기다려 주세요. 상담원이 곧 도와드리겠습니다. 🌟`;
  }
  
  // 초기 선택지 제공
  if (lowerMessage.includes('안녕') || lowerMessage.includes('도움') || lowerMessage.includes('문의') || message.length < 10) {
    return `안녕하세요! HEBIMALL 고객지원팀입니다. 😊

어떤 도움이 필요하신가요? 아래 번호를 선택하거나 직접 문의해 주세요:

1️⃣ 주문/배송 문의
2️⃣ 반품/교환 안내  
3️⃣ 쿠폰/할인 혜택
4️⃣ 사이즈 가이드
5️⃣ 결제 방법 안내
6️⃣ 회원 혜택 정보

🤖 상담원연결 - AI 상담원과 1:1 맞춤 상담

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

🤖 상담원연결 - AI 상담원과 1:1 맞춤 상담

📞 고객센터: 1588-0000 (평일 9시-18시)`;
}
