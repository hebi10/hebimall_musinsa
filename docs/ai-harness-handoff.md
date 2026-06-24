### commit message
- 없음: 사용자가 커밋을 요청하지 않음.

### 인수인계
1. Ponytail 정리
   - 미사용 `src/components/products/ProductCard`, `useDashboard`, `useCommon`, API 상수/클라이언트, 빈 `OrderProvider`와 중복 `PointProvider` 래핑을 삭제했다.
   - `UserService`, `UserActivityService`, `LocalUserActivityService` 호환 래퍼를 제거하고 실제 서비스 직접 호출로 줄였다.
   - `functions/src/handlers/order.ts`의 주문 도메인 중복 함수를 `functions/src/domain/orderDomain.ts` 재사용으로 축소했다.

2. 의존성 정리
   - 참조 없는 `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `terser-webpack-plugin`, `ts-node`를 제거했다.
   - `package-lock.json`은 `npm uninstall` 결과로 함께 정리됐다.

3. 문서 갱신
   - `product-listing-structure.md`, `dashboard.md`, `order-serverization.md`, `quality-gates.md`에 이번 정리 내용을 반영했다.

### 보존한 의도
- 전역 `ProductProvider` 전체 제거는 사용처가 많아 이번 범위에서 제외했다. 페이지별 조회 리팩터는 별도 작업이 맞다.

### 검증
- `npm run typecheck`: 통과.
- `npm run lint -- --max-warnings=0`: 통과.
- `npm test`: 통과, 35 suites / 115 tests.
- `npm run functions:build`: 통과.

### 제한/남은 작업
1. `ProductProvider`는 아직 홈/관리자/상품 상세 사용처가 많아 유지했다. 줄이려면 페이지 단위 React Query 전환이 필요하다.
2. 이번 변경은 코드/의존성 정리라 브라우저 화면 확인은 수행하지 않았다.
