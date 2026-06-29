### commit message
- 없음: 사용자가 커밋을 요청하지 않음.

### 인수인계
1. 민감 Function 캐시/포인트/쿠폰 경계 정리 완료
   - `points`, `coupon`, `adminUsers` Function에 `no-store`를 적용했고, 회원가입 보너스는 `signupBonus` transaction으로 분리했다.
   - 관리자 포인트 변경은 `/api/points`, 쿠폰 `register`/`issue`는 transaction 경유로 정리했다.
   - `verify` 스크립트를 추가했고 `deploy:firebase`가 `verify` 성공 후 배포하도록 바꿨다.

2. Chrome 주문 흐름 QA
   - 일반 회원으로 상품 선택, 장바구니, 포인트 5,000P 적용, 서버 주문 생성, 주문 완료, 마이페이지 노출을 확인했다.
   - 관리자 주문 관리에서 `결제 대기 -> 주문 확인 -> 주문 취소`를 실행했고, 취소 후 포인트 5,000P와 상품 재고 38개 복원을 확인했다.
   - 사용 가능한 쿠폰 데이터가 없어 실주문 쿠폰 적용/복원은 미검증이다.

3. QA에서 확인한 개선점
   - 상품 목록 카테고리 표시명, 색상 스와치 접근성 이름, 상품 대표 이미지 priority, 주문 목록 key, checkout 장바구니 캐시 무효화를 보정했다.
   - 상품 목록 Firestore 인덱스 파일은 갱신했지만 실제 콘솔 fallback 제거에는 인덱스 배포가 필요하다.

### 보존한 의도
- `points.add`는 관리자 전용으로 유지했다. 일반 회원가입은 별도 `signupBonus`만 허용한다.
- 실결제 연동, Rules 테스트 추가, 상품 조회 구조 개편은 이번 범위에서 제외했다.

### 검증
- `npm test -- --runTestsByPath functions/__tests__/httpHandlers.test.ts src/shared/services/adminUserService.test.ts --runInBand`: 통과.
- `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm test`, `npm run functions:build`: 통과.
- `npm run verify`: 통과.

### 제한/남은 작업
1. 최신 테스트 쿠폰 데이터를 준비해 쿠폰 적용/취소 복원까지 Chrome에서 재검증한다.
2. Firestore 인덱스 배포, Firestore/Storage Rules 테스트, 실결제 미연동 고지는 별도 작업으로 남아 있다.
