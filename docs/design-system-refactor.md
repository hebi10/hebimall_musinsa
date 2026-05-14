# 디자인 시스템 정리 문서

## 대상 범위
- 기준 화면 캡처
- 브랜치 분기
- CSS 토큰 정의 확인

## 이번 작업 목적
- 메인, 상품 목록, 장바구니, 관리자 페이지의 수정 전 기준 화면을 저장한다.
- 디자인 시스템 정리 전 브랜치를 분리한다.
- `products/page.module.css`, `ProductCard.module.css`, `globals.css`에서 사용하는 핵심 CSS 변수가 실제로 정의되어 있는지 확인하고 누락 가능성을 제거한다.

## 확인 대상 토큰
- `--spacing-lg`
- `--color-bg-primary`
- `--color-border`

## 2026-04-24 확인 결과
- `--color-bg-primary`, `--color-border`, `--spacing-lg`는 `src/styles/variables.css`의 `:root`에 이미 정의되어 있다.
- 전역 로드 경로도 `src/app/layout.tsx`에서 `globals.css`와 함께 `../styles/variables.css`를 import하고 있어, 대상 CSS에서 참조하는 토큰은 실제로 해석 가능하다.
- `src/app/products/page.module.css`와 `src/app/products/_components/ProductCard.module.css`의 대상 토큰 사용은 현재 기준으로 미정의 상태가 아니다.
- 그래서 이번 단계에서는 CSS 토큰 교체나 `globals.css` 수정이 필요하지 않았다.

## 진행 중 막힌 항목
- 기준 스크린샷 자동 저장은 로컬 브라우저/렌더링 실행이 이 환경 정책에 막혀 완료하지 못했다.
- 브랜치 생성도 `.git/refs/heads/*.lock` 생성 권한이 없어 실패했다.

## 남은 작업
- 로컬 IDE 또는 일반 터미널 권한에서 메인(`/`), 상품 목록(`/products`), 장바구니(`/cart`), 관리자(`/admin`) 기준 화면을 직접 저장한다.
- `.git` 쓰기 권한이 있는 환경에서 `refactor/styna-design-system` 또는 대체 브랜치명을 생성한다.

## 2026-04-24 카피 정리 메모
- `src/app/page.tsx`의 메인 카피는 카테고리 수, 상품 수, 할인 정보 중심으로 다시 썼다.
- `차분한`, `무드`, `리듬`, `셀렉션`처럼 반복되던 감성 표현과 자기 설명형 문장을 줄였다.

## 2026-04-24 헤더 구조 메모
- `src/app/page.tsx`, `src/app/page.module.css`에서 메인 섹션 헤더를 섹션별로 다르게 줄였다.
- 카테고리는 제목만, 추천은 제목+서브카피+버튼, 프로모션은 제목만, 신상품은 제목+버튼, 베스트는 제목+서브카피, 하단 CTA는 제목+버튼만 남겨 반복 리듬을 줄였다.

## 2026-04-24 세리프 축소 메모
- `src/app/page.module.css`, `src/app/_components/FeaturedProducts.module.css`, `src/app/_components/ProductSection.module.css`, `src/app/mypage/**/*.module.css`, `src/app/events/**/*.module.css`의 제목과 통계 숫자에서 `Noto Serif KR` 선언을 제거했다.
- 세리프는 `src/app/_components/MainBanner.module.css`의 메인 배너 제목에만 남기고, 전역 `--font-heading` 변수도 그 한 곳에서만 쓰도록 정리했다.
- 메인, 마이페이지, 이벤트 페이지의 타이포 위계는 기본 `Pretendard` 폰트에서 기존 크기·굵기·자간 차이만으로 유지한다.

## 2026-04-24 이미지 오버레이 정리 메모
- `src/app/_components/DynamicCategorySection.tsx`, `src/app/page.module.css`에서 카테고리 카드의 이미지 오버레이를 제거하고, 이미지 아래에 `카테고리명 + 상품 수 + 카테고리 보기` 정보 블록을 분리했다.
- 메인 프로모션은 `src/app/page.tsx`, `src/app/page.module.css`에서 이미지 위 어두운 그라데이션을 제거하고 배지 문구도 이미지 밖으로 이동시켰다.
- `src/app/_components/MainBanner.module.css`만 메인 배너용 오버레이를 유지하되 투명도를 낮춰 반복되는 과장감을 줄였다.

