// ─── 채팅 공통 응답 로직 (Next.js 환경) ────────────────
// functions/src/chatResponses.ts 와 내용이 동일합니다.

export type MenuKey =
  | 'agent'
  | 'order'
  | 'return'
  | 'coupon'
  | 'size'
  | 'payment'
  | 'member'
  | 'greeting'
  | 'default';

function matchMenu(lower: string): MenuKey {
  if (lower === '상담원연결' || lower === '상담원 연결') return 'agent';
  if (lower === '1' || lower.includes('1. 주문') || lower.includes('주문') || lower.includes('배송')) return 'order';
  if (lower === '2' || lower.includes('2. 반품') || lower.includes('반품') || lower.includes('교환')) return 'return';
  if (lower === '3' || lower.includes('3. 쿠폰') || lower.includes('쿠폰') || lower.includes('할인')) return 'coupon';
  if (lower === '4' || lower.includes('4. 사이즈') || lower.includes('사이즈') || lower.includes('크기')) return 'size';
  if (lower === '5' || lower.includes('5. 결제') || lower.includes('결제') || lower.includes('카드')) return 'payment';
  if (lower === '6' || lower.includes('6. 회원') || lower.includes('회원') || lower.includes('가입')) return 'member';
  if (lower.includes('안녕') || lower.includes('도움') || lower.includes('문의') || lower.length < 5) return 'greeting';
  return 'default';
}

const RESPONSES: Record<MenuKey, string> = {
  agent: `상담원 연결 요청을 확인했습니다. 잠시만 기다려 주세요.`,

  order: `주문 · 배송 안내

주문 확인: 마이페이지 > 주문내역에서 실시간 확인 가능합니다.
배송 시간: 평일 오후 2시 이전 주문 시 당일 발송됩니다.
배송비: 3,000원 (50,000원 이상 구매 시 무료)
배송 기간: 1~3일 (도서·산간 지역 제외)

추가 문의: 고객센터 sevim0104@naver.com

다른 도움이 필요하시면 번호를 선택하거나 직접 말씀해 주세요.`,

  return: `반품 · 교환 안내

신청 기간: 상품 수령 후 7일 이내
신청 조건: 상품 태그 및 포장 상태 유지
신청 방법: 마이페이지 > 주문내역 > 반품·교환 신청
배송비: 단순 변심의 경우 왕복 배송비 고객 부담

반품·교환 불가 상품
- 속옷, 양말 등 위생용품
- 커스텀 제작 상품

고객센터: sevim0104@naver.com`,

  coupon: `쿠폰 · 할인 혜택 안내

현재 진행 중인 혜택
- 신규 회원 10% 할인 쿠폰 (즉시 사용 가능)
- 생일 월 15% 할인 쿠폰
- 50,000원 이상 구매 시 무료배송
- 구매 금액의 1% 적립금 자동 지급

쿠폰 확인: 마이페이지 > 쿠폰함
등급별 추가 혜택은 회원 혜택(6번)에서 확인하세요.`,

  size: `사이즈 가이드

의류: 상품 상세 페이지 내 사이즈표 및 모델 착용 정보 참고
신발: 230~280mm (5mm 단위 제공, 브랜드별 핏 정보 제공)

사이즈 교환
- 수령 후 7일 이내 무료 교환 1회 가능
- 왕복 배송비 무료

정확한 사이즈 상담은 상담원연결을 입력해 주시면 안내드립니다.`,

  payment: `결제 방법 안내

지원 결제 수단
- 신용카드 (국내 전 카드사)
- 무통장입금
- 카카오페이
- 네이버페이
- 페이코
- 토스페이

결제 보안: SSL 암호화 및 개인정보 보호 적용

결제 오류 발생 시 고객센터(sevim0104@naver.com) 또는
상담원연결을 입력해 문의해 주세요.`,

  member: `회원 혜택 안내

신규 회원 혜택
- 10% 할인 쿠폰 (즉시 사용 가능)
- 첫 구매 무료배송
- 1,000원 적립금 지급

등급별 혜택
- 실버: 구매액 1% 적립 + 생일 쿠폰 10%
- 골드: 구매액 2% 적립 + 생일 쿠폰 15%
- 플래티넘: 구매액 3% 적립 + 생일 쿠폰 20%
- VIP: 구매액 5% 적립 + 생일 쿠폰 25%, 신상품 우선 구매

더 자세한 혜택은 상담원연결을 통해 확인하세요.`,

  greeting: `안녕하세요, STYNA 고객 지원팀입니다.

아래 번호를 선택하시거나 직접 문의 내용을 입력해 주세요.

1. 주문 · 배송 문의
2. 반품 · 교환 안내
3. 쿠폰 · 할인 혜택
4. 사이즈 가이드
5. 결제 방법 안내
6. 회원 혜택 정보

1:1 맞춤 상담을 원하시면 "상담원연결"을 입력해 주세요.`,

  default: `문의 내용을 확인했습니다.

빠른 답변을 원하시면 아래 번호를 선택해 주세요.

1. 주문 · 배송  2. 반품 · 교환  3. 쿠폰 · 할인
4. 사이즈 가이드  5. 결제 방법  6. 회원 혜택

1:1 맞춤 상담: "상담원연결" 입력
고객센터: sevim0104@naver.com (평일 09:00 ~ 18:00)`,
};

/** useAI = false 일 때 메뉴 기반 응답 */
export function getMenuResponse(message: string): string {
  const lower = message.toLowerCase().trim();
  return RESPONSES[matchMenu(lower)];
}

/** API 키 없는 환경에서의 AI 대체 응답 */
export function getAIFallbackResponse(message: string): string {
  const lower = message.toLowerCase().trim();
  const key = matchMenu(lower);

  if (key !== 'default' && key !== 'greeting' && key !== 'agent') {
    return RESPONSES[key];
  }

  return `안녕하세요, STYNA 고객 지원팀입니다.

말씀하신 내용을 확인했습니다. 더 정확한 답변을 드리려면 아래
항목 중 해당하시는 번호를 선택해 주시거나, 구체적인 내용을
알려주시면 빠르게 안내드리겠습니다.

1. 주문 · 배송  2. 반품 · 교환  3. 쿠폰 · 할인
4. 사이즈 가이드  5. 결제 방법  6. 회원 혜택

고객센터: sevim0104@naver.com`;
}
