# 🎫 HebIMall 쿠폰 시스템

## 📋 개요

별도 `user_coupons` 컬렉션 구조를 사용한 확장성 있는 쿠폰 관리 시스템입니다.

## 🏗️ 시스템 아키텍처

### Firestore 컬렉션 구조

```
coupons/                    # 쿠폰 마스터 (종류별 템플릿)
  ├─ {couponId}
      ├─ id: string         # 쿠폰 ID (C001, C002...)
      ├─ name: string       # 쿠폰명
      ├─ type: string       # '할인금액' | '할인율' | '무료배송'
      ├─ value: number      # 할인값
      ├─ minOrderAmount     # 최소 주문금액
      ├─ expiryDate         # 만료일 (YYYY.MM.DD)
      ├─ description        # 설명
      ├─ isActive: boolean  # 활성 상태
      ├─ createdAt          # 생성일
      └─ updatedAt          # 수정일

user_coupons/               # 유저-쿠폰 매핑 (발급/사용 상태 관리)
  ├─ {userCouponId}
      ├─ uid: string        # 사용자 UID
      ├─ couponId: string   # 쿠폰 마스터 참조 ID
      ├─ status: string     # '사용가능' | '사용완료' | '기간만료'
      ├─ issuedDate         # 발급일
      ├─ usedDate           # 사용일 (사용완료시)
      ├─ expiredDate        # 만료일 (기간만료시)
      ├─ orderId            # 사용된 주문 ID
      ├─ createdAt          # 생성일
      └─ updatedAt          # 수정일
```

## 📁 파일 구조

```
src/
├── shared/
│   ├── types/
│   │   └── coupon.ts             # 쿠폰 타입 정의
│   └── services/
│       └── couponService.ts      # 쿠폰 서비스 로직
├── context/
│   └── couponProvider.tsx        # 쿠폰 컨텍스트 프로바이더
├── app/mypage/coupons/
│   ├── page.tsx                  # 쿠폰 페이지 (업데이트)
│   └── page.module.css           # 스타일
├── mocks/
│   └── coupon.ts                 # 목업 데이터 (새 구조 적용)
functions/src/
└── couponFunctions.ts            # Firebase Functions
scripts/
└── seed-coupons.ts              # Firestore 시드 데이터
```

## 🔧 주요 기능

### 1. 쿠폰 서비스 (CouponService)

- **쿠폰 마스터 조회**: 활성화된 쿠폰 종류들
- **사용자 쿠폰 조회**: 필터링, 정렬 지원
- **쿠폰 통계**: 전체/사용가능/사용완료/만료 개수
- **주문별 사용가능 쿠폰**: 최소 주문금액, 만료일 검증
- **할인금액 계산**: 쿠폰 타입별 할인금액 계산

### 2. 쿠폰 컨텍스트 (CouponProvider)

- **상태 관리**: 사용자 쿠폰 목록, 통계, 로딩, 에러
- **액션 함수**: 발급, 사용, 등록, 새로고침
- **자동 동기화**: 사용자 변경시 쿠폰 데이터 자동 갱신

### 3. Firebase Functions

- **issueCoupon**: 쿠폰 발급 (중복 검증 포함)
- **useCoupon**: 쿠폰 사용 (만료일 검증 포함)
- **registerCoupon**: 쿠폰 코드로 등록
- **cleanupExpiredCoupons**: 만료 쿠폰 자동 정리

## 🚀 사용 방법

### 1. 환경 설정

```bash
# 패키지 설치
npm install

# 환경 변수 설정 (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... 기타 Firebase 설정
```

### 2. 시드 데이터 생성

```bash
# TypeScript로 실행
npx ts-node scripts/seed-coupons.ts

# 또는 컴파일 후 실행
npm run build
node dist/scripts/seed-coupons.js
```

### 3. Firebase Functions 배포

```bash
cd functions
npm install
npm run build
npm run deploy
```

### 4. 컨텍스트 프로바이더 설정

```tsx
// layout.tsx 또는 _app.tsx
import { CouponProvider } from '@/context/couponProvider';

export default function Layout({ children }) {
  return (
    <CouponProvider>
      {children}
    </CouponProvider>
  );
}
```

