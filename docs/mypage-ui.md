# 마이페이지 UI 문서

## 대상 파일
- `src/app/mypage/page.tsx`
- `src/app/mypage/page.module.css`
- `src/app/mypage/layout.tsx`
- `src/app/mypage/layout.module.css`

## 작업 목적
- 마이페이지를 메인 페이지와 어울리는 단정하고 차분한 톤으로 정리한다.
- 정보 밀도는 유지하되 과한 운영 도구 느낌을 줄이고 탐색 흐름을 부드럽게 만든다.

## 확인 결과
- `src/app/mypage/layout.module.css`, `src/app/mypage/page.module.css`, `src/app/mypage/_components/*.module.css`의 제목과 통계 숫자에서 `Noto Serif KR` 선언을 제거했다.
- 프로필명, 섹션 제목, 카드 숫자 강조는 `Pretendard` 기본 폰트에 기존 크기·굵기·자간만 유지해 담백한 쇼핑몰 톤으로 맞췄다.
- 로그인 버튼, 최근 본 상품/위시리스트 비로그인 CTA, 빠른 이동 아이콘은 검정 기반으로 정리하고 버건디는 할인 배지에만 남겼다.

## 우선 개선 포인트
- 메인 페이지 기준 배경, 보더, 타이포 위계를 마이페이지 핵심 화면에 먼저 맞춘다.

## 2026-05-12 1순위 하위 화면 정리
- 주문 목록, 쿠폰함, 포인트, Q&A, 회원정보 수정, 주문 상세 화면에 메인 쇼핑몰 기준의 절제형 override를 추가했다.
- 화면별 보라/노랑/초록/청록 그라데이션 헤더와 강한 그림자는 최종 cascade에서 흰 표면, 얇은 보더, 검정 액션으로 눌렀다.
- `CouponRegister` 컴포넌트도 파란 CTA와 큰 radius를 제거해 마이페이지 쿠폰 화면과 같은 톤으로 맞췄다.

## 2026-06-05 사용자 활동 조회 보정
- 최근 본 상품과 찜한 상품 조회에서 Firestore 복합 인덱스가 아직 없을 때는 `userId` 단일 조건 조회 후 클라이언트에서 최신순 정렬한다.
- `firestore.indexes.json`에는 `userRecentProducts(userId, viewedAt desc)`, `userWishlist(userId, addedAt desc)` 인덱스를 추가했다.
- Chrome 확인에서 로그인 후 마이페이지의 최근 본 상품/찜한 상품 목록이 콘솔 인덱스 오류 없이 표시되는 것을 확인했다.
