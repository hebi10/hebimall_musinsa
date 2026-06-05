# STYNA 반응형 QA 보고서

- 대상: `http://localhost:3000`
- 일시: 2026-06-05
- 방식: 사용자 Chrome QA 창 + 자동 DOM/콘솔 스캔 + 서브에이전트 3개 영역별 분석
- 범위: 대표 라우트 67개, desktop 1524px / tablet 824px / mobile 약 500px

## 요약

- 본문 기준 가로 overflow: 0건
- 깨진 이미지: 0건
- 기본 라우트 로드 실패: 0건
- 태블릿/모바일 offscreen 후보는 대부분 닫힌 모바일 메뉴의 정상 대기 위치였다.
- 실제 주요 문제는 반응형 깨짐보다 상품 Firestore 쿼리 실패, 모바일 플로팅 UI 겹침, App Router 404 미연결이다.

## 이슈

### P1 - 상품 목록 기본 진입이 Firestore 쿼리 오류로 실패

- 재현: `/products`
- 증거: `screenshots/issue-products-mobile-query-fail.png`
- 증상: 모바일 캡처에서 `상품 목록 로딩 실패: 상품 조회에 실패했습니다.`가 노출된다.
- 콘솔: `Order by clause cannot contain more fields after the key price`
- 추정 원인: 기본 가격 필터가 항상 range 조건을 만들고, 이후 `createdAt`/`__name__` 정렬이 붙어 Firestore 제약에 걸린다.

### P2 - 카테고리 상세가 오류를 빈 카테고리처럼 보여줌

- 재현: `/categories/clothing`, 리다이렉트 후 `/categories/tops`
- 증거: `screenshots/issue-category-mobile-query-fail.png`
- 증상: 콘솔에는 composite index 필요 오류가 있는데, 화면은 `총 0개 상품` 빈 상태로 보인다.
- 영향: 사용자는 데이터 오류와 실제 빈 카테고리를 구분할 수 없다.

### P2 - 모바일 메뉴 위에 플로팅 버튼이 겹침

- 재현: 모바일 폭 `/`에서 햄버거 메뉴 열기
- 증거: `screenshots/evidence-mobile-menu-open.png`
- 증상: `쇼핑 안내`, `실시간 상담`, 개발 도구 버튼이 열린 모바일 메뉴 위에 남아 메뉴 항목 일부를 가린다.
- 참고: 개발 도구 버튼은 dev 전용이라 제외하더라도 앱 플로팅 버튼 2개는 실제 UX 이슈다.

### P2 - 모바일 로그인 화면에서 플로팅 UI가 CTA 영역을 압박

- 재현: 모바일 폭 `/auth/login`
- 증거: `screenshots/evidence-login-mobile.png`
- 증상: 로그인/소셜 로그인/회원가입 CTA가 많은 화면에서 우하단 플로팅 UI가 하단 영역을 가린다.
- 제안: auth/order/admin gate 화면에서는 플로팅 버튼을 숨기거나 하나로 접는 방식이 적합하다.

### P3 - App Router 커스텀 404가 연결되지 않음

- 재현: `/not-a-real-page-for-qa`
- 증거: `screenshots/issue-404-route-check.png`
- 증상: 프로젝트의 `src/app/404.tsx` 대신 Next 기본 `404 This page could not be found.`가 나온다.
- 제안: `src/app/not-found.tsx`를 추가하거나 기존 404 컴포넌트를 재사용한다.

### P3 - 보호 라우트의 비로그인 대기 UI가 일관되지 않음

- 재현: `/orders/cart`, `/orders/checkout`, `/orders/complete`, `/mypage/*`
- 증상: 일부는 즉시 로그인 페이지로 이동하고, 일부는 `확인 중`, `로딩중...` shell을 잠깐 보여준다.
- 영향: 큰 레이아웃 깨짐은 없지만 비로그인 사용자가 보는 gate 경험이 산발적이다.

## 확인 한계

- 관리자 내부 화면은 현재 Chrome 세션이 비로그인 상태라 실제 관리자 권한 UI까지 보지 못했다.
- 모바일 실측은 Chrome 창 크기 조정 기준으로 내부 viewport 약 500px에서 수행했다.
- 파일 수정은 하지 않았고, QA 산출물만 생성했다.

## 산출물

- 스캔 결과: `.gstack/qa-reports/scan-desktop.json`, `scan-tablet.json`, `scan-mobile.json`
- 요약: `.gstack/qa-reports/scan-summary.json`
- 콘솔: `.gstack/qa-reports/console-errors.json`
- 스크린샷: `.gstack/qa-reports/screenshots/`
