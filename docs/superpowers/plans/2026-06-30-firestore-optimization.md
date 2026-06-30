# Firestore 최적화 실행 계획

**목표:** 현재 쇼핑몰 동작은 유지하면서 Firestore 읽기 비용과 인덱스 오류 가능성을 줄인다.

**방향:** 대규모 구조 변경부터 하지 않는다. 지금 비용이 커질 가능성이 큰 리뷰, 쿠폰, 상품 홈 조회, QnA 페이지네이션부터 작게 고친다. 레거시 데이터 삭제는 백업/검증 후 별도 작업으로 분리한다.

**기술:** Next.js 15, Firebase Firestore, Firebase Admin 스크립트, Jest, ESLint.

---

## 현재 확인한 내용

- 2026-06-30에 `tmp/firestore-ai-summary.json`을 생성해 익명화된 Firestore 구조를 확인했다.
- 현재 큰 컬렉션은 `reviews` 1152건, `products` 88건, `users` 21건, `events` 22건이다.
- 앱의 상품 조회는 대부분 top-level `products`를 사용한다.
- 단, `categories/{categoryId}/products` 레거시 상품 문서도 아직 남아 있다.
- `src/shared/utils/syncProductReviews.ts`는 아직 레거시 상품 경로를 일부 확인한다.
- `firestore.indexes.json`에는 실제 컬렉션과 맞지 않는 `userCoupons/userUID` 인덱스가 있다.
- 실제 데이터와 코드는 `user_coupons/uid`를 사용한다.
- 리뷰 통계/목록 쪽은 전체 리뷰를 읽는 코드가 있어 컬렉션이 커질수록 비용이 커진다.
- 쿠폰 목록은 유저 쿠폰을 읽은 뒤 쿠폰 마스터를 하나씩 다시 읽는 N+1 구조다.
- QnA 목록의 페이지네이션은 필터가 있을 때 이전 페이지 커서 계산이 정확하지 않다.

---

## 수정 대상 파일

- `firestore.indexes.json`: 실제 쿼리와 맞는 인덱스로 정리한다.
- `src/shared/services/reviewService.ts`: 리뷰 전체 스캔을 줄인다.
- `src/shared/utils/syncProductReviews.ts`: 상품 카드/상세에서 불필요한 리뷰 조회를 줄인다.
- `src/app/products/_components/ProductCard.tsx`: 상품에 저장된 `rating`, `reviewCount`를 우선 사용한다.
- `src/app/products/_components/ProductDetailClient.tsx`: 상품에 저장된 리뷰 요약 값을 우선 사용한다.
- `src/shared/services/couponService.ts`: 쿠폰 마스터를 묶어서 조회한다.
- `src/shared/services/productService.ts`: 홈 상품 섹션에서 전체 상품 조회를 줄인다.
- `src/shared/services/qnaService.ts`: 필터 페이지네이션 버그를 고친다.
- 나중에 검토: `src/shared/services/hybridUserActivityService.ts`.

---

## 1단계: Firestore 인덱스 정리

**수정 파일:** `firestore.indexes.json`

1. `userCoupons/userUID` 인덱스 2개를 제거한다.
2. 실제 컬렉션인 `user_coupons/uid` 기준 인덱스를 추가한다.

추가할 인덱스:
```json
{
  "collectionGroup": "user_coupons",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "uid", "order": "ASCENDING" },
    { "fieldPath": "issuedDate", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "user_coupons",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "uid", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "issuedDate", "order": "DESCENDING" }
  ]
}
```

3. 이벤트 참여자 쿼리 인덱스를 추가한다.

```json
{
  "collectionGroup": "eventParticipants",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "eventId", "order": "ASCENDING" },
    { "fieldPath": "participatedAt", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "eventParticipants",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "participatedAt", "order": "DESCENDING" }
  ]
}
```

4. 이벤트 목록 쿼리 인덱스를 추가한다.

