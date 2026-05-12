# Purchase Flow Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 상품 상세에서 주문 완료까지 구매 진입, 예상 금액, 서버 확정 금액이 같은 기준으로 작동하게 만든다.

**Architecture:** 서버 주문 생성은 계속 `POST /api/order`와 Functions transaction을 단일 확정 지점으로 유지한다. 클라이언트는 서버와 같은 금액 규칙을 가진 순수 유틸로 예상 금액만 계산하고, 주문 생성 요청에는 상품/옵션/배송지/결제수단/쿠폰/포인트만 보낸다. 두 상품 상세 경로는 같은 장바구니/바로구매 동작을 사용하게 맞춘다.

**Tech Stack:** Next.js 15 App Router, React 19, Firebase Auth/Firestore, Firebase Functions, Jest/ts-jest, TypeScript.

---

## File Structure

- Create: `src/shared/utils/orderPricing.ts`
  - 클라이언트 주문 예상 금액 계산 전용 순수 함수.
  - 상품 단가는 장바구니에 저장된 할인 후 단가(`price`)를 기준으로 하고, `discountAmount`는 표시용 할인액으로만 다룬다.
  - 쿠폰 최소 주문금액, 만료, 할인율/할인금액/무료배송, 배송비, 포인트 한도를 한 곳에서 계산한다.
- Create: `src/shared/utils/orderPricing.test.ts`
  - 장바구니/checkout 금액 불일치가 재발하지 않도록 순수 함수 단위 테스트를 둔다.
- Modify: `src/app/orders/cart/page.tsx`
  - 직접 쿠폰/배송비 계산을 제거하고 `orderPricing` 유틸을 사용한다.
  - 사용 불가 쿠폰은 드롭다운에서 비활성화하거나 표시 문구를 붙인다.
  - checkout으로 넘기는 `orderData`에는 서버 요청에 필요한 필드와 화면 표시용 스냅샷만 담는다.
- Modify: `src/app/orders/checkout/page.tsx`
  - 상품 할인액을 다시 차감하지 않는다.
  - 포인트 한도와 표시 금액은 `orderPricing` 유틸 기준으로 계산한다.
  - 서버 응답 금액과 화면 예상 금액이 다를 수 있음을 처리할 수 있도록 완료 화면은 계속 서버 조회값을 사용한다.
- Modify: `src/app/categories/[category]/products/[productId]/page.tsx`
  - 현재 alert-only 장바구니 담기와 핸들러 없는 바로 구매를 실제 구매 흐름에 연결한다.
  - `useAuth`, `useRouter`, `useAddToCart`를 사용해 `/products/[productId]` 상세와 동일한 동작을 제공한다.
- Modify: `docs/order-serverization.md`, `docs/coupon-system.md`, `docs/ai-harness-handoff.md`
  - 구현 후 변경된 정책, 검증 결과, 남은 리스크를 갱신한다.

---

### Task 1: Add Shared Client Pricing Rules

**Files:**
- Create: `src/shared/utils/orderPricing.ts`
- Create: `src/shared/utils/orderPricing.test.ts`

- [ ] **Step 1: Write failing pricing tests**

Create `src/shared/utils/orderPricing.test.ts`:

