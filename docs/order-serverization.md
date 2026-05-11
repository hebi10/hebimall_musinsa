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
