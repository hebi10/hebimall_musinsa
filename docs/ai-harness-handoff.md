### commit message
- 없음: 사용자가 커밋을 요청하지 않음.

### 인수인계
1. 보안/신뢰 경계 보강
   - 쿠폰 `issue`는 코드 없는 직접 발급 쿠폰만 허용하고, 코드 쿠폰은 `register`로만 등록되게 했다.
   - Next/Functions 상담 API에 메시지 길이 제한, history 개수 제한, `user`/`assistant` role 필터를 적용했다.
   - 이벤트 상세 HTML은 allowlist sanitizer를 거쳐 렌더링한다.

2. 구매/회원 흐름 보정
   - 로그인 redirect query를 로그인 성공/이미 로그인 상태에서 우선 적용한다.
   - 공개 로그인 화면의 하드코딩 빠른 로그인은 개발 환경에서만 렌더링한다.
   - checkout 주문 draft 누락/파손/빈 상품 상태는 복구 UI로 안내하고 `/orders/cart`로 되돌린다.

3. 운영 흔적/UI 정리
   - 배송조회 mock/test 안내, 영문 editorial 문구, 준비중 이미지 문구, 가짜 공지 표현을 쇼핑몰 운영 문맥으로 교체했다.
   - 관리자 사용자 쿠폰의 가짜 지급 성공/최근 지급 이력을 제거하고 준비 상태로 표시했다.
   - 관리자 리뷰는 `mockReviews` 직접 사용을 제거하고 Firestore 조회 기반 로딩/빈 상태로 전환했다.

### 보존한 의도
- 포트폴리오/개인 연락처 안내 문구는 면접관이 포트폴리오임을 구분해야 하므로 제거하지 않고 유지했다.

### 검증
- `npm test -- --runTestsByPath src/app/api/chat/route.test.ts src/shared/utils/eventHtml.test.ts functions/__tests__/couponDomain.test.ts src/app/auth/login/page.test.tsx src/app/orders/checkout/checkoutDraft.test.ts src/app/orders/checkout/page.test.tsx src/app/cart/page.test.tsx src/app/orders/checkout/deliveryAddress.test.ts src/shared/utils/orderPricing.test.ts --runInBand`: 통과.
- `npm run typecheck`: 통과.
- `npm run functions:build`: 통과.
- `npm run lint`: 통과, 기존 warning 249개 잔존.

### 제한/남은 작업
1. 로컬 Next dev/build는 이 환경에서 `spawn EPERM`으로 실행되지 않아 실제 화면 재캡처는 완료하지 못했다.
2. Chrome 캡처는 `artifacts/screenshots/chrome-localhost-3000-error.png`에 dev 서버 실패 상태만 남아 있다.
3. 인증 보조 화면, 고객센터 하위 화면, 마이페이지 하위 화면의 구형 장식 스타일은 별도 QA 후보로 남아 있다.
