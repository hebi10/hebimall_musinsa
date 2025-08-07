// 쿠폰 관련 타입 정의

/**
 * 쿠폰 마스터 (종류별 템플릿)
 * Firestore 컬렉션: coupons
 */
export interface Coupon {
  id: string; // 쿠폰 종류 ID (예: C001, C002...)
  name: string; // 쿠폰명
  type: '할인금액' | '할인율' | '무료배송'; // 쿠폰 타입
  value: number; // 할인 금액 또는 할인율
  minOrderAmount?: number; // 최소 주문 금액 (옵션)
  expiryDate: string; // 쿠폰 유효기간 (YYYY.MM.DD)
  description?: string; // 쿠폰 설명
  isActive: boolean; // 쿠폰 활성 상태 (발급 가능 여부)
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
}

/**
 * 유저-쿠폰 매핑 (발급된 쿠폰의 개별 상태 관리)
 * Firestore 컬렉션: user_coupons
 */
export interface UserCoupon {
  id: string; // 유저쿠폰 고유 ID (UUID)
  uid: string; // Firebase Auth 유저 UID
  couponId: string; // 쿠폰 마스터 ID (Coupon.id 참조)
  status: '사용가능' | '사용완료' | '기간만료'; // 쿠폰 상태
  issuedDate: string; // 발급일 (YYYY.MM.DD)
  usedDate?: string; // 사용일 (사용완료시에만)
  expiredDate?: string; // 만료일 (기간만료시에만)
  orderId?: string; // 사용된 주문 ID (사용완료시에만)
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
}

/**
 * 쿠폰 발급 요청 데이터
 */
export interface IssueCouponRequest {
  uid: string; // 발급받을 유저 UID
  couponId: string; // 발급할 쿠폰 ID
}

/**
 * 쿠폰 사용 요청 데이터
 */
export interface UseCouponRequest {
  userCouponId: string; // 사용할 유저쿠폰 ID
  orderId: string; // 주문 ID
  uid: string; // 유저 UID (보안 검증용)
}

/**
 * 쿠폰 등록 요청 데이터 (쿠폰 코드로 등록)
 */
export interface RegisterCouponRequest {
  uid: string; // 등록할 유저 UID
  couponCode: string; // 쿠폰 코드
}

/**
 * 쿠폰 응답 데이터
 */
export interface CouponResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 유저쿠폰과 쿠폰마스터가 조인된 뷰 (프론트엔드에서 사용)
 */
export interface UserCouponView extends UserCoupon {
  coupon: Coupon; // 쿠폰 마스터 정보
}

/**
 * 쿠폰 필터 옵션
 */
export interface CouponFilter {
  status?: '전체' | '사용가능' | '사용완료' | '기간만료';
  type?: '전체' | '할인금액' | '할인율' | '무료배송';
  sortBy?: 'issuedDate' | 'expiryDate' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 쿠폰 통계 정보
 */
export interface CouponStats {
  total: number; // 총 보유 쿠폰 수
  available: number; // 사용가능한 쿠폰 수
  used: number; // 사용완료한 쿠폰 수
  expired: number; // 만료된 쿠폰 수
}
