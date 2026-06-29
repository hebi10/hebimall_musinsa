### commit message
- 과설계 레이어 제거 및 상품/카테고리 공통 흐름 축소

### 인수인계
1. Ponytail 정리 완료
   - 미사용 mock 모듈, 구형 Add/Edit 상품 모달, 구형 mock 관리자 대시보드, 이미지 캐시 래퍼를 삭제했다.
   - `/admin/dashboard`는 `/admin`으로 redirect하고, 사용자/주문 관리자 페이지의 중복 헤더/Nav/logout 렌더를 제거했다.
   - `swiper` 의존성을 제거하고 `MainBanner`를 React state + CSS fade 전환으로 대체했다.

2. 상품/카테고리/스크립트 중복 축소
   - 상품 추가 페이지는 기존 `EditProductForm`에 빈 상품 draft를 넘겨 재사용한다.
   - `categoryUtils`를 기본 카테고리 id/name 기준점으로 정리하고 Provider/Header/fallback에서 재사용한다.
   - WebP 마이그레이션 공통 Storage URL 파싱/변환/로그 함수를 `scripts/webp-migration-utils.js`로 분리했다.

3. 삭제/의존성 변경
   - 삭제된 주요 파일: `src/mocks/{coupon,order,products,review,user}.ts`, `src/shared/{components/CachedImage.tsx,hooks/useImageCache.ts}`, `src/app/admin/_components/{AddModal,EditModal}.*`, `src/app/admin/dashboard/dashboard/*`.
   - `package.json`/lockfile에서 `swiper` 제거.

### 검증
- `npm run typecheck`: 통과. 첫 실행은 삭제된 route의 `.next/types` 캐시 때문에 실패했고, `.next/types`만 삭제 후 재실행 통과.
- `npm run lint -- --max-warnings=0`: 통과.
- `npm test`: 통과.
- `npm run functions:build`: 통과.
- `npm run build`: 통과.

### 남은 작업
1. 실제 브라우저에서 상품 추가/수정 폼의 이미지 업로드 경로와 관리자 UX를 한번 더 확인하면 좋다.
