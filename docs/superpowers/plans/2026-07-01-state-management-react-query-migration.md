# State Management React Query Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버/Firestore 원본 데이터는 React Query로 옮기고, Context는 인증과 꼭 필요한 앱 전역 상태만 남긴다.

**Architecture:** 기존 `useCart.ts` 패턴을 기준으로 도메인별 query hook을 추가한다. Provider는 한 번에 삭제하지 않고 사용처를 hook으로 전환한 뒤 빈 Provider부터 제거한다.

**Tech Stack:** Next.js 15 App Router, React 19, TanStack React Query v5, Firebase/Firestore, Jest, TypeScript, ESLint.

---

## 현재 판단

유지:
- `src/context/authProvider.tsx`: Firebase Auth 세션, 관리자 claim, 로그인/로그아웃 액션은 Context 유지.
- `src/app/_components/providers/ReactQueryProvider.tsx`: 전역 QueryClient 유지.
- `src/shared/hooks/useCart.ts`, `src/shared/hooks/usePoint.ts`, `src/shared/hooks/useDashboardQuery.ts`, `src/shared/hooks/useUserData.ts`: 이미 React Query 방향이 맞음.

전환:
- `src/context/productProvider.tsx`: 상품 서버 데이터와 필터/검색 UI 상태가 섞여 있음.
- `src/context/reviewProvider.tsx`: 리뷰 서버 데이터, 페이지네이션, mutation을 수동 관리.
- `src/context/couponProvider.tsx`: 사용자 쿠폰/쿠폰 통계/활성 쿠폰 서버 데이터를 수동 관리.
- `src/context/eventProvider.tsx`: 이벤트 서버 데이터와 필터 UI 상태가 섞여 있음.
- `src/context/categoryProvider.tsx`: 카테고리 서버 데이터를 수동 관리.
- `src/context/userActivityProvider.tsx`: 최근 본 상품/위시리스트는 서버+localStorage 혼합 데이터라 query hook으로 전환하되, 낙관적 UI가 필요한 부분만 조심.

---

## 파일 구조

Create:
- `src/shared/hooks/useProducts.ts`: 상품 목록, 홈 상품, 상품 상세, 카테고리/브랜드 query와 상품 mutation.
- `src/shared/hooks/useReviews.ts`: 상품 리뷰, 전체 리뷰, 리뷰 요약, 사용자 리뷰 query와 리뷰 mutation.
- `src/shared/hooks/useCoupons.ts`: 사용자 쿠폰, 쿠폰 통계, 활성 쿠폰 query와 쿠폰 mutation.
- `src/shared/hooks/useEvents.ts`: 이벤트 목록 query와 이벤트 유틸 hook.
- `src/shared/hooks/useCategoriesQuery.ts`: 카테고리 query.
- `src/shared/hooks/useUserActivityQuery.ts`: 최근 본 상품/위시리스트 query와 mutation.

Modify:
- `src/app/_components/providers/RootProviders.tsx`: 전환 완료 후 불필요한 Provider 제거.
- `src/context/*.tsx`: 사용처 전환 후 제거하거나 인증 외 Context만 유지.
- 각 사용처: `useProduct`, `useReview`, `useCoupon`, `useEvent`, `useCategories`, `useUserActivity` import를 새 query hook으로 교체.

Test:
- 기존 테스트를 우선 재사용한다.
- hook 자체는 서비스 mock 기반 최소 테스트만 추가한다.
- 전체 검증은 `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm test`.

---

### Task 1: Query Key 표준 추가

**Files:**
- Create: `src/shared/hooks/useProducts.ts`
- Create: `src/shared/hooks/useReviews.ts`
- Create: `src/shared/hooks/useCoupons.ts`
- Create: `src/shared/hooks/useEvents.ts`
- Create: `src/shared/hooks/useCategoriesQuery.ts`
- Create: `src/shared/hooks/useUserActivityQuery.ts`

- [ ] **Step 1: 빈 hook 파일과 query key만 추가**

`src/shared/hooks/useProducts.ts`
```ts
'use client';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (input: unknown = {}) => [...productKeys.lists(), input] as const,
  detail: (productId: string) => [...productKeys.all, 'detail', productId] as const,
  home: () => [...productKeys.all, 'home'] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
};
```

`src/shared/hooks/useReviews.ts`
```ts
'use client';

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  summary: (productId: string) => [...reviewKeys.all, 'summary', productId] as const,
  user: (userId: string) => [...reviewKeys.all, 'user', userId] as const,
  list: (input: unknown = {}) => [...reviewKeys.all, 'list', input] as const,
};
```

