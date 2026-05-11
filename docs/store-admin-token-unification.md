# 상점·관리자·장바구니 토큰 통합 문서

## 대상 파일
- `src/app/globals.css`
- `src/app/admin/layout.module.css`
- `src/app/cart/page.module.css`
- `src/app/orders/cart/page.module.css`
- `src/app/orders/checkout/page.module.css`
- `src/app/orders/complete/page.module.css`

## 작업 목적
- 관리자 레이아웃, 장바구니, 주문 플로우에 남아 있는 하드코딩 색과 radius를 전역 토큰 기준으로 정리한다.
- `--black`, `--off-white`, `--line`, `--text-subtle`, `--radius-md`, `--surface-muted`를 중심으로 UI 톤을 맞춘다.
- 장바구니와 주문 완료 흐름도 메인 쇼핑몰과 같은 표면·보더·텍스트 체계 안에 들어오게 만든다.

## 2026-04-24 작업 기준
- 관리자 계열은 `#172b4d`, `#42526e`, `#2b6cb0`, `3px` radius가 섞여 있다.
- 장바구니·주문 계열은 `#f9fafb`, `#111827`, `0.75rem` radius가 반복되고 일부 블루/그린 포인트가 독립적으로 남아 있다.
- 이번 단계에서는 범위를 `admin/layout`, `cart`, `orders/cart`, `orders/checkout`, `orders/complete`로 묶어 우선 통합한다.

## 2026-04-24 적용 결과
- `src/app/globals.css`는 이미 필요한 토큰을 갖고 있어 값 추가 없이 기존 전역 토큰을 그대로 재사용했다.
- `src/app/admin/layout.module.css`는 네이비·블루 계열 하드코딩을 제거하고, 오프 화이트 배경과 공통 보더/텍스트 체계로 정리했다.
- `src/app/cart/page.module.css`, `src/app/orders/cart/page.module.css`, `src/app/orders/checkout/page.module.css`는 카드 표면, 컨트롤 보더, CTA, 정보 박스를 모두 공통 토큰으로 바꿨다.
- `src/app/orders/complete/page.module.css`는 성공/안내/추천 섹션의 독립적인 그린·블루 그라데이션을 걷어내고, 장바구니 이후 흐름과 연결되는 중성 톤으로 맞췄다.

## 검증
- `npx tsc --noEmit --pretty false` 통과

## 2026-04-24 보안 규칙 수정 전 기준선
- 요청 브랜치 `fix/security-admin-permission` 생성은 `.git/refs/heads` 쓰기 거부 ACL 때문에 실패했다.
- 대체 브랜치명 `fix-security-admin-permission` 생성도 `.lock` 파일 생성 권한 거부로 실패해, 현재 브랜치는 `main` 상태다.
- `npx tsc --noEmit --pretty false` 통과.
- `npx jest --runInBand` 통과: 2개 테스트 스위트, 28개 테스트.
- `npm run build`는 Next.js 컴파일 완료 후 lint/type 단계에서 `spawn EPERM`으로 실패.
- `npm run lint`는 ESLint 설정 프롬프트가 떠서 자동 검증 불가.
- `.env.local`의 Firebase 공개 설정은 존재하며, 로그인 화면의 테스트 계정 후보 2개는 Auth 로그인과 `users/{uid}` 문서 조회가 가능하다.
- 관리자 후보 계정은 `role: admin`, 일반 사용자 후보 계정은 `role` 미설정 상태로 확인했다.

## 남은 확인
- 실제 브라우저에서 주문 완료 페이지의 구간 구분이 너무 옅어지지 않았는지 확인이 필요하다.
- 관리자 모바일 사이드바 토글과 active 상태는 이번 범위에 포함하지 않아 별도 후속 작업이 필요하다.
- 보안 규칙 수정 전 작업 브랜치는 로컬 `.git` 권한을 복구한 뒤 다시 생성해야 한다.