```json
{
  "collectionGroup": "events",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isActive", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

검증:
```bash
node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('indexes json ok')"
```

---

## 2단계: 리뷰 페이지 전체 스캔 줄이기

**수정 파일:**
- `src/shared/services/reviewService.ts`
- `src/shared/services/reviewService.test.ts`

현재 문제:
- `reviews`가 이미 1152건이다.
- 리뷰 개수/통계를 구할 때 전체 문서를 읽는 코드가 있다.
- 페이지 이동 시 `pageSize + offset`만큼 읽는 구조라 뒤 페이지로 갈수록 읽기 비용이 늘어난다.

개선:
1. 전체 개수는 `getCountFromServer()`를 사용한다.
2. 최신순 목록은 `orderBy('createdAt', 'desc') + limit(pageSize)`를 사용한다.
3. 평점 필터가 있을 때도 count aggregation을 사용한다.
4. 페이지 번호 방식은 당장 완전 교체하지 않고, 먼저 불필요한 큰 조회부터 줄인다.

검증:
```bash
npm test -- src/shared/services/reviewService.test.ts
npm run lint -- --max-warnings=0
```

---

## 3단계: 상품 카드/상세의 리뷰 N+1 조회 제거

**수정 파일:**
- `src/app/products/_components/ProductCard.tsx`
- `src/app/products/_components/ProductDetailClient.tsx`
- `src/shared/utils/syncProductReviews.ts`
- `src/app/products/_components/ProductDetailClient.test.tsx`

현재 문제:
- `products` 문서에는 이미 `rating`, `reviewCount`가 있다.
- 그런데 상품 카드/상세에서 다시 `reviews`를 조회해 리뷰 통계를 계산하는 흐름이 있다.
- 상품 목록이 길어질수록 상품 개수만큼 추가 읽기가 생긴다.

개선:
1. 상품 카드와 상품 상세는 우선 `product.rating`, `product.reviewCount`를 표시한다.
2. `getProductReviewStats()`는 삭제하지 않고 관리자/백필용 유틸로만 남긴다.
3. 상품 상세 테스트에서 리뷰 통계 API를 기다리지 않아도 화면이 렌더링되는지 확인한다.

검증:
```bash
npm test -- src/app/products/_components/ProductDetailClient.test.tsx
npm run lint -- --max-warnings=0
```

---

## 4단계: 쿠폰 마스터 N+1 조회 제거

**수정 파일:**
- `src/shared/services/couponService.ts`
- `src/shared/services/couponService.test.ts`

현재 문제:
- `getUserCoupons()`가 유저 쿠폰 목록을 가져온다.
- 그 다음 각 유저 쿠폰마다 `getCouponById()`를 호출한다.
- 유저 쿠폰이 20개면 쿠폰 마스터 조회도 최대 20번 발생한다.

개선:
1. 유저 쿠폰에서 `couponId` 목록을 모은다.
2. Firestore `documentId()`와 `in` 쿼리로 쿠폰 마스터를 10개씩 묶어서 조회한다.
3. 조회 결과를 `Map<couponId, Coupon>`으로 만들어 기존 화면 로직은 유지한다.
4. 상태 필터, 타입 필터, 이름 정렬은 기존 동작을 유지한다.

검증:
```bash
npm test -- src/shared/services/couponService.test.ts
npm run lint -- --max-warnings=0
```

---

## 5단계: 홈 상품 섹션 전체 조회 줄이기

**수정 파일:**
- `src/shared/services/productService.ts`
- `src/shared/services/productService.test.ts`

현재 문제:
- `products`는 현재 88건이라 큰 문제는 아니다.
- 하지만 홈 상품 그룹에서 전체 상품을 읽고 클라이언트에서 추천/신상품/세일/베스트를 고르는 흐름이 있다.
- 상품이 수천 개가 되면 홈 진입 때마다 비용이 커진다.

개선:
1. 신상품은 `status + isNew + createdAt` 쿼리로 가져온다.
2. 세일 상품은 `status + isSale + createdAt` 쿼리로 가져온다.
3. 베스트 상품은 `status + reviewCount` 쿼리로 가져온다.
4. 추천 상품은 우선 `featuredProducts` 설정을 활용하고, 없으면 베스트 상품을 재사용한다.
5. 전체 상품 조회는 쿼리가 실패했을 때의 fallback으로만 남긴다.

검증:
```bash
npm test -- src/shared/services/productService.test.ts
npm run lint -- --max-warnings=0
```

---

## 6단계: QnA 필터 페이지네이션 수정

**수정 파일:**
- `src/shared/services/qnaService.ts`
- `src/shared/services/qnaService.test.ts`

현재 문제:
- `getQnAList()`는 필터를 적용한 뒤 목록을 가져온다.
- 하지만 2페이지 이상에서 이전 페이지 커서를 구할 때는 필터 없는 쿼리를 사용한다.
- 그래서 필터가 있는 상태에서 페이지가 틀어질 수 있다.

개선:
1. QnA 필터를 적용하는 private helper를 만든다.
2. count 쿼리, 이전 페이지 커서 쿼리, 실제 목록 쿼리가 같은 필터 조건을 공유하게 한다.
3. 현재 화면 API는 유지한다.

검증:
```bash
npm test -- src/shared/services/qnaService.test.ts
npm run lint -- --max-warnings=0
```

---

## 7단계: 사용자 활동 구조 변경은 보류

**대상 컬렉션:**
- `userRecentProducts`
- `userWishlist`

현재 판단:
- 현재 문서 수는 `userRecentProducts` 12건, `userWishlist` 2건이다.
- 지금 구조 변경까지 할 필요는 없다.

나중에 문서가 1000건 이상으로 늘어나면 아래 구조를 검토한다.

```text
users/{uid}/recentProducts/{productId}
users/{uid}/wishlist/{productId}
```

장점:
- 사용자별 조회가 단순해진다.
- 중복 확인 쿼리를 줄일 수 있다.
- 전역 user activity 인덱스 의존도가 줄어든다.

---

## 8단계: 레거시 상품 삭제는 별도 작업으로 분리

**대상 경로:**
```text
categories/{categoryId}/products/{productId}
```

현재 판단:
- 레거시 nested 상품 문서가 아직 남아 있다.
- 하지만 삭제는 되돌리기 어려우므로 이번 최적화 작업에 포함하지 않는다.

삭제 전 필수 확인:
```bash
npm run migrate:firestore:validate
npm run firestore:ai-summary -- --output=tmp/firestore-ai-summary-before-cleanup.json --sample-limit=20 --max-depth=2
```

삭제 작업을 하려면 먼저 Firestore 공식 백업을 진행하고, 별도 cleanup 계획을 만든다.

### 2026-06-30 실행 결과

- `npm run migrate:firestore:validate` 실행 완료.
- source 상품 88건, destination 상품 88건, 누락 0건, orphan 0건.
- 단, core field 불일치 1건이 있다.
  - 상품 `ZEMIfgpl9ZLAG8lgkMub`의 `stock` 값이 legacy source `12`, top-level destination `11`로 다르다.
- 이 불일치가 해결되기 전에는 `categories/{categoryId}/products/{productId}` 레거시 상품 삭제를 진행하지 않는다.
- `tmp/firestore-ai-summary-before-cleanup.json`도 생성 완료했다.

---

## 권장 실행 순서

1. 인덱스 정리
2. 상품 카드/상세의 리뷰 N+1 조회 제거
3. 리뷰 페이지 전체 스캔 제거
4. 쿠폰 마스터 배치 조회
5. 홈 상품 전체 조회 줄이기
6. QnA 필터 페이지네이션 수정
7. 사용자 활동 구조 변경은 나중에 재검토
8. 레거시 상품 삭제는 백업 후 별도 작업

---

## 최종 검증 명령

```bash
npm run typecheck
npm run lint -- --max-warnings=0
npm test
npm run functions:build
```

커밋, 푸시, 배포, 레거시 데이터 삭제는 사용자가 명시적으로 요청하기 전에는 하지 않는다.