`src/shared/hooks/useCoupons.ts`
```ts
'use client';

export const couponKeys = {
  all: ['coupons'] as const,
  active: () => [...couponKeys.all, 'active'] as const,
  user: (userId: string) => [...couponKeys.all, 'user', userId] as const,
  userStats: (userId: string) => [...couponKeys.all, 'userStats', userId] as const,
};
```

`src/shared/hooks/useEvents.ts`
```ts
'use client';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
};
```

`src/shared/hooks/useCategoriesQuery.ts`
```ts
'use client';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
};
```

`src/shared/hooks/useUserActivityQuery.ts`
```ts
'use client';

export const userActivityKeys = {
  all: ['userActivity'] as const,
  recent: (userId: string) => [...userActivityKeys.all, 'recent', userId] as const,
  wishlist: (userId: string) => [...userActivityKeys.all, 'wishlist', userId] as const,
};
```

- [ ] **Step 2: 타입체크**

Run: `npm run typecheck`

Expected: 새 파일 import 오류 없음.

---

### Task 2: ProductProvider를 query hook으로 대체

**Files:**
- Modify: `src/shared/hooks/useProducts.ts`
- Modify: `src/app/_components/ProductSection.tsx`
- Modify: `src/app/_components/CategoryProductTabs.tsx`
- Modify: `src/app/admin/dashboard/products/page.tsx`
- Modify: `src/app/admin/dashboard/products/add/page.tsx`
- Modify: `src/app/admin/dashboard/products/[productId]/edit/page.tsx`
- Modify: `src/app/admin/dashboard/@products/(.)products/[productId]/edit/page.tsx`
- Modify: `src/app/products/_components/ProductDetailClient.tsx`
- Modify: `src/app/reviews/_components/ReviewList.tsx`
- Modify: `src/app/mypage/_components/RecentProducts.tsx`
- Modify: `src/app/mypage/_components/WishlistProducts.tsx`

- [ ] **Step 1: 상품 query/mutation hook 추가**

`src/shared/hooks/useProducts.ts`에 추가:
```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/shared/services/productService';
import type { Product, ProductFilter, ProductSort } from '@/shared/types/product';

export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => ProductService.getAllProducts(),
    staleTime: 60 * 1000,
  });
}

export function useHomePageProducts() {
  return useQuery({
    queryKey: productKeys.home(),
    queryFn: () => ProductService.getHomePageProducts(),
    staleTime: 60 * 1000,
  });
}

export function useProductDetail(productId: string | null) {
  return useQuery({
    queryKey: productKeys.detail(productId || ''),
    queryFn: () => ProductService.getProductById(productId!),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => ProductService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductBrands() {
  return useQuery({
    queryKey: productKeys.brands(),
    queryFn: () => ProductService.getBrands(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredProducts(filter: ProductFilter, sort?: ProductSort) {
  return useQuery({
    queryKey: productKeys.list({ filter, sort }),
    queryFn: async () => {
      const products = Object.keys(filter).length
        ? await ProductService.getFilteredProducts(filter)
        : await ProductService.getAllProducts();
      return sort ? ProductService.getSortedProducts(products, sort) : products;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      ProductService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, updates }: {
      productId: string;
      updates: Partial<Omit<Product, 'id' | 'createdAt'>>;
    }) => ProductService.updateProduct(productId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => ProductService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
```

- [ ] **Step 2: 사용처를 한 파일씩 교체**

예시 변경:
```ts
- import { useProduct } from '@/context/productProvider';
+ import { useProducts } from '@/shared/hooks/useProducts';

- const { products, loading } = useProduct();
+ const { data: products = [], isLoading: loading } = useProducts();
```

mutation 예시:
```ts
- const { createProduct } = useProduct();
+ const createProductMutation = useCreateProduct();

- await createProduct(productData);
+ await createProductMutation.mutateAsync(productData);
```

- [ ] **Step 3: ProductProvider 제거**

`src/app/_components/providers/RootProviders.tsx`
```tsx
- import { ProductProvider } from "@/context/productProvider";

  <AuthProvider>
    <CategoryProvider>
-     <ProductProvider>
        <UserActivityProvider>
          {children}
        </UserActivityProvider>
-     </ProductProvider>
    </CategoryProvider>
  </AuthProvider>
```

- [ ] **Step 4: 검증**

