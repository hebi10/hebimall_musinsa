# 관리자 대시보드 디자인 리뷰 문서

## 대상 파일
- `src/app/admin/page.tsx`
- `src/app/admin/page.module.css`
- `src/app/admin/layout.tsx`
- `src/app/admin/layout.module.css`
- `src/app/admin/_components/adminNav.tsx`
- `src/app/admin/_components/adminNav.module.css`
- `src/app/admin/_components/Chart.tsx`
- `src/app/admin/_components/AuthChecking.tsx`

## 리뷰 목적
- `/admin` 루트 대시보드의 정보 위계, 반응형 대응, 탐색 흐름, 시각적 일관성을 점검한다.

## 2026-04-24 확인 결과
- `768px` 이하에서 사이드바가 화면 밖으로 숨겨지지만 열기 버튼이나 토글 상태 연결이 없어 모바일에서 메뉴 접근이 막힌다.
- 차트는 `400px~500px` 고정 폭 SVG를 사용해 작은 화면에서 카드 폭보다 넓어질 수 있다.
- 카테고리 판매량 차트는 임시 랜덤 값을 사용해 실제 운영 지표처럼 보이지만 신뢰할 수 없는 데이터를 보여준다.
- 인증 확인 화면은 인라인 스타일과 보라색 그라데이션을 사용해 관리자 대시보드 본문 톤과 시각적으로 분리된다.
- 공통 네비게이션은 현재 위치를 드러내는 active 상태가 없어 메뉴 밀도가 높은 화면에서 현재 섹션 인지가 약하다.

## 2026-04-24 후속 정리 메모
- `src/app/admin/layout.module.css`의 배경, 보더, 텍스트, 버튼, 스크롤바는 전역 토큰(`--off-white`, `--line`, `--text-subtle`, `--black`, `--radius-md`)으로 다시 맞췄다.
- 그래서 관리자 화면의 기본 톤은 메인 쇼핑몰과 같은 시스템 안으로 들어왔지만, 모바일 메뉴 진입 불가와 active 상태 부재 같은 구조 문제는 그대로 남아 있다.

## 후속 제안
- 모바일 헤더에 메뉴 버튼과 오버레이 닫기 흐름을 추가하고, 현재 경로 active 스타일을 네비게이션에 연결한다.
- 차트는 컨테이너 기준으로 너비를 계산하거나 반응형 SVG로 바꾸고, 실제 집계 데이터만 노출한다.
- 인증 로딩/권한 오류 상태도 관리자 공통 토큰과 컴포넌트로 맞춰 첫 진입 경험을 일관되게 만든다.
