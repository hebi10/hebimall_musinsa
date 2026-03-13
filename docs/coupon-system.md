# 쿠폰 시스템

## 구조

`coupons` 컬렉션에 쿠폰 마스터 데이터를 저장하고, `user_coupons` 컬렉션에서 사용자별 발급/사용 상태를 관리합니다.

### Firestore 컬렉션

```
coupons/
  {couponId}
    id, name, type('할인금액'|'할인율'|'무료배송'), value, minOrderAmount,
    expiryDate, description, isActive, createdAt, updatedAt

user_coupons/
  {userCouponId}
    uid, couponId, status('사용가능'|'사용완료'|'기간만료'),
    issuedDate, usedDate, orderId, createdAt, updatedAt
```

## 파일 구조

```
src/shared/types/coupon.ts            # 타입 정의
src/shared/services/couponService.ts  # 서비스 로직
src/context/couponProvider.tsx        # Context Provider
src/app/mypage/coupons/               # 쿠폰 페이지
functions/src/couponFunctions.ts      # Cloud Functions
scripts/seed-coupons.ts              # 시드 데이터
```

## 기능

### CouponService
- 쿠폰 마스터 및 사용자 쿠폰 조회 (필터, 정렬)
- 주문 시 사용 가능 쿠폰 조회 (최소 주문금액, 만료일 검증)
- 타입별 할인금액 계산

### CouponProvider
- 사용자 쿠폰 목록, 통계, 로딩 상태 관리
- 발급/사용/등록/새로고침 액션
- 사용자 변경 시 자동 갱신

### Cloud Functions
- `issueCoupon`: 발급 (중복 검증)
- `useCoupon`: 사용 (만료일 검증)
- `registerCoupon`: 코드 기반 쿠폰 등록
- `cleanupExpiredCoupons`: 만료 쿠폰 정리 (scheduled)

## 보안

- 모든 Functions에서 인증 검증
- 본인 쿠폰만 조회/사용 가능
- 동일 쿠폰 중복 발급 방지
- 사용 시 만료일 재검증

## 미구현

- 쿠폰 코드 시스템
- 관리자 쿠폰 생성 페이지
- 만료 임박 알림
