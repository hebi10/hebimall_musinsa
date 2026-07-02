# UI 품질 점검

## 2026-07-02 점검 결과

- 깨진 한글 의심 문자 스캔: `NO_SUSPICIOUS_MOJIBAKE`
- `src/app`, `src/shared` 디버그 `console.log`: 0건
- 클라이언트 화면의 직접 `Service.*` 호출: 없음. 남은 호출은 서버 페이지 데이터 로딩 또는 테스트 mock이다.
- `alert`/`confirm`: 121건. 공용 토스트/확인 모달 패턴을 정한 뒤 묶어서 바꾸는 것이 맞다.
- inline style: 동적 색상/크기 값은 유지 가능하다. 정적 레이아웃 스타일은 `admin/dashboard/users`, `admin/dashboard/orders`, `search`, `recommend` 쪽이 우선 정리 대상이다.

## 이번 정리

- 화면과 shared 계층의 디버그성 `console.log`를 제거했다.
- 사용자 정보, 쿠폰 코드, 포인트 요청, 업로드 경로/URL처럼 콘솔에 노출될 수 있는 값을 찍던 로그를 제거했다.

## 남은 우선순위

1. 공용 피드백 패턴을 정한 뒤 `alert`/`confirm`을 토스트/확인 모달로 교체한다.
2. 관리자 users/orders 화면의 정적 inline style을 CSS module로 옮긴다.
3. `src/shared/services/cartService.ts`의 재고 검증 TODO는 실제 상품 재고 정책이 확정될 때 처리한다.
