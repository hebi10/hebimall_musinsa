### commit message
- 없음: 사용자가 커밋을 요청하지 않음.

### 인수인계
1. 로컬 API 404 보정
   - `/api/points`, `/api/coupon`, `/api/admin/users`, `/api/qna/verify-secret` App Router route를 추가했다.
   - 공통 `src/app/api/_lib/functionProxy.ts`가 no-store 헤더, 인증 헤더, JSON body를 Cloud Function으로 프록시한다.
   - 인증 없는 로컬 요청은 404 HTML 대신 Functions JSON 응답(401 또는 도메인 404)을 반환한다.

2. 카트 링크/CTA 보정
   - `/cart`의 `/main/recommend` 링크를 실제 `/recommend`로 바꿨다.
   - `/cart`의 동작 없는 주문 버튼은 선택 항목이 있을 때 `/orders/cart`로 이동하게 하고, 선택 항목이 없으면 disabled 버튼을 렌더링한다.
   - 기존 모바일 장바구니 레이아웃 보정 변경은 보존했다.

3. Chrome 확인 상태
   - 로컬 dev 서버는 `http://localhost:3000`에서 실행 중이다.
   - Chrome 자동화 연결은 됐지만 `localhost`, `127.0.0.1`, 네트워크 IP `:3000` 모두 `net::ERR_BLOCKED_BY_CLIENT`로 차단됐다.
   - 동일 흐름은 HTTP 요청과 링크 크롤링으로 대체 확인했다.

### 검증
- `npm test -- --runTestsByPath src/app/api/points/route.test.ts src/app/api/coupon/route.test.ts src/app/api/admin/users/route.test.ts src/app/api/qna/verify-secret/route.test.ts src/app/api/order/route.test.ts --runInBand`: 통과.
- `npm run typecheck`: 통과.
- `npm run lint`: 통과, 기존 warning 253개.
- HTTP 확인: API 누락 404 HTML 해소, 내부 링크 27개 깨짐 없음.
- Chrome 확인: 로컬 `:3000` 페이지 로딩이 `net::ERR_BLOCKED_BY_CLIENT`로 차단되어 화면/콘솔/네트워크 확인 불가.

### 남은 작업
1. Chrome의 로컬 `:3000` 차단 원인 확인 후 실제 화면에서 콘솔/네트워크와 `/cart` CTA 이동 확인.
2. 인증된 테스트 계정으로 포인트/쿠폰/관리자/QnA Function 권한 흐름 확인.
3. 기존 lint warning은 별도 정리 작업으로 축소.
