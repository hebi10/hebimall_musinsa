# 디자인 정리 전체 QA 문서

## 대상 페이지
- 메인 페이지
- 상품 목록 페이지
- 상품 상세 페이지
- 장바구니
- 마이페이지
- 이벤트 페이지
- 관리자 페이지

## 확인 범위
- 반응형: `360px`, `768px`, `1440px`
- 상태: hover, 버튼 대비, 폰트 적용 범위
- 기술 점검: 미정의 CSS 변수, 콘솔 에러, 기본 빌드/타입 체크, 가능한 범위의 DevTools/Lighthouse 대체 점검

## 작업 목적
- 디자인 정리 이후 레이아웃 파손, 토큰 누락, 반응형 깨짐, 런타임 오류 가능성을 전체 범위에서 점검한다.

## 작업 결과
- 메인, 상품 목록, 상품 상세, 장바구니, 마이페이지, 이벤트 페이지는 코드 기준으로 전역 토큰 사용, hover 상태, 기본 반응형 분기가 전반적으로 정리되어 있다.
- 관리자 페이지는 모바일 사이드바 토글 부재, 고정 폭 차트, 하드코딩된 구형 색상 체계가 남아 있어 이번 QA에서 핵심 이슈로 분류했다.
- 전역 폰트는 `globals.css`의 `--font-base`가 `body`, `button`, `input`, `textarea`, `select`에 적용되고, 세리프 계열 `--font-heading`은 현재 메인 배너 타이틀에만 사용된다.
- `src/app`, `src/styles` 기준 CSS 변수 스캔에서는 미정의 변수 사용이 발견되지 않았다.

## 검증 결과
- `npm run build` 통과
- `npx tsc --noEmit --pretty false` 통과
- `npm run lint`는 ESLint 초기 설정 프롬프트가 떠서 자동 점검 기준으로는 실행하지 못했다.
- Next.js 15 기준 `src/app/layout.tsx`의 `metadata.themeColor`는 `viewport export`로 옮기라는 빌드 경고가 반복 발생했다.

## 확인 한계
- 현재 환경에서는 브라우저 실행과 스크린샷 저장이 막혀 있어 실제 `360px`, `768px`, `1440px` 렌더링, 콘솔 에러, Lighthouse, DevTools 점검은 수행하지 못했다.
- 따라서 이번 결과는 빌드, 타입 체크, CSS 토큰 스캔, 코드 리뷰 기준 QA로 정리한다.

## 2026-05-11 메인 화면 피드백 반영
- 히어로, 추천 상품, 카테고리, 프로모션, 하단 CTA 흐름을 조정해 AI 템플릿처럼 보이는 반복 버튼/칩/설명형 카피를 줄였다.
- 사용자 재피드백에 따라 메인 상단 추천 매대는 `MD 추천 상품`으로 명확히 복구했고, 카테고리는 4개 동일 폭 가로 그리드로 정리했다.
- 상단 배너는 기존 세로 모델 이미지를 별도 배치하지 않고, 생성한 editorial 배너 이미지를 `Image fill` 배경으로 쓰도록 변경했다.
- 로컬 `next dev`는 현재 환경에서 `spawn EPERM`으로 실행되지 않아 브라우저 렌더링 확인은 하지 못했다.
- `next build`는 컴파일 단계는 통과했지만 Next 타입 검증 워커 실행 단계에서 같은 `spawn EPERM`으로 실패했다.

## 2026-05-12 2순위 화면 QA 메모
- 주문, 고객센터/커뮤니티, 이벤트 상세는 기능 로직 변경 없이 CSS override 중심으로 메인 톤을 확산했다.
- 주요 확인 기준은 `2px radius`, 무그림자 카드, 검정 CTA, 중립 배지, 리스트/표 중심 구조다.
- 실제 브라우저에서는 `/orders/delivery`, `/support/offline`, `/events/[eventId]`처럼 기존 장식이 강했던 화면을 우선 확인한다.
- `npm run typecheck`와 `git diff --check`는 통과했다.
- `npm run lint`는 로컬에서 `eslint` 실행 파일을 찾지 못해 실패했다.
- `npm run build`는 CSS/Next 컴파일 단계는 통과했지만, 이후 lint/type worker 생성에서 `spawn EPERM`으로 실패했다.

## 2026-05-12 관리자 3순위 QA 메모
- 관리자 영역은 기능 로직 변경 없이 CSS override 중심으로 운영툴 톤을 정리했다.
- `npm run typecheck`와 `git diff --check`는 통과했다.
- `npm run build`는 CSS/Next 컴파일 단계 통과 후 기존과 같은 `spawn EPERM`으로 실패했다.
- `npm run lint`는 로컬 `eslint` 실행 파일 부재로 실패했다.

