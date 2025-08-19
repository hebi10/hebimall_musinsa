import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import fetch from 'node-fetch';

// OpenAI API 키를 Secret Manager에서 정의
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// GPT API 연결을 위한 인터페이스 정의
interface ChatRequest {
  message: string;
  useAI?: boolean;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export const chatAPIStandalone = onRequest({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1',
  secrets: [openaiApiKey] // Secret 사용 선언
}, async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  console.log('=== Chat API 호출됨 ===');

  try {
    const { message, useAI = false, conversationHistory = [] }: ChatRequest = req.body;
    console.log('요청 데이터:', { message, useAI, historyLength: conversationHistory.length });

    if (!message?.trim()) {
      console.log('메시지가 비어있음');
      res.status(400).json({ error: '메시지가 비어있습니다.' });
      return;
    }

    // OpenAI API 키 가져오기 (Secret Manager에서)
    const apiKey = openaiApiKey.value();

    // AI 상담원 연결을 원하지 않거나 API 키가 없는 경우 일반 응답
    if (!useAI || !apiKey) {
      console.log('일반 응답 모드 - AI 사용 안함 또는 API 키 없음');
      res.json({
        response: getTemporaryResponse(message)
      });
      return;
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

    // OpenAI API 호출
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

    const data: any = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';

    res.json({
      response: aiResponse
    });

  } catch (error) {
    console.error('=== Chat API 오류 ===');
    console.error('Error:', error);
    
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      response: '죄송합니다. AI 상담원 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담 서비스는 계속 이용하실 수 있습니다. 아래 번호를 선택해 주세요:\n\n1️⃣ 주문/배송 2️⃣ 반품/교환 3️⃣ 쿠폰/할인'
    });
  }
});

// 임시 응답 함수
function getTemporaryResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // 특별 명령어 처리
  if (lowerMessage === '상담원연결' || lowerMessage === '상담원 연결') {
    return `상담원 연결을 위해 노력중이니 잠시만 기다려주세요. 고객센터 상담원이 곧 연결될 예정입니다. 📞✨`;
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

📞 배송 관련 문의: 고객센터 1588-0000

다른 궁금한 점이 있으시면 번호를 선택하시거나 상담원연결을 입력해 주세요!`;
  }
  
  if (lowerMessage === '2' || lowerMessage.includes('반품') || lowerMessage.includes('교환')) {
    return `🔄 반품/교환 안내

• 기간: 상품 수령 후 7일 이내
• 조건: 상품 태그 및 포장 상태 유지
• 방법: 마이페이지에서 신청 또는 고객센터 연락

📞 고객센터: 1588-0000`;
  }

  if (lowerMessage === '3' || lowerMessage.includes('쿠폰') || lowerMessage.includes('할인')) {
    return `🎫 쿠폰/할인 혜택

💝 현재 진행중인 혜택:
• 신규 회원 10% 할인 쿠폰
• 생일쿠폰 15% 할인 (생일월)
• 5만원 이상 무료배송
• 구매금액 1% 적립금 지급

📱 쿠폰 확인: 마이페이지 > 쿠폰함`;
  }

  // 기본 응답
  return `감사합니다. 고객님의 문의사항을 확인했습니다.

빠른 답변을 원하시면 아래 번호를 선택해 주세요:

1️⃣ 주문/배송 2️⃣ 반품/교환 3️⃣ 쿠폰/할인
4️⃣ 사이즈 가이드 5️⃣ 결제 방법 6️⃣ 회원 혜택

🤖 상담원연결 - AI 상담원과 1:1 맞춤 상담

📞 고객센터: 1588-0000 (평일 9시-18시)`;
}