```ts
import {
  calculateOrderPreview,
  getCouponAvailability,
  isCouponExpired,
} from './orderPricing';
import { UserCouponView } from '@/shared/types/coupon';

const baseCouponView = (coupon: Partial<UserCouponView['coupon']>): UserCouponView => ({
  id: 'user-coupon-1',
  uid: 'user-1',
  couponId: coupon.id || 'coupon-1',
  status: '사용가능',
  issuedDate: '2026-05-01',
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  coupon: {
    id: coupon.id || 'coupon-1',
    name: coupon.name || '테스트 쿠폰',
    type: coupon.type || '할인금액',
    value: coupon.value ?? 3000,
    minOrderAmount: coupon.minOrderAmount,
    expiryDate: coupon.expiryDate || '2026-05-31',
    description: '',
    isActive: coupon.isActive ?? true,
    isDirectAssign: false,
    usageLimit: 100,
    usedCount: 0,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  },
});

describe('orderPricing', () => {
  const now = new Date('2026-05-12T00:00:00.000Z');

  test('uses discounted cart unit price as subtotal and does not subtract product discount again', () => {
    const preview = calculateOrderPreview({
      items: [
        {
          productId: 'p1',
          price: 8000,
          discountAmount: 2000,
          quantity: 2,
          isAvailable: true,
        },
      ],
      deliveryOption: 'standard',
      selectedCoupon: null,
      requestedPointAmount: 0,
      pointBalance: 0,
      now,
    });

    expect(preview.subtotal).toBe(16000);
    expect(preview.productDiscountAmount).toBe(4000);
    expect(preview.couponDiscount).toBe(0);
    expect(preview.deliveryFee).toBe(3000);
    expect(preview.estimatedTotalBeforePoints).toBe(19000);
    expect(preview.finalAmount).toBe(19000);
  });

  test('applies minimum order amount and fixed coupon discount before standard delivery fee', () => {
    const selectedCoupon = baseCouponView({
      type: '할인금액',
      value: 5000,
      minOrderAmount: 10000,
      expiryDate: '2026-05-31',
    });

    const preview = calculateOrderPreview({
      items: [{ productId: 'p1', price: 12000, discountAmount: 0, quantity: 1, isAvailable: true }],
      deliveryOption: 'standard',
      selectedCoupon,
      requestedPointAmount: 0,
      pointBalance: 0,
      now,
    });

    expect(preview.usableCoupon?.id).toBe('user-coupon-1');
    expect(preview.couponDiscount).toBe(5000);
    expect(preview.deliveryFee).toBe(3000);
    expect(preview.finalAmount).toBe(10000);
  });

  test('free shipping coupon removes standard shipping but not express shipping', () => {
    const selectedCoupon = baseCouponView({
      type: '무료배송',
      value: 0,
      minOrderAmount: 0,
      expiryDate: '2026-05-31',
    });

    const standard = calculateOrderPreview({
      items: [{ productId: 'p1', price: 12000, discountAmount: 0, quantity: 1, isAvailable: true }],
      deliveryOption: 'standard',
      selectedCoupon,
      requestedPointAmount: 0,
      pointBalance: 0,
      now,
    });

    const express = calculateOrderPreview({
      items: [{ productId: 'p1', price: 12000, discountAmount: 0, quantity: 1, isAvailable: true }],
      deliveryOption: 'express',
      selectedCoupon,
      requestedPointAmount: 0,
      pointBalance: 0,
      now,
    });

    expect(standard.deliveryFee).toBe(0);
    expect(standard.finalAmount).toBe(12000);
    expect(express.deliveryFee).toBe(5000);
    expect(express.finalAmount).toBe(17000);
  });

  test('rejects expired and minimum-order coupons from preview calculation', () => {
    const expiredCoupon = baseCouponView({ expiryDate: '2026-05-11' });
    const minimumCoupon = baseCouponView({ minOrderAmount: 50000, expiryDate: '2026-05-31' });

    expect(isCouponExpired('2026-05-11', now)).toBe(true);
    expect(getCouponAvailability(expiredCoupon, 20000, now).usable).toBe(false);
    expect(getCouponAvailability(minimumCoupon, 20000, now).usable).toBe(false);
  });

  test('caps points by current balance and payable amount', () => {
    const preview = calculateOrderPreview({
      items: [{ productId: 'p1', price: 12000, discountAmount: 0, quantity: 1, isAvailable: true }],
      deliveryOption: 'standard',
      selectedCoupon: null,
      requestedPointAmount: 999999,
      pointBalance: 10000,
      now,
    });

    expect(preview.maxUsablePoints).toBe(10000);
    expect(preview.pointUsed).toBe(10000);
    expect(preview.finalAmount).toBe(5000);
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts
```

Expected: FAIL because `src/shared/utils/orderPricing.ts` does not exist.

- [ ] **Step 3: Implement the pricing utility**

Create `src/shared/utils/orderPricing.ts`:

