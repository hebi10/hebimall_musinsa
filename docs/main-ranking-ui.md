# 메인 베스트 랭킹 UI 문서

## 대상 파일
- `src/app/page.tsx`
- `src/app/_components/ProductSection.tsx`
- `src/app/_components/ProductSection.module.css`
- `src/app/products/_components/ProductCard.tsx`
- `src/app/products/_components/ProductCard.module.css`

## 목적
- 메인 페이지 베스트 랭킹 섹션의 카드 오버레이가 서로 겹치지 않도록 레이아웃 기준을 관리한다.
- 랭킹 번호, 할인 배지, 이미지 상단 정보 배치 충돌 여부를 점검한다.

## 2026-04-23 조정 사항
- 베스트 랭킹 카드의 랭킹 번호를 이미지 좌상단 오버레이에서 카드 상단 별도 칩으로 분리했다.
- `rankingItem` 상단 여백을 랭킹 칩 높이 기준으로 다시 계산해 카드 이미지의 `NEW`·할인 배지 영역과 수직으로 분리했다.
- 모바일 구간에서도 같은 구조를 유지하도록 랭킹 칩 크기와 여백을 CSS 변수로 함께 축소했다.

## 작업 시 주의
- 랭킹 번호와 상품 배지는 서로 다른 컴포넌트에서 그려지므로 충돌이 나면 `ProductCard`보다 `ProductSection` 쪽 배치 우선순위를 먼저 본다.
- 베스트 랭킹만 `rankingItem`을 사용하므로, 다른 섹션 카드 오버레이에는 영향이 없도록 범위를 제한한다.