Run:
```bash
npm test -- src/shared/services/productService.test.ts src/app/products/_components/ProductDetailClient.test.tsx
npm run typecheck
```

Expected: `useProduct` import가 남아 있으면 typecheck 실패. 모두 제거한다.

---

### Task 3: CouponProvider를 query hook으로 대체

**Files:**
- Modify: `src/shared/hooks/useCoupons.ts`
- Modify: `src/app/mypage/coupons/page.tsx`
- Modify: `src/app/mypage/_components/ProfileSection.tsx`
- Modify: `src/app/orders/cart/page.tsx`
- Modify: `src/app/orders/checkout/page.tsx`

- [ ] **Step 1: 쿠폰 query/mutation hook 추가**

`src/shared/hooks/useCoupons.ts`에 추가:
```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CouponService } from '@/shared/services/couponService';
import type { CouponFilter } from '@/shared/types/coupon';

export function useUserCoupons(userId: string | null, filter?: CouponFilter) {
  return useQuery({
    queryKey: [...couponKeys.user(userId || ''), filter || {}],
    queryFn: () => CouponService.getUserCoupons(userId!, filter),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useUserCouponStats(userId: string | null) {
  return useQuery({
    queryKey: couponKeys.userStats(userId || ''),
    queryFn: () => CouponService.getUserCouponStats(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: couponKeys.active(),
    queryFn: () => CouponService.getActiveCoupons(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegisterCouponByCode(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponCode: string) => CouponService.registerCouponByCode(userId!, couponCode),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: couponKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: couponKeys.userStats(userId) });
    },
  });
}
```

- [ ] **Step 2: 사용처 교체**

예시:
```ts
- import { useCoupon } from '@/context/couponProvider';
+ import { useUserCoupons } from '@/shared/hooks/useCoupons';

- const { userCoupons } = useCoupon();
+ const { data: userCoupons = [] } = useUserCoupons(user?.uid || null);
```

- [ ] **Step 3: CouponProvider 제거**

`src/app/_components/providers/RootProviders.tsx`에서 `CouponProvider` import와 JSX wrapper를 제거한다.

- [ ] **Step 4: 검증**

Run:
```bash
npm test -- src/shared/services/couponService.test.ts src/app/orders/checkout/page.test.tsx
npm run typecheck
```

Expected: `useCoupon` import가 남아 있지 않음.

---

### Task 4: ReviewProvider를 query hook으로 대체

**Files:**
- Modify: `src/shared/hooks/useReviews.ts`
- Modify: `src/app/reviews/_components/ReviewList.tsx`
- Modify: `src/app/products/_components/ProductReviews.tsx`
- Modify: `src/app/admin/reviews/_components/AdminReviewList.tsx`

- [ ] **Step 1: 리뷰 query/mutation hook 추가**

`src/shared/hooks/useReviews.ts`에 추가:
```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReviewService } from '@/shared/services/reviewService';
import type { Review } from '@/shared/types/review';

export function useProductReviews(productId: string | null) {
  return useQuery({
    queryKey: reviewKeys.product(productId || ''),
    queryFn: () => ReviewService.getProductReviews(productId!, 10),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useReviewSummary(productId: string | null) {
  return useQuery({
    queryKey: reviewKeys.summary(productId || ''),
    queryFn: () => ReviewService.getReviewSummary(productId!),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useAllReviews(page = 1, rating?: number, sortBy: 'latest' | 'rating' | 'helpful' = 'latest') {
  return useQuery({
    queryKey: reviewKeys.list({ page, rating, sortBy }),
    queryFn: () => ReviewService.getAllReviews(page, 10, rating, sortBy),
    staleTime: 60 * 1000,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) =>
      ReviewService.createReview(productId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(productId) });
    },
  });
}
```

- [ ] **Step 2: 사용처 교체**

예시:
```ts
- const { productReviews, loadProductReviews, loading } = useReview();
+ const { data, isLoading: loading } = useProductReviews(productId);
+ const productReviews = data?.reviews || [];
```

- [ ] **Step 3: ReviewProvider 제거**

`src/app/_components/providers/RootProviders.tsx`에서 `ReviewProvider` import와 JSX wrapper를 제거한다.

- [ ] **Step 4: 검증**

Run:
```bash
npm test -- src/shared/services/reviewService.test.ts src/app/products/_components/ProductDetailClient.test.tsx
npm run typecheck
```

Expected: 리뷰 목록/요약 화면 타입 오류 없음.

---

### Task 5: EventProvider와 CategoryProvider 축소

