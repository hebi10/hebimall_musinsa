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