## 2026-04-24 배경 리듬 정리 메모
- `src/app/page.module.css`에서 메인 페이지 컨테이너와 카테고리, 프로모션, 신상품, 베스트, 하단 CTA 구간을 `var(--off-white)` 중심으로 맞춰 섹션별 배경 전환 횟수를 줄였다.
- `promoBand`의 검정 배경은 제거하고, 이미지·배지·메타 카드도 밝은 보더와 표면 계열 색으로 다시 정리했다.
- `seasonNote`의 `linear-gradient`는 제거하고 같은 밝은 배경 톤으로 통일해 메인 배너 아래 화면이 여러 조각으로 갈라져 보이지 않게 맞췄다.

## 2026-04-24 포인트 컬러 축소 메모
- `src/app/globals.css`, `src/styles/variables.css`에 검정 기반 액션 토큰을 추가하고 `color-primary` 계열을 그쪽으로 연결해 공용 CTA와 링크 hover가 버건디를 기본값으로 쓰지 않게 정리했다.
- `src/app/_components/**/*.module.css`, `src/app/page.module.css`, `src/app/mypage/**/*.module.css`, `src/app/products/_components/*.module.css`, `src/app/events/_components/EventList.module.css`의 일반 버튼, 링크, CTA는 검정 기반으로 바꾸고 hover도 같은 축으로 맞췄다.
- 버건디는 `ProductDetail` 할인율, 최근 본 상품/위시리스트 할인 배지, 이벤트 세일 카드 배지처럼 세일·특별 강조 영역에만 남겼다.

## 2026-04-24 글래스모피즘 제거 메모
- `src/app/_components/header/Header.module.css`에서 반투명 배경과 `backdrop-filter: blur(18px)`를 제거하고, 불투명 단색 헤더로 정리했다.
- `src/app/products/_components/ProductCard.module.css`의 상품 카드 배지는 blur 효과를 제거하고 단색 배경과 얇은 보더만 남기도록 단순화했다.

