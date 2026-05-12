# 주문 생성 서버화 정리

## 대상 파일
- `functions/src/handlers/order.ts`
- `functions/src/index.ts`
- `src/app/orders/checkout/page.tsx`
- `src/app/orders/complete/page.tsx`
- `src/shared/services/orderService.ts`
- `src/shared/types/order.ts`(타입 참조)
- `firestore.rules`

## 2026-04-24 작업 내용
- 주문 생성은 `POST /api/order`(Functions)로만 수행되도록 정리했고, 주문 생성 요청 필드는  
  `productId/size/color/quantity`, `deliveryAddress`, `paymentMethod`, `deliveryOption`, `selectedCoupon`, `requestedPointAmount`로 제한해 사용한다.
- 함수 내부에서 주문별 단가·총액·할인·배송비·최종 결제금액을 재산정한다.
- 주문 생성은 Firestore transaction 안에서 한 번에 처리한다.
  - 주문 문서 생성
  - 상품 재고 차감
  - 사용자 쿠폰 상태 갱신(`사용가능` → `사용완료`/`기간만료`)
  - 포인트 차감
  - 장바구니 선택 항목 정리
- `firestore.rules`에서 `orders` 생성은 `allow create: if false`로 막고, 읽기만 소유자/관리자로 허용하도록 유지해 일반 사용자의 임의 생성·변조를 차단한다.
- 클라이언트 완료 화면은 URL 파라미터(`orderId`) 혹은 이전 저장한 `orderResult`를 기반으로 `OrderService.getOrder`로 조회하도록 변경해, 로컬 계산값 의존도를 낮췄다.

## 검증
- `npx tsc --noEmit --pretty false -p ./functions/tsconfig.json` 통과
- 2026-05-11: 루트 `npx tsc --noEmit --pretty false -p tsconfig.json` 통과. 주문 완료 화면의 `pointUsed` 표시와 서버 주문 응답 구조에 맞춰 `Order` 타입에 `pointUsed`를 반영.
- 2026-05-11: `functions/src/domain/orderDomain.ts`와 `functions/__tests__/orderDomain.test.ts`를 추가해 주문 항목 병합, 할인 단가, 쿠폰 할인, 배송비 계산을 단위 테스트로 검증. `order.ts`의 배송비 계산은 같은 도메인 함수를 사용한다.

## 잔여 확인 포인트
- 상품 옵션 가격/재고 구조가 옵션별로 분리되는 경우, `order.ts`에서 옵션 단가·재고 규칙 확장 필요.
- 주문 완료 화면에서 주문 단가/할인 항목의 다국어 문자열 정합성 점검 필요.

## 2026-05-12 주문 흐름 UI 정리
- 서버 주문 생성 흐름과 타입은 변경하지 않고 주문 관련 CSS만 보정했다.
- `/cart`, `/orders/cart`, `/orders/checkout`, `/orders/complete`, `/orders/delivery`의 카드, 요약 박스, 입력, CTA radius를 2px로 낮추고 그림자를 제거했다.
- 배송 조회 화면은 파랑 CTA와 상태 배지를 검정/중립 표면으로 바꿔 메인 상품 매대 톤과 맞췄다.

## 2026-05-12 관리자 주문 상태 변경 서버화
- `/api/order`에 관리자 전용 `action: "updateStatus"` 분기를 추가했다.
- 상태 변경은 custom claim 기반 관리자만 가능하며 `pending -> confirmed -> preparing/shipped -> delivered` 등 허용된 전이만 통과한다.
- 변경 시 `statusHistory`에 이전 상태, 다음 상태, 관리자 uid, 변경 시각을 남긴다.
- 관리자 주문 화면의 `OrderService.updateOrderStatus`는 Firestore 직접 업데이트 대신 `/api/order`를 호출한다.

## 2026-05-12 구매 흐름 점검
- `OrderService.createOrder`는 클라이언트 계산값을 보내지 않고 상품/옵션/배송지/결제수단/쿠폰/포인트만 `POST /api/order`로 전달한다.
- Functions 주문 생성은 인증, 상품 조회, 재고 확인, 쿠폰 소유자/상태/만료/최소금액, 포인트 잔액, 장바구니 선택 항목 제거를 트랜잭션에서 처리한다.
- 확인된 리스크:
  - `/categories/[category]/products/[productId]` 상세의 장바구니 담기는 실제 저장 없이 alert만 표시하고, 바로 구매 버튼에는 실행 핸들러가 없다.
  - `/orders/cart`의 쿠폰 드롭다운은 `사용가능` 상태만 필터링하고 최소 주문금액/만료/무료배송 조건을 화면 계산에 반영하지 않아, checkout 또는 서버 확정 금액과 달라질 수 있다.
  - `/orders/checkout`은 상품별 할인 합계를 주문 금액에서 다시 빼고 있어 이미 할인 단가로 담긴 장바구니/바로구매 데이터와 서버 확정 금액이 어긋날 수 있다.
  - 로컬 `next dev`/`next build`는 Next worker `spawn EPERM`으로 브라우저 E2E 확인이 막혔다. 배포 환경은 Firebase Hosting rewrite의 `/api/order` 경로 확인이 필요하다.

## 2026-05-12 주문 완료 빌드 오류 보정
- `/orders/complete`에서 `useSearchParams()`를 쓰는 실제 콘텐츠를 `Suspense` 하위 컴포넌트로 분리해 Next 15 prerender 오류를 막았다.
- 루트 `themeColor`는 `metadata`가 아니라 `viewport` export에서 설정한다.
- `npm run typecheck`는 통과했고, `npm run build`는 이 환경의 Next worker `spawn EPERM` 제약으로 중단됐다.

## 2026-05-12 구매 흐름 보정
- 두 상품 상세 경로(`/products/[productId]`, `/categories/[category]/products/[productId]`)의 장바구니/바로구매 진입 동작을 맞췄다.
- 장바구니와 checkout의 예상 금액 계산을 `src/shared/utils/orderPricing.ts`로 통합했다.
- checkout은 이미 할인된 상품 단가에서 상품 할인액을 다시 차감하지 않고, 서버 주문 생성은 기존처럼 Functions에서 최종 재계산한다.
- `src/app/categories/[category]/products/[productId]/page.test.tsx`로 카테고리 상세의 장바구니/바로구매 동작을 회귀 테스트한다.