```ts
import { UserCouponView } from '@/shared/types/coupon';

export type OrderPricingDeliveryOption = 'standard' | 'express';

export interface OrderPricingItem {
  productId: string;
  price: number;
  discountAmount?: number;
  quantity: number;
  isAvailable?: boolean;
}

export interface CalculateOrderPreviewParams {
  items: OrderPricingItem[];
  deliveryOption: OrderPricingDeliveryOption;
  selectedCoupon?: UserCouponView | null;
  requestedPointAmount?: number;
  pointBalance?: number;
  now?: Date;
}

export interface CouponAvailability {
  usable: boolean;
  reason?: 'used' | 'inactive' | 'expired' | 'minimum';
}

export interface OrderPreview {
  subtotal: number;
  productDiscountAmount: number;
  couponDiscount: number;
  couponFreeShipping: boolean;
  deliveryFee: number;
  estimatedTotalBeforePoints: number;
  maxUsablePoints: number;
  pointUsed: number;
  finalAmount: number;
  usableCoupon: UserCouponView | null;
  couponAvailability: CouponAvailability;
}

const STANDARD_DELIVERY_FEE = 3000;
const EXPRESS_DELIVERY_FEE = 5000;
const STANDARD_FREE_SHIPPING_AMOUNT = 50000;

function toNonNegativeInteger(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.floor(parsed));
}

function normalizeDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function parseExpiryDate(value: string): Date | null {
  const normalized = value.replace(/\./g, '-').replace(/\//g, '-').trim();
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function isCouponExpired(expiryDate: string, now: Date = new Date()): boolean {
  const expiry = parseExpiryDate(expiryDate);
  if (!expiry) {
    return true;
  }
  return normalizeDay(expiry).getTime() < normalizeDay(now).getTime();
}

export function getCouponAvailability(
  userCoupon: UserCouponView,
  subtotal: number,
  now: Date = new Date()
): CouponAvailability {
  if (userCoupon.status !== '사용가능') {
    return { usable: false, reason: 'used' };
  }

  if (userCoupon.coupon.isActive !== true) {
    return { usable: false, reason: 'inactive' };
  }

  if (isCouponExpired(userCoupon.coupon.expiryDate, now)) {
    return { usable: false, reason: 'expired' };
  }

  const minOrderAmount = toNonNegativeInteger(userCoupon.coupon.minOrderAmount);
  if (minOrderAmount > 0 && subtotal < minOrderAmount) {
    return { usable: false, reason: 'minimum' };
  }

  return { usable: true };
}

export function calculateCouponDiscount(subtotal: number, userCoupon: UserCouponView | null): {
  discount: number;
  freeShipping: boolean;
} {
  if (!userCoupon) {
    return { discount: 0, freeShipping: false };
  }

  const value = toNonNegativeInteger(userCoupon.coupon.value);
  if (userCoupon.coupon.type === '할인율') {
    return {
      discount: Math.floor(subtotal * Math.min(100, value) / 100),
      freeShipping: false,
    };
  }

  if (userCoupon.coupon.type === '할인금액') {
    return {
      discount: Math.min(subtotal, value),
      freeShipping: false,
    };
  }

  return {
    discount: 0,
    freeShipping: userCoupon.coupon.type === '무료배송',
  };
}

export function calculateDeliveryFee(
  totalAfterCoupon: number,
  deliveryOption: OrderPricingDeliveryOption,
  couponFreeShipping: boolean
): number {
  if (deliveryOption === 'express') {
    return EXPRESS_DELIVERY_FEE;
  }

  if (totalAfterCoupon >= STANDARD_FREE_SHIPPING_AMOUNT || couponFreeShipping) {
    return 0;
  }

  return STANDARD_DELIVERY_FEE;
}

export function calculateOrderPreview(params: CalculateOrderPreviewParams): OrderPreview {
  const items = params.items.filter((item) => item.isAvailable !== false);
  const subtotal = items.reduce(
    (sum, item) => sum + toNonNegativeInteger(item.price) * toNonNegativeInteger(item.quantity),
    0
  );
  const productDiscountAmount = items.reduce(
    (sum, item) => sum + toNonNegativeInteger(item.discountAmount) * toNonNegativeInteger(item.quantity),
    0
  );

  const couponAvailability = params.selectedCoupon
    ? getCouponAvailability(params.selectedCoupon, subtotal, params.now)
    : { usable: true };
  const usableCoupon = params.selectedCoupon && couponAvailability.usable ? params.selectedCoupon : null;
  const coupon = calculateCouponDiscount(subtotal, usableCoupon);
  const totalAfterCoupon = Math.max(0, subtotal - coupon.discount);
  const deliveryFee = calculateDeliveryFee(totalAfterCoupon, params.deliveryOption, coupon.freeShipping);
  const estimatedTotalBeforePoints = Math.max(0, totalAfterCoupon + deliveryFee);
  const maxUsablePoints = Math.min(
    toNonNegativeInteger(params.pointBalance),
    estimatedTotalBeforePoints
  );
  const pointUsed = Math.min(toNonNegativeInteger(params.requestedPointAmount), maxUsablePoints);

  return {
    subtotal,
    productDiscountAmount,
    couponDiscount: coupon.discount,
    couponFreeShipping: coupon.freeShipping,
    deliveryFee,
    estimatedTotalBeforePoints,
    maxUsablePoints,
    pointUsed,
    finalAmount: Math.max(0, estimatedTotalBeforePoints - pointUsed),
    usableCoupon,
    couponAvailability,
  };
}
```