## 2026-05-11 메인 화면 자연화 메모
- `src/app/page.tsx`에서 추천 상품을 히어로 바로 아래로 올리고, 하단의 빈 CTA 섹션은 제거했다.
- 메인 카피는 `자주 찾는 카테고리 4개`, `추천 상품과 기획전을 바로 확인하세요`처럼 내부 설명처럼 보이는 문구를 쇼핑 맥락의 문장으로 교체했다.
- `MainBanner`는 칩형 메타와 작은 컷아웃 느낌을 줄이고, 큰 타이포와 더 큰 이미지 영역 중심으로 조정했다.
- 카테고리 카드는 반복 버튼을 제거하고 카드 전체가 탐색 진입점처럼 보이도록 정보 블록을 단순화했다.
- 사용자 피드백에 따라 히어로 직후 섹션은 `FeaturedProducts` 대신 기존 추천 상품 데이터의 `MD 추천 상품` 매대로 복구했다.
- 카테고리 레이아웃은 비대칭 매거진형 배치에서 4개 동일 폭 가로 카드 그리드로 되돌려 쇼핑몰 탐색 느낌을 강화했다.
- 상단 배너는 모델 컷아웃을 별도 배치하는 구조에서 완성된 editorial 배너 이미지 3장을 배경으로 쓰는 슬라이더 구조로 변경했다.
- 신규 배너 이미지는 `public/main/hero_editorial_outer.webp`, `hero_editorial_sale.webp`, `hero_editorial_best.webp`에 저장했다.
- 메인 가장 아래는 `신상품` 섹션이 오도록 `베스트 랭킹`과 `신상품` 순서를 바꿨다.
- 배너 원본에서 모델 상단이 잘리는 문제를 피하기 위해 3:1 비율의 고정 배너(`hero_editorial_*_fixed.webp`)를 추가하고 `MainBanner`가 해당 파일을 사용하도록 변경했다.
- Swiper fade 전환 중 비활성 슬라이드의 카피가 겹쳐 보이지 않도록 비활성 슬라이드의 `bannerContent`를 숨겼다.
- 사용자 제공 기존 시안 기준으로 메인 흐름을 `히어로 -> 카테고리 -> 신상품 -> 시즌오프 안내 -> 베스트셀러 -> 할인 상품 -> 안내 정보`로 복구했다.
- 무신사형 상품 매대 느낌에 맞춰 메인 섹션 폭, 얇은 구분선, 4열 상품 카드, 작은 배지/랭킹 번호 중심의 조밀한 UI로 정리했다.
- 반응형 기준을 정리해 901px 이상은 4열 매대, 900px 이하는 2열, 480px 이하는 카테고리/안내만 1열로 내려가도록 조정했다.
- 모바일에서 히어로 CTA는 1열 버튼, 상품 카드 가격/배지는 줄바꿈 가능하도록 보정해 텍스트가 카드 밖으로 밀리지 않게 했다.
- 2026-05-12: 추천 페이지 상품 카드도 커스텀 카드 대신 공용 `ProductCard`를 사용하도록 바꿔 메인/추천/상품 목록의 카드 밀도, 배지, 가격, 리뷰 표시를 통일했다.
- 2026-05-12: 추천 필터 탭은 둥근 pill 대신 2px radius 사각 탭으로 맞춰 메인 탭형 상품 영역과 같은 조형으로 정리했다.
- 2026-05-12: 메인 모바일에서 섹션 헤더 액션, 랭킹 배지 충돌, 서비스 안내, 푸터 링크 그리드를 보정해 484px 전후 화면에서도 같은 쇼핑몰 UI 리듬을 유지하도록 했다.
- 2026-05-12: 홈 화면에서도 쇼핑 안내와 실시간 상담 플로팅 버튼이 보이도록 각 컴포넌트의 홈 제외 조건을 제거하고, 우측 하단 z-index와 간격을 안정화했다.
- 2026-05-12: 우측 하단 쇼핑 안내/실시간 상담 버튼과 팝업을 무신사형 사각 CTA, 검정 헤더, 흰 표면, 얇은 보더 기준으로 재정리하고 모바일에서는 하단 시트처럼 보이도록 반응형을 보정했다.
- 2026-05-12: 쇼핑 안내 팝업은 자동 노출을 제거하고 배송/교환/쿠폰/고객센터 정보 허브로 바꿨으며, 실시간 상담은 열자마자 목적 선택과 직접 입력이 가능한 상담 도구로 조정했다.
- 2026-05-12: 실시간 상담 위젯의 헤더, 목적 버튼, 주문/배송/문의 이동 CTA, 입력 영역을 고객센터형 조밀한 UI로 정리하고 `AI` 명령어 노출을 제거했다.
- 2026-05-14: 실시간 상담 위젯 하단의 `주문내역`, `배송조회`, `1:1 문의`, `상품문의` 이동 CTA 묶음을 제거하고 입력 영역이 바로 이어지도록 정리했다.
- 2026-05-14: 실시간 상담에서 `상담원 연결` 요청 후 빠른 선택 버튼 영역이 사라지고, 새로 시작 시 다시 표시되도록 상태를 추가했다.
- 2026-05-14: `상담원 연결` 후 빠른 선택 버튼이 사라져 창이 답답해 보이지 않도록 연결 요청 상태에서 메시지 영역 높이를 별도로 확장했다.
- 2026-05-14: 직접 채팅 입력은 `상담원 연결` 요청 전까지 비활성화하고, 연결 후에만 입력/전송 가능하도록 제한했다. 상담창 메시지 영역은 기본 320px, 연결 후 460px로 늘렸다.