**Files:**
- Modify: `src/shared/hooks/useEvents.ts`
- Modify: `src/shared/hooks/useCategoriesQuery.ts`
- Modify: `src/app/events/_components/EventList.tsx`
- Modify: `src/app/categories/page.tsx`
- Modify: `src/app/admin/dashboard/products/_components/EditProductForm.tsx`

- [ ] **Step 1: 이벤트/카테고리 query hook 추가**

`src/shared/hooks/useEvents.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { EventService } from '@/shared/services/eventService';

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => EventService.getEvents(),
    staleTime: 60 * 1000,
  });
}
```

`src/shared/hooks/useCategoriesQuery.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { DEFAULT_CATEGORY_IDS, getDefaultCategoryNames } from '@/shared/utils/categoryUtils';

const fallbackCategories = DEFAULT_CATEGORY_IDS.map((id, index) => {
  const categoryNames = getDefaultCategoryNames();
  const now = new Date();
  return {
    id,
    name: categoryNames[id] || id,
    description: `${categoryNames[id] || id} category`,
    icon: '',
    color: '#000000',
    order: index + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
});

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryNames = getDefaultCategoryNames();
      const categories = snapshot.docs.map((doc) => {
        const data = doc.data();
        const rawName = data.name || '';
        return {
          id: doc.id,
          name: categoryNames[rawName.toLowerCase()] || categoryNames[doc.id.toLowerCase()] || rawName || doc.id,
          description: data.description || '',
          order: data.order || 0,
          isActive: data.isActive ?? true,
          icon: data.icon || '',
          color: data.color || '#000000',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }).filter((category) => category.id && category.name);
      return categories.length > 0
        ? categories.filter((category) => category.isActive).sort((a, b) => a.order - b.order)
        : fallbackCategories;
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 2: 이벤트 필터는 컴포넌트 로컬 상태로 이동**

예시:
```ts
const { data: events = [], isLoading: loading, error } = useEvents();
const [filter, setFilter] = useState<EventFilter>({});
const [currentPage, setCurrentPage] = useState(1);
const filteredEvents = useMemo(() => events.filter(/* 기존 조건 */), [events, filter]);
```

- [ ] **Step 3: Provider 제거**

`RootProviders.tsx`에서 `EventProvider`, `CategoryProvider` wrapper를 제거한다.

- [ ] **Step 4: 검증**

Run:
```bash
npm test -- src/context/eventProvider.test.tsx src/app/events/_components/EventList.test.tsx
npm run typecheck
```

Expected: `eventProvider.test.tsx`는 Provider 제거 후 삭제하거나 새 hook 테스트로 대체한다.

---

### Task 6: UserActivityProvider를 query hook으로 대체

**Files:**
- Modify: `src/shared/hooks/useUserActivityQuery.ts`
- Modify: `src/app/products/_components/ProductCard.tsx`
- Modify: `src/app/products/_components/ProductDetailClient.tsx`
- Modify: `src/app/mypage/page.tsx`
- Modify: `src/app/mypage/_components/RecentProducts.tsx`
- Modify: `src/app/mypage/_components/WishlistProducts.tsx`

- [ ] **Step 1: 사용자 활동 query/mutation hook 추가**

`src/shared/hooks/useUserActivityQuery.ts`
```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HybridUserActivityService } from '@/shared/services/hybridUserActivityService';

export function useRecentProducts(userId: string | null) {
  return useQuery({
    queryKey: userActivityKeys.recent(userId || ''),
    queryFn: () => HybridUserActivityService.getRecentProducts(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useWishlistItems(userId: string | null) {
  return useQuery({
    queryKey: userActivityKeys.wishlist(userId || ''),
    queryFn: () => HybridUserActivityService.getWishlist(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useAddRecentProduct(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => HybridUserActivityService.addRecentProduct(userId!, productId),
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: userActivityKeys.recent(userId) });
    },
  });
}

export function useToggleWishlist(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, wished }: { productId: string; wished: boolean }) => {
      if (wished) {
        await HybridUserActivityService.removeFromWishlist(userId!, productId);
        return false;
      }
      await HybridUserActivityService.addToWishlist(userId!, productId);
      return true;
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: userActivityKeys.wishlist(userId) });
    },
  });
}
```

- [ ] **Step 2: 사용처 교체**

예시:
```ts
- const { wishlistItems, addToWishlist, removeFromWishlist } = useUserActivity();
+ const { data: wishlistItems = [] } = useWishlistItems(user?.uid || null);
+ const toggleWishlistMutation = useToggleWishlist(user?.uid || null);
```

- [ ] **Step 3: UserActivityProvider 제거**

`RootProviders.tsx`에서 `UserActivityProvider` import와 JSX wrapper를 제거한다.

- [ ] **Step 4: 검증**

Run:
```bash
npm test -- src/app/products/_components/ProductDetailClient.test.tsx
npm run typecheck
```

Expected: 위시리스트/최근 본 상품 사용처 타입 오류 없음.

---

### Task 7: RootProviders 정리와 최종 검증

**Files:**
- Modify: `src/app/_components/providers/RootProviders.tsx`
- Delete: `src/context/productProvider.tsx`
- Delete: `src/context/reviewProvider.tsx`
- Delete: `src/context/couponProvider.tsx`
- Delete: `src/context/eventProvider.tsx`
- Delete: `src/context/categoryProvider.tsx`
- Delete: `src/context/userActivityProvider.tsx`
- Modify: `docs/README.md`

- [ ] **Step 1: RootProviders를 인증과 React Query만 남김**

목표 형태:
```tsx
'use client';