## 2026-05-12 전체 페이지 잔여 확인
- 전체 CSS 스캔에서 404와 법적 고지 화면에 이전 보라/파랑 CTA와 큰 카드 톤이 남아 있어 추가 보정했다.
- 이후 `npm run typecheck`와 `git diff --check`는 다시 통과했다.
- 스캔에 남는 다수 항목은 기존 선언을 하단 override로 덮는 구조의 잔여 코드이며, 실제 반영 여부는 브라우저 캡처로 최종 확인이 필요하다.

## 2026-06-05 반응형 이슈 보정
- 모바일 메뉴가 열릴 때 헤더 z-index를 플로팅 상담/안내 버튼보다 높여 메뉴 위 겹침을 막았다.
- `/auth/*`에서는 실시간 상담과 쇼핑 안내 플로팅 UI를 숨겨 로그인 하단 CTA 영역 압박을 제거했다.
- 480px 이하에서는 쇼핑 안내 고정 버튼을 숨기고 상담 버튼을 축소해 상품/카테고리/404 하단 콘텐츠 가림을 줄였다.
- App Router 404 연결을 위해 `src/app/not-found.tsx`에서 기존 `404.tsx`를 export하도록 추가했다.
- Chrome 및 Playwright Chrome 채널 스크린샷으로 `/products`, `/categories/clothing`, `/auth/login`, 커스텀 404의 모바일 렌더링을 확인했다.

## 2026-06-05 AI 느낌/개발 표시 완화
- `STYNA`는 브랜드명으로 유지하고, 메인 배너와 이벤트 배너의 영문 장식 메타 문구는 한국어 쇼핑 정보로 교체했다.
- 모바일 이벤트 카드 높이와 오버레이 강도를 낮추고 이벤트 모바일의 상담 플로팅 버튼을 숨겨 CTA 가림을 제거했다.
- React Query Devtools는 `NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS=true`일 때만 보이게 하고, Next dev indicator는 `devIndicators: false`로 껐다.
- `npm run typecheck`, `npm test -- --runTestsByPath src/app/_components/chat/ChatWidget.test.tsx --runInBand`, `git diff --check` 통과.
## 2026-06-11 디자인 피드백 10건 반영
- 모바일 상품/카테고리 그리드는 `minmax(0, 1fr)` 기준으로 보정하고 상품 카드 위시리스트, 헤더 메뉴, 장바구니 수량/삭제 버튼의 터치 타깃을 44px 기준에 맞췄다.
- 상품/이벤트 목록 로딩은 카드형 스켈레톤을 추가했고, 마이페이지 비로그인/관리자 게이트/로그인 모바일 링크는 흑백 CTA와 단일 상태 안내로 정리했다.
- QnA/리뷰 필터는 모바일에서 내부 가로 스크롤로 처리하고, 카테고리 기본 표시명은 원격 목록이 비어도 `tops -> 상의`처럼 한국어 기본값을 사용하도록 했다.
- Playwright 390px 캡처로 `/products`, `/cart`, `/reviews`, `/auth/login`에서 가로 밀림과 주요 CTA 겹침이 없는 것을 확인했다. `/categories`, `/qna`, `/categories/tops`는 데이터 로딩 상태에서만 확인되어 최종 목록 UI는 데이터 연결 후 재확인이 필요하다.

## 2026-06-29 Chrome 구매/관리 QA
- 데스크톱 Chrome에서 상품 목록, 상세, 장바구니, checkout, 주문 완료, 마이페이지 주문 목록, 관리자 주문 관리의 기본 레이아웃은 큰 깨짐 없이 쇼핑몰 흐름으로 이어졌다.
- 상품 목록 카테고리 필터가 `accessories`, `bags`처럼 영문 id로 노출되어 실제 쇼핑몰 완성도 기준으로 어색하다.
- 상품 상세 색상 스와치가 시각적으로는 보이지만 버튼 접근성 이름이 비어 있어 자동화/스크린리더 기준으로는 `title`에만 의존한다.
- 콘솔에는 상품 상세 LCP 이미지 `priority` 권고, `Image fill` 부모 position 경고, 상품 쿼리 복합 인덱스 fallback 경고, 주문 목록 key prop 경고가 남아 있다.
- 2026-06-29: 상품 목록 카테고리 표시명, 상품 상세 색상 스와치 `aria-label`, 대표 이미지 `priority`, 주문 목록 상품 key, 장바구니 배지 stale cache를 보정했다. Firestore 인덱스 경고는 인덱스 파일 반영 후 배포가 필요하다.
