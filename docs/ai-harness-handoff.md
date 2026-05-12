### commit message
- `fix: stabilize admin dashboard query binding`

### 인수인계 (최대 3개)
1. 관리자 대시보드 배포 오류 원인
   - `/admin` 호스팅 화면의 `resolveSettledValue` 오류는 React Query가 `DashboardService.getDashboardStats`를 분리 호출하며 static 메서드 내부 `this`가 끊겨 발생.
   - 로컬 회귀 테스트에서 같은 오류를 재현했다.

2. 수정 내용
   - `DashboardService` 내부 정적 헬퍼 호출을 `DashboardService.*`로 바꿔 호출 컨텍스트 의존을 제거.
   - `useDashboardQuery`의 `queryFn`은 `() => DashboardService.getDashboardStats()` 래퍼로 명시 호출.
   - `src/shared/services/dashboardService.test.ts`에 분리 호출 회귀 테스트 추가.

3. 배포 반영
   - 현재 코드는 수정됐지만 호스팅 페이지에는 재빌드/재배포 후 반영된다.
   - 배포 전 관리자 계정으로 `/admin` 진입을 한 번 확인하면 된다.

### 검증
- `npm run typecheck`: 통과.
- `npm test -- --runTestsByPath src/shared/services/dashboardService.test.ts`: 통과.
- `npx eslint src/shared/services/dashboardService.ts src/shared/services/dashboardService.test.ts src/shared/hooks/useDashboardQuery.ts`: 통과.
- `npm run build`: 컴파일 성공 후 현재 환경의 Next worker `spawn EPERM` 제약으로 중단.

### 남은 작업 (최대 3개)
1. `npm run deploy:firebase` 또는 기존 배포 절차로 호스팅 재배포.
2. 배포 후 관리자 계정으로 `/admin`에서 대시보드 카드/차트 로딩 확인.
3. 전체 lint 부채가 정리되면 `npm run ci` 재확인.