### 5. 컴포넌트에서 사용

```tsx
import { useCoupon } from '@/context/couponProvider';

export default function MyComponent() {
  const {
    userCoupons,
    couponStats,
    loading,
    issueCoupon,
    useCoupon,
    getDaysUntilExpiry
  } = useCoupon();

  // 쿠폰 발급
  const handleIssueCoupon = async (couponId: string) => {
    try {
      const response = await issueCoupon(couponId);
      if (response.success) {
        alert('쿠폰이 발급되었습니다!');
      }
    } catch (error) {
      alert('발급 실패: ' + error.message);
    }
  };

  // 쿠폰 사용
  const handleUseCoupon = async (userCouponId: string, orderId: string) => {
    try {
      const response = await useCoupon(userCouponId, orderId);
      if (response.success) {
        alert('쿠폰이 사용되었습니다!');
      }
    } catch (error) {
      alert('사용 실패: ' + error.message);
    }
  };

  return (
    <div>
      <h2>보유 쿠폰: {couponStats?.total}개</h2>
      {userCoupons.map(uc => (
        <div key={uc.id}>
          <h3>{uc.coupon.name}</h3>
          <p>상태: {uc.status}</p>
          {uc.status === '사용가능' && (
            <button onClick={() => handleUseCoupon(uc.id, 'ORDER_123')}>
              사용하기
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🔍 주요 타입

### Coupon (쿠폰 마스터)
```typescript
interface Coupon {
  id: string;
  name: string;
  type: '할인금액' | '할인율' | '무료배송';
  value: number;
  minOrderAmount?: number;
  expiryDate: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserCoupon (유저-쿠폰 매핑)
```typescript
interface UserCoupon {
  id: string;
  uid: string;
  couponId: string;
  status: '사용가능' | '사용완료' | '기간만료';
  issuedDate: string;
  usedDate?: string;
  expiredDate?: string;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserCouponView (조인된 뷰)
```typescript
interface UserCouponView extends UserCoupon {
  coupon: Coupon;
}
```

## 🎯 활용 예시

### 1. 주문시 사용가능한 쿠폰 조회
```typescript
const availableCoupons = await getAvailableCouponsForOrder(orderAmount);
```

### 2. 쿠폰별 할인금액 계산
```typescript
const discount = calculateDiscount(coupon, orderAmount);
```

### 3. 만료임박 쿠폰 확인
```typescript
const daysLeft = getDaysUntilExpiry(coupon.expiryDate);
const isExpiringSoon = daysLeft <= 7;
```

## 🔐 보안 고려사항

1. **인증 확인**: 모든 Functions에서 사용자 인증 검증
2. **권한 확인**: 본인 쿠폰만 사용/조회 가능
3. **중복 방지**: 동일 쿠폰 중복 발급 방지
4. **만료일 검증**: 쿠폰 사용시 실시간 만료일 확인

## 📈 확장성

- **쿠폰 코드 시스템**: 별도 coupon_codes 컬렉션으로 확장 가능
- **사용 제한**: 일일 사용 한도, 카테고리별 제한 등 추가 가능
- **이벤트 쿠폰**: 특정 이벤트와 연동한 자동 발급
- **통계 분석**: 쿠폰 사용 패턴 분석 기능 추가

## 🐛 문제 해결

### 컨텍스트 에러
- CouponProvider가 최상위에 설정되어 있는지 확인
- useAuthUser 훅이 정상 작동하는지 확인

### Firebase Functions 에러
- Functions 지역(region) 설정 확인
- 환경 변수 설정 확인
- Firebase Admin SDK 권한 확인

### 데이터 동기화 문제
- Firestore 보안 규칙 확인
- 네트워크 연결 상태 확인
- 에러 로그 확인

## 📝 TODO

- [ ] 실제 쿠폰 컨텍스트 적용 (현재는 임시 목업 데이터 사용)
- [ ] 쿠폰 코드 시스템 구현
- [ ] 관리자 쿠폰 생성/관리 페이지
- [ ] 쿠폰 사용 히스토리 페이지
- [ ] 알림 시스템 (만료 임박 알림)
- [ ] A/B 테스트용 쿠폰 시스템
