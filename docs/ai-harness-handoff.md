### commit message
- `fix: separate deploy build from lint gate`

### 인수인계 (최대 3개)
1. 구매 흐름 보정 계획 작성
   - `docs/superpowers/plans/2026-05-12-purchase-flow-fix.md`에 실행 계획을 저장.
   - 범위는 상품 상세 구매 진입점 복구, 장바구니/checkout 금액 계산 통합, 검증/문서 갱신.

2. 계획의 핵심 방향
   - 서버 주문 생성(`/api/order`)은 최종 확정 지점으로 유지.
   - 클라이언트는 `orderPricing` 순수 유틸로 예상 금액만 계산하고 서버 요청 총액은 보내지 않음.
   - `/categories/[category]/products/[productId]`도 실제 장바구니/바로구매 흐름에 연결.

3. 문서 허브 갱신
   - `docs/README.md`에 구매 흐름 보정 작업 계획 항목을 추가.
   - `next.config.ts`에서 배포 빌드 내부 lint를 비활성화하고 `npm run lint`/`ci`는 별도 품질 게이트로 유지.
   - `docs/quality-gates.md`에 `npm install` 이후 발생한 Next build lint 차단과 분리 방식을 기록.

### 검증
- `npm run typecheck`: 통과.
- `npm run build`: `Skipping linting` 확인 후 현재 샌드박스의 Next worker `spawn EPERM`으로 중단.

### 남은 작업 (최대 3개)
1. 계획 Task 1부터 TDD 순서로 구현.
2. 구현 후 `npm test -- --runTestsByPath src/shared/utils/orderPricing.test.ts`, `npm run typecheck`, `npm run functions:build` 확인.
3. 인증 테스트 계정으로 상품 상세 → 장바구니/바로구매 → checkout → complete E2E 확인.