## 2026-04-24 관리자·장바구니 토큰 통합 메모
- `src/app/globals.css`의 기존 토큰(`--black`, `--off-white`, `--line`, `--text-subtle`, `--radius-md`, `--surface-muted`)을 기준으로 별도 색상값 추가 없이 관리자·장바구니·주문 플로우를 정리했다.
- `src/app/admin/layout.module.css`는 Atlassian 계열 하드코딩 블루/네이비와 `3px` radius를 제거하고, 동일한 표면·보더·텍스트 축으로 맞췄다.
- `src/app/cart/page.module.css`, `src/app/orders/cart/page.module.css`, `src/app/orders/checkout/page.module.css`, `src/app/orders/complete/page.module.css`는 `#f9fafb`, `#111827`, 큰 radius, 블루 정보 박스를 걷어내고 메인 쇼핑몰과 같은 밝은 표면 체계로 통합했다.

## 2026-05-12 1순위 화면 메인 톤 확산
- 인증 화면은 보라 그라데이션과 강한 카드 장식을 걷어내고, 흰 폼 카드 + 얇은 보더 + 검정 CTA 기준으로 맞췄다.
- 마이페이지 주문/쿠폰/포인트/Q&A/회원정보/주문상세는 컬러별 테마 카드 대신 메인과 같은 밝은 표면, 2px radius, 얇은 구분선, 검정 액션으로 하단 override를 추가했다.
- 검색 화면과 마이페이지 쿠폰 등록 컴포넌트의 pill/파랑 CTA도 사각 탭·검정 액션 계열로 낮췄다.

## 2026-05-12 2순위 주문/커뮤니티/이벤트 톤 정리
- 주문 흐름(`/cart`, `/orders/cart`, `/orders/checkout`, `/orders/complete`, `/orders/delivery`)은 요약 박스와 폼 컨트롤의 radius를 2px로 낮추고 그림자를 제거해 메인 상품 매대와 같은 밀도로 맞췄다.
- 고객센터/커뮤니티(`/cs/*`, `/qna*`, `/reviews`, `/support/offline`)는 파랑·오렌지 그라데이션, 큰 pill, 떠 있는 카드 효과를 줄이고 표/리스트 중심의 흰 표면과 얇은 보더로 정리했다.
- 이벤트 목록/상세는 타입별 강한 테마 그라데이션을 중립 변수로 덮고, 검정 CTA와 낮은 반경의 카드 구조로 통일했다.

## 2026-05-12 3순위 관리자 운영툴 톤 정리
- 관리자 영역은 쇼핑 화면과 달리 운영툴로 취급해 흰 표면, 낮은 대비, 얇은 보더, 조밀한 카드/테이블 중심으로 맞췄다.
- `/admin/**`, `/admin/dashboard/**`의 공통 카드, 버튼, 입력, 모달, active nav에 2px radius와 검정 CTA 기준을 적용했다.
- 파랑/보라 그라데이션이 강한 대시보드, 시드 페이지, 상품 수정 모달, 이벤트 폼, Add/Edit 모달은 파일별 보정으로 장식 밀도를 낮췄다.

## 2026-05-12 보조 페이지 잔여 톤 정리
- 전체 페이지 확인 중 남아 있던 404, 약관, 사업자정보 화면의 보라/파랑 CTA, 큰 카드 radius, 강한 그림자를 제거했다.
- 보조 문서 화면도 흰 표면, 얇은 보더, 검정 구분선, 2px radius 기준으로 맞췄다.

## 2026-05-12 상품 상세 옵션 UI 보정
- `/products/[productId]` 상세의 색상칩은 `white gold`, `yellow gold`, `rose gold`, `silver` 같은 복합/주얼리 색상명을 실제 swatch 색으로 변환하는 공용 유틸을 사용한다.
- 상세 하단 찜 버튼은 48px 아이콘 버튼 안에 텍스트를 넣지 않고 상품 카드와 같은 하트 SVG 아이콘으로 렌더링한다.
- 상세 찜 버튼은 `wishlistItems` 상태와 낙관적 로컬 상태를 함께 사용해 클릭 즉시 하트 상태가 바뀌며, 성공 alert로 렌더링을 막지 않는다.