import { AuthProvider } from "@/context/authProvider";
import { ScrollToTop } from "../ScrollToTop";
import ReactQueryProvider from "./ReactQueryProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ScrollToTop />
        {children}
      </AuthProvider>
    </ReactQueryProvider>
  );
}
```

- [ ] **Step 2: 남은 import 확인**

Run:
```bash
rg "useProduct|useReview|useCoupon|useEvent|useCategories|useUserActivity|ProductProvider|ReviewProvider|CouponProvider|EventProvider|CategoryProvider|UserActivityProvider" src
```

Expected: 결과 없음. 단, 테스트 mock 문자열이 남으면 새 hook 이름으로 교체한다.

- [ ] **Step 3: 삭제**

Provider import가 모두 사라진 뒤에만 삭제한다:
```text
src/context/productProvider.tsx
src/context/reviewProvider.tsx
src/context/couponProvider.tsx
src/context/eventProvider.tsx
src/context/categoryProvider.tsx
src/context/userActivityProvider.tsx
```

- [ ] **Step 4: 최종 검증**

Run:
```bash
npm run typecheck
npm run lint -- --max-warnings=0
npm test
```

Expected: 전부 PASS.

- [ ] **Step 5: 브라우저 QA**

Run:
```bash
npm run dev
```

확인 화면:
- `/`: 홈 상품 섹션 로드
- `/products`: 상품 목록 로드
- `/products/{productId}`: 상품 상세, 최근 본 상품 저장, 위시리스트 토글
- `/orders/cart`: 장바구니와 쿠폰 표시
- `/mypage`: 최근 본 상품, 위시리스트, 쿠폰 수 표시
- `/events`: 이벤트 목록 필터/페이지 동작
- `/admin/dashboard/products`: 상품 관리자 목록/수정 진입

---

## 실행 순서

1. Query key 파일 추가
2. Product 전환
3. Coupon 전환
4. Review 전환
5. Event/Category 전환
6. UserActivity 전환
7. Provider 삭제와 최종 검증

상품 전환이 가장 크고 위험하다. 여기서 패턴을 확정한 뒤 나머지는 같은 방식으로 밀면 된다.

---

## 의도적으로 하지 않는 것

- 새 상태관리 라이브러리 추가 안 함. 이미 TanStack React Query가 있음.
- AuthProvider는 유지. Firebase Auth subscription과 라우팅 액션은 Context가 맞음.
- 서비스 레이어 대규모 리팩터링 안 함. 이번 목표는 상태관리 경계 정리임.
- 모든 화면을 한 커밋으로 묶지 않음. Provider 단위로 끊어야 회귀 추적이 쉽다.

---

## Self-Review

- Spec coverage: 서버 데이터의 Context 캐싱 제거, React Query 전환, Provider 축소, 검증 단계 포함.
- Placeholder scan: 구현 위치와 예시 코드, 검증 명령 포함. 실행 중 실제 컴포넌트 prop 차이는 해당 Task에서 typecheck로 잡는다.
- Type consistency: 기존 서비스 이름과 타입 이름을 기준으로 작성했다.

## 2026-07-01 Execution Result

- Client components no longer call `*Service.*` directly for server data fetching or mutations; those calls now go through React Query hooks.
- Remaining `Service` calls are inside shared hooks/services or server-side loaders where React Query client state is not the right boundary.
- Verified with `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm test -- ProductList cart checkout`, and `npm run build`.
