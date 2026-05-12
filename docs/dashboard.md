# 관리자 대시보드

## 구조

```
src/app/admin/
  page.tsx                     # 대시보드 페이지
  _components/
    Chart.tsx                  # 차트
    ErrorBoundary.tsx          # 에러 바운더리
    LoadingSpinner.tsx         # 로딩 컴포넌트
src/shared/
  services/dashboardService.ts # 데이터 서비스
  services/userService.ts      # Firebase 사용자 조회
  hooks/useDashboardQuery.ts   # React Query Hook
```

## 데이터 레이어

- `DashboardService`: 통계 데이터 조회 및 가공. 상품·주문은 Mock 기반, 사용자·쿠폰·이벤트는 Firebase 연결
- `useDashboardQuery`: React Query 기반. 5분 간격 자동 갱신
- Firebase 연결 실패 시 빈 배열 반환

## 차트

- `Chart` 컴포넌트: 막대/선/원 그래프 지원
- 매출 추이 (최근 6개월), 주문 상태 분포, 카테고리별 판매량
- 데이터가 없으면 해당 차트 숨김

## 통계 카드

- 사용자, 상품, 쿠폰, 이벤트, 주문, 매출 카드
- 월별 증감률 표시
- `dataAvailability` 필드로 각 데이터 소스 가용 여부 추적 → 데이터 없는 카드 숨김 처리

## 표시 로직

- 상품/주문 통계: Mock 데이터 기반으로 항상 표시
- 사용자/쿠폰/이벤트 통계: Firebase 데이터가 있을 때만 표시
- 차트: 해당 데이터가 존재하는 경우에만 렌더링

## 에러 처리

- `ErrorBoundary` 컴포넌트로 렌더링 오류 격리
- 네트워크 오류 시 재시도
- 기본값 fallback 처리

## 2026-05-11 점검

- `src/app/admin/dashboard/dashboard/page.tsx`의 깨진 한글/JSX를 정상 UTF-8 기준으로 복구.
- 관리자 접근 제어는 `src/app/admin/layout.tsx`의 `AuthChecking`에 맡기고, 대시보드 내부의 중복 `user.role` 확인은 제거된 상태를 유지.
- `src/app/admin/dashboard/page.tsx`는 `useEffect`, `useRouter`, `useAuth`를 사용하는 redirect 페이지라 `"use client"` 지시문을 유지해야 한다.

## 2026-05-12 디자인 톤 정리

- 대시보드 데이터 레이어와 표시 로직은 변경하지 않고 CSS만 보정했다.
- `src/app/admin/dashboard/dashboard/page.module.css`의 그라데이션 배경, 글래스 카드, 컬러별 통계 카드, 그라데이션 빠른 액션을 중립 운영툴 톤으로 낮췄다.
- 관리자 공통 레이아웃에서 하위 페이지의 버튼/입력/카드/모달까지 검정 CTA와 2px radius 기준으로 덮도록 했다.

## 2026-05-12 운영 지표 정리

- `/admin` 루트 대시보드의 카테고리 차트에서 `Math.random()` 임시 값을 제거했다.
- 차트는 `DashboardService.getCategoryBreakdown()` 결과를 사용하며 주문 판매량이 있으면 판매량, 없으면 등록 상품 수를 표시한다.
- 카테고리명 조회 실패 시에도 집계 ID를 표시하고 임의 숫자는 만들지 않는다.

## 2026-05-12 배포 런타임 오류 수정

- `/admin` 호스팅 페이지에서 `Cannot read properties of undefined (reading 'resolveSettledValue')` 오류가 발생했다.
- 원인은 React Query에 `DashboardService.getDashboardStats` 정적 메서드 참조를 그대로 넘겨 호출 컨텍스트의 `this`가 사라진 것이다.
- `DashboardService` 내부 정적 호출을 클래스명 기준으로 바꾸고, `useDashboardQuery`의 `queryFn`은 래퍼 함수로 호출하도록 정리했다.
- 분리 호출 회귀 테스트 `src/shared/services/dashboardService.test.ts`를 추가했다.
