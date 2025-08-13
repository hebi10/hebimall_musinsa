import { Coupon, UserCoupon, UserCouponView } from '@/shared/types/coupon';

// 쿠폰 마스터 데이터 (coupons 컬렉션)
export const coupons: Coupon[] = [
  {
    id: 'C001',
    name: '신규회원 환영 쿠폰',
    type: '할인금액',
    value: 10000,
    minOrderAmount: 50000,
    expiryDate: '2024.12.31',
    description: '첫 구매 시 사용 가능한 특별 할인 쿠폰',
    isActive: true,
    isDirectAssign: false,
    usageLimit: 100,
    usedCount: 25,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'C002',
    name: '겨울 세일 쿠폰',
    type: '할인율',
    value: 20,
    minOrderAmount: 100000,
    expiryDate: '2024.12.25',
    description: '겨울 상품 전용 할인 쿠폰',
    isActive: true,
    isDirectAssign: false,
    usageLimit: 50,
    usedCount: 12,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01')
  },
  {
    id: 'C003',
    name: '무료배송 쿠폰',
    type: '무료배송',
    value: 0,
    expiryDate: '2024.12.15',
    description: '배송비 무료 혜택',
    isActive: true,
    isDirectAssign: false,
    usageLimit: 200,
    usedCount: 89,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  },
  {
    id: 'C004',
    name: '추석 특가 쿠폰',
    type: '할인율',
    value: 15,
    minOrderAmount: 80000,
    expiryDate: '2024.10.15',
    description: '추석 연휴 특별 할인',
    isActive: false, // 비활성화된 쿠폰
    isDirectAssign: true,
    usageLimit: 30,
    usedCount: 30,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-10-16')
  },
  {
    id: 'C005',
    name: '신년 맞이 특가',
    type: '할인금액',
    value: 15000,
    minOrderAmount: 120000,
    expiryDate: '2025.01.31',
    description: '새해 첫 구매 특별 혜택',
    isActive: true,
    isDirectAssign: true,
    usageLimit: 75,
    usedCount: 8,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  }
];

// 유저-쿠폰 매핑 데이터 (user_coupons 컬렉션)
export const userCoupons: UserCoupon[] = [
  {
    id: 'UC001',
    uid: 'user_1234',
    couponId: 'C001',
    status: '사용가능',
    issuedDate: '2024.08.06',
    createdAt: new Date('2024-08-06'),
    updatedAt: new Date('2024-08-06')
  },
  {
    id: 'UC002',
    uid: 'user_1234',
    couponId: 'C003',
    status: '사용완료',
    issuedDate: '2024.10.01',
    usedDate: '2024.11.28',
    orderId: 'ORDER_001',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-28')
  },
  {
    id: 'UC003',
    uid: 'user_5678',
    couponId: 'C004',
    status: '기간만료',
    issuedDate: '2024.09.15',
    expiredDate: '2024.10.16',
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-10-16')
  },
  {
    id: 'UC004',
    uid: 'user_1234',
    couponId: 'C002',
    status: '사용가능',
    issuedDate: '2024.11.01',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01')
  },
  {
    id: 'UC005',
    uid: 'user_1234',
    couponId: 'C005',
    status: '사용가능',
    issuedDate: '2024.12.01',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  }
];

// 테스트용 UserCouponView 데이터 (실제로는 서비스에서 join하여 생성)
export const userCouponViews: UserCouponView[] = [
  {
    id: 'UC001',
    uid: 'user_1234',
    couponId: 'C001',
    status: '사용가능',
    issuedDate: '2024.08.06',
    createdAt: new Date('2024-08-06'),
    updatedAt: new Date('2024-08-06'),
    coupon: coupons[0] // C001
  },
  {
    id: 'UC002',
    uid: 'user_1234',
    couponId: 'C003',
    status: '사용완료',
    issuedDate: '2024.10.01',
    usedDate: '2024.11.28',
    orderId: 'ORDER_001',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-28'),
    coupon: coupons[2] // C003
  },
  {
    id: 'UC004',
    uid: 'user_1234',
    couponId: 'C002',
    status: '사용가능',
    issuedDate: '2024.11.01',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    coupon: coupons[1] // C002
  },
  {
    id: 'UC005',
    uid: 'user_1234',
    couponId: 'C005',
    status: '사용가능',
    issuedDate: '2024.12.01',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    coupon: coupons[4] // C005
  }
];

// 레거시 호환성을 위한 기존 Coupon 인터페이스 (기존 컴포넌트에서 사용)
interface LegacyCoupon {
  id: string;
  name: string;
  type: '할인금액' | '할인율' | '무료배송';
  value: number;
  minOrderAmount?: number;
  expiryDate: string;
  status: '사용가능' | '사용완료' | '기간만료';
  usedDate?: string;
  description?: string;
}

// 레거시 컴포넌트 지원을 위한 변환 함수
export function convertToLegacyCoupons(userCouponViews: UserCouponView[]): LegacyCoupon[] {
  return userCouponViews.map(view => ({
    id: view.id, // userCoupon ID
    name: view.coupon.name,
    type: view.coupon.type,
    value: view.coupon.value,
    minOrderAmount: view.coupon.minOrderAmount,
    expiryDate: view.coupon.expiryDate,
    status: view.status,
    usedDate: view.usedDate,
    description: view.coupon.description
  }));
}

// 기존 컴포넌트 호환성을 위한 레거시 데이터
export const legacyCoupons: LegacyCoupon[] = convertToLegacyCoupons(userCouponViews);