- [ ] **Step 4: Run pricing tests**

Run:

```bash
npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/shared/utils/orderPricing.ts src/shared/utils/orderPricing.test.ts
git commit -m "feat: 주문 예상 금액 계산 유틸 추가"
```

---

### Task 2: Make Cart And Checkout Use One Pricing Source

**Files:**
- Modify: `src/app/orders/cart/page.tsx`
- Modify: `src/app/orders/checkout/page.tsx`
- Test: `src/shared/utils/orderPricing.test.ts`

- [ ] **Step 1: Add a regression test for checkout handoff data**

Append to `src/shared/utils/orderPricing.test.ts`:

```ts
test('keeps selected coupon unusable when subtotal drops below minimum order amount', () => {
  const now = new Date('2026-05-12T00:00:00.000Z');
  const selectedCoupon = baseCouponView({
    type: '할인금액',
    value: 5000,
    minOrderAmount: 30000,
    expiryDate: '2026-05-31',
  });

  const preview = calculateOrderPreview({
    items: [{ productId: 'p1', price: 12000, discountAmount: 0, quantity: 1, isAvailable: true }],
    deliveryOption: 'standard',
    selectedCoupon,
    requestedPointAmount: 0,
    pointBalance: 0,
    now,
  });

  expect(preview.usableCoupon).toBeNull();
  expect(preview.couponAvailability.reason).toBe('minimum');
  expect(preview.couponDiscount).toBe(0);
  expect(preview.finalAmount).toBe(15000);
});
```

- [ ] **Step 2: Run the focused regression test**

Run:

```bash
npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts
```

Expected: PASS after Task 1.

- [ ] **Step 3: Replace cart page ad hoc calculations**

In `src/app/orders/cart/page.tsx`, add imports:

```ts
import { useMemo } from "react";
import {
  calculateOrderPreview,
  getCouponAvailability,
} from "@/shared/utils/orderPricing";
```

Change the React import:

```ts
import { useState, useEffect, useMemo } from "react";
```

Remove `calculateDiscount` from the coupon hook destructuring:

```ts
const { userCoupons } = useCoupon();
```

Replace the current `selectedItems`, `subtotal`, `totalDiscountAmount`, `deliveryFee`, `couponDiscount`, `finalAmount` block with:

```ts
const selectedItems = cartItems.filter(item => item.selected && item.isAvailable);
const selectedCouponView = userCoupons?.find(coupon => coupon.id === selectedCoupon) || null;
const orderPreview = useMemo(
  () => calculateOrderPreview({
    items: selectedItems,
    deliveryOption,
    selectedCoupon: selectedCouponView,
    requestedPointAmount: 0,
    pointBalance: 0,
  }),
  [selectedItems, deliveryOption, selectedCouponView]
);

const subtotal = orderPreview.subtotal;
const totalDiscountAmount = orderPreview.productDiscountAmount;
const couponDiscount = orderPreview.couponDiscount;
const deliveryFee = orderPreview.deliveryFee;
const finalAmount = orderPreview.finalAmount;
```

Replace coupon option rendering with:

```tsx
{userCoupons?.map(coupon => {
  const availability = getCouponAvailability(coupon, subtotal);
  const suffix = !availability.usable
    ? availability.reason === "minimum"
      ? ` - ${coupon.coupon.minOrderAmount?.toLocaleString()}원 이상 사용`
      : availability.reason === "expired"
        ? " - 만료"
        : " - 사용 불가"
    : "";

  return (
    <option key={coupon.id} value={coupon.id} disabled={!availability.usable}>
      {coupon.coupon.name} - {coupon.coupon.type === '할인율'
        ? `${coupon.coupon.value}%`
        : coupon.coupon.type === '무료배송'
          ? '무료배송'
          : `${coupon.coupon.value.toLocaleString()}원`} 할인{suffix}
    </option>
  );
})}
```

