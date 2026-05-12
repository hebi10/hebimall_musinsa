# 인증 화면 UI 문서

## 대상 파일
- `src/app/auth/layout.module.css`
- `src/app/auth/login/page.module.css`
- `src/app/auth/signup/page.module.css`
- `src/app/auth/find-email/page.tsx`
- `src/app/auth/find-email/page.module.css`
- `src/app/auth/find-password/page.module.css`
- `src/app/auth/reset-password/page.module.css`

## 2026-05-12 정리 사항
- 인증 레이아웃 배경을 메인과 같은 `var(--off-white)` 기준으로 맞추고, 카드형 폼은 흰 배경 + 얇은 보더 + 2px radius로 정리했다.
- 회원가입, 비밀번호 찾기, 비밀번호 재설정 화면의 보라색 그라데이션, 큰 radius, 강한 그림자, 배경 장식 요소를 하단 override로 눌렀다.
- 버튼과 입력 focus는 검정 액션과 `var(--action-soft)` 링 기준으로 맞췄다.
- 임시 텍스트만 있던 이메일 찾기 화면에 최소 패널 스타일을 추가해 인증 화면 흐름과 같은 톤으로 보이게 했다.

## 작업 시 주의
- 인증 화면은 기능 구현보다 신뢰감과 가독성이 우선이므로, 배경 장식과 컬러 테마를 새로 늘리지 않는다.
- 로그인 화면은 기존에 이미 절제된 톤이라 레이아웃 카드 기준만 공용 auth layout에서 받도록 둔다.
