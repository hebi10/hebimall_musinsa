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