In `handleCheckout`, store only a usable coupon:

```ts
selectedCoupon: orderPreview.usableCoupon?.id || "",
pricingPreview: {
  subtotal: orderPreview.subtotal,
  productDiscountAmount: orderPreview.productDiscountAmount,
  couponDiscount: orderPreview.couponDiscount,
  deliveryFee: orderPreview.deliveryFee,
  finalAmount: orderPreview.finalAmount,
},
```

- [ ] **Step 4: Replace checkout page ad hoc calculations**

In `src/app/orders/checkout/page.tsx`, add imports:

```ts
import { useCoupon } from "@/context/couponProvider";
import { calculateOrderPreview } from "@/shared/utils/orderPricing";
```

Extend `CheckoutDraft`:

```ts
interface CheckoutDraft {
  items: CheckoutItem[];
  selectedCoupon?: string;
  deliveryOption: "standard" | "express";
  pricingPreview?: {
    subtotal: number;
    productDiscountAmount: number;
    couponDiscount: number;
    deliveryFee: number;
    finalAmount: number;
  };
}
```

Inside the component, add:

```ts
const { userCoupons } = useCoupon();
const selectedCouponView = userCoupons?.find((coupon) => coupon.id === orderData?.selectedCoupon) || null;
```

Replace the current `subtotal`, `discountAmount`, `deliveryFee`, `estimatedTotal`, `maxUsablePoints`, `finalAmount` calculations with:

```ts
const orderPreview = useMemo(() => {
  if (!orderData) {
    return null;
  }

  return calculateOrderPreview({
    items: orderData.items.map((item) => ({
      productId: item.productId,
      price: item.price,
      discountAmount: item.discountAmount,
      quantity: item.quantity,
      isAvailable: true,
    })),
    deliveryOption: orderData.deliveryOption,
    selectedCoupon: selectedCouponView,
    requestedPointAmount: usePoints,
    pointBalance,
  });
}, [orderData, selectedCouponView, usePoints, pointBalance]);

const subtotal = orderPreview?.subtotal ?? 0;
const discountAmount = orderPreview?.productDiscountAmount ?? 0;
const couponDiscount = orderPreview?.couponDiscount ?? 0;
const deliveryFee = orderPreview?.deliveryFee ?? 0;
const maxUsablePoints = orderPreview?.maxUsablePoints ?? 0;
const finalAmount = orderPreview?.finalAmount ?? 0;
```

Add a coupon discount display row after product discount:

```tsx
{couponDiscount > 0 && (
  <div className={styles.summaryItem}>
    <span>쿠폰 할인</span>
    <span>-{couponDiscount.toLocaleString()}원</span>
  </div>
)}
```

Keep `OrderService.createOrder` unchanged except for preserving `selectedCoupon: orderPreview?.usableCoupon?.id || undefined`:

```ts
selectedCoupon: orderPreview?.usableCoupon?.id || undefined,
```

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts
npm run typecheck
```

Expected: both PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/app/orders/cart/page.tsx src/app/orders/checkout/page.tsx src/shared/utils/orderPricing.test.ts
git commit -m "fix: 주문 금액 계산 기준 통합"
```

---

### Task 3: Connect Category Product Detail To Real Purchase Flow

**Files:**
- Modify: `src/app/categories/[category]/products/[productId]/page.tsx`

- [ ] **Step 1: Identify the target behavior**

Use `/products/[productId]` as the behavior source:

- unauthenticated user: alert and route to `/auth/login`
- missing required size/color: alert and stop
- insufficient stock: alert and stop
- add to cart: call `useAddToCart`, then offer moving to `/orders/cart`
- buy now: write `orderData` to `sessionStorage`, then route to `/orders/checkout`

- [ ] **Step 2: Add required imports**

In `src/app/categories/[category]/products/[productId]/page.tsx`, add:

```ts
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authProvider';
import { useAddToCart } from '@/shared/hooks/useCart';
```

Inside the component, add:

```ts
const router = useRouter();
const { user } = useAuth();
const addToCartMutation = useAddToCart();
const [isAddingToCart, setIsAddingToCart] = useState(false);
```

- [ ] **Step 3: Replace alert-only add-to-cart**

Replace `handleAddToCart` with:

```ts
const handleAddToCart = async () => {
  if (!product) return;

  if (!user) {
    alert('로그인이 필요합니다.');
    router.push('/auth/login');
    return;
  }

  if (product.sizes.length > 0 && !selectedSize) {
    alert('사이즈를 선택해주세요.');
    return;
  }

  if (product.colors.length > 0 && !selectedColor) {
    alert('색상을 선택해주세요.');
    return;
  }

  if (product.stock === 0 || quantity > product.stock) {
    alert('재고가 부족합니다.');
    return;
  }

  setIsAddingToCart(true);
  try {
    await addToCartMutation.mutateAsync({
      userId: user.uid,
      product,
      request: {
        productId: product.id,
        size: selectedSize || '',
        color: selectedColor || '',
        quantity,
      },
    });

    alert('장바구니에 추가되었습니다.');
    if (confirm('장바구니로 이동하시겠습니까?')) {
      router.push('/orders/cart');
    }
  } catch (error) {
    console.error('장바구니 추가 실패:', error);
    alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
  } finally {
    setIsAddingToCart(false);
  }
};
```

- [ ] **Step 4: Add real buy-now behavior**

Add:

```ts
const handleBuyNow = () => {
  if (!product) return;

  if (!user) {
    alert('로그인이 필요합니다.');
    router.push('/auth/login');
    return;
  }

  if (product.sizes.length > 0 && !selectedSize) {
    alert('사이즈를 선택해주세요.');
    return;
  }

  if (product.colors.length > 0 && !selectedColor) {
    alert('색상을 선택해주세요.');
    return;
  }

  if (product.stock === 0 || quantity > product.stock) {
    alert('재고가 부족합니다.');
    return;
  }

  const orderData = {
    items: [{
      productId: product.id,
      id: `${product.id}-${selectedSize || ''}-${selectedColor || ''}`,
      productName: product.name,
      productImage: product.mainImage || product.images?.[0] || '',
      brand: product.brand,
      size: selectedSize || '',
      color: selectedColor || '',
      quantity,
      price: product.price,
      discountAmount: product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice - product.price
        : 0,
    }],
    selectedCoupon: '',
    deliveryOption: 'standard',
  };

  sessionStorage.setItem('orderData', JSON.stringify(orderData));
  router.push('/orders/checkout');
};
```

Attach it to the button:

```tsx
<button
  onClick={handleBuyNow}
  disabled={product.stock === 0}
  className={`${styles.buyNowButton} ${product.stock === 0 ? styles.disabled : ''}`}
>
  바로 구매
</button>
```

Update add-to-cart button disabled text:

```tsx
<button
  onClick={handleAddToCart}
  disabled={product.stock === 0 || isAddingToCart}
  className={`${styles.addToCartButton} ${product.stock === 0 ? styles.disabled : ''}`}
>
  {isAddingToCart ? '담는 중...' : '장바구니 담기'}
</button>
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/app/categories/[category]/products/[productId]/page.tsx
git commit -m "fix: 카테고리 상품 상세 구매 흐름 연결"
```

---

### Task 4: Verify And Document The Flow

**Files:**
- Modify: `docs/order-serverization.md`
- Modify: `docs/coupon-system.md`
- Modify: `docs/ai-harness-handoff.md`

- [ ] **Step 1: Run functional checks**

Run:

```bash
npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts
npm run typecheck
npm run test:functions -- --runTestsByPath functions/__tests__/orderDomain.test.ts functions/__tests__/couponDomain.test.ts
npm run functions:build
```

Expected:

- `orderPricing.test.ts`: PASS
- `typecheck`: PASS
- Functions domain tests: PASS
- `functions:build`: PASS

- [ ] **Step 2: Try lint and build, but record known local blockers**

Run:

```bash
npm run lint
npm run build
```

Expected in current sandbox:

- `npm run lint` may fail with `'eslint' is not recognized` until `npm install` is run in a network-enabled environment.
- `npm run build` may compile successfully and then fail with Next worker `spawn EPERM`.

Do not hide these failures. Record exact outcomes in `docs/ai-harness-handoff.md`.

- [ ] **Step 3: Manual E2E checklist for a real browser or Firebase preview**

Use a real authenticated test account and verify:

```md
- [ ] `/products/[productId]` 장바구니 담기 후 `/orders/cart`에 실제 항목이 보인다.
- [ ] `/products/[productId]` 바로 구매 후 `/orders/checkout`에 같은 상품/수량/옵션이 보인다.
- [ ] `/categories/[category]/products/[productId]` 장바구니 담기 후 `/orders/cart`에 실제 항목이 보인다.
- [ ] `/categories/[category]/products/[productId]` 바로 구매 후 `/orders/checkout`에 같은 상품/수량/옵션이 보인다.
- [ ] 최소 주문금액 미달 쿠폰은 주문 화면에서 사용 불가로 보인다.
- [ ] 무료배송 쿠폰은 일반배송 배송비만 0원으로 만든다.
- [ ] 포인트 입력은 보유 포인트와 결제 예정 금액을 넘지 않는다.
- [ ] 주문 완료 화면은 서버 주문 조회값의 `totalAmount`, `discountAmount`, `deliveryFee`, `pointUsed`, `finalAmount`를 표시한다.
```

- [ ] **Step 4: Update docs**

Append to `docs/order-serverization.md`:

```md
## 2026-05-12 구매 흐름 보정
- 두 상품 상세 경로(`/products/[productId]`, `/categories/[category]/products/[productId]`)의 장바구니/바로구매 진입 동작을 맞췄다.
- 장바구니와 checkout의 예상 금액 계산을 `src/shared/utils/orderPricing.ts`로 통합했다.
- checkout은 이미 할인된 상품 단가에서 상품 할인액을 다시 차감하지 않고, 서버 주문 생성은 기존처럼 Functions에서 최종 재계산한다.
```

Append to `docs/coupon-system.md` under 검증:

```md
- 2026-05-12: 장바구니/checkout 쿠폰 예상 계산을 `orderPricing` 유틸로 통합해 최소 주문금액, 만료, 무료배송 조건을 화면에서도 반영하도록 정리했다.
```

Replace `docs/ai-harness-handoff.md` with a 60-line 이하 summary containing:

```md
### commit message
- `fix: align purchase flow calculations`

### 인수인계 (최대 3개)
1. 구매 진입점 보정
   - `/categories/[category]/products/[productId]` 장바구니 담기/바로구매를 실제 주문 흐름에 연결.

2. 금액 계산 통합
   - `src/shared/utils/orderPricing.ts`로 장바구니/checkout 예상 금액 계산 통합.
   - 쿠폰 최소 주문금액/만료/무료배송과 포인트 한도를 화면에서 반영.

3. 서버 확정 흐름 유지
   - `/api/order` Functions transaction이 최종 금액, 재고, 쿠폰, 포인트, 장바구니 정리를 확정.

### 검증
- `npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts`: <결과>
- `npm run typecheck`: <결과>
- `npm run test:functions -- --runTestsByPath functions/__tests__/orderDomain.test.ts functions/__tests__/couponDomain.test.ts`: <결과>
- `npm run functions:build`: <결과>
- `npm run lint`: <결과 또는 환경 제약>
- `npm run build`: <결과 또는 환경 제약>

### 남은 작업 (최대 3개)
1. 인증 테스트 계정으로 실제 주문 생성 E2E 확인.
2. Firebase Hosting rewrite `/api/order` 배포 환경 확인.
3. 옵션별 재고/가격 구조가 도입되면 서버 주문 계산 확장.
```

- [ ] **Step 5: Commit Task 4**

```bash
git add docs/order-serverization.md docs/coupon-system.md docs/ai-harness-handoff.md
git commit -m "docs: 구매 흐름 보정 결과 정리"
```

---

## Execution Notes

- 작업 전 `docs/README.md`를 읽고, 관련 문서는 `order-serverization.md`, `coupon-system.md`, `quality-gates.md`만 사용한다.
- 작업 중 기존 미커밋 변경이 많을 수 있다. 사용자 변경을 되돌리지 말고, 이번 작업 파일만 선별해서 stage한다.
- 서버 주문 생성은 보안 경계다. 클라이언트 예상 금액이 생겨도 `OrderService.createOrder` 요청에 클라이언트 계산 총액을 추가하지 않는다.
- `/cart`는 mock 장바구니 페이지라 이번 핵심 구매 흐름에서는 제외한다. 실제 주문 장바구니는 `/orders/cart`다.
