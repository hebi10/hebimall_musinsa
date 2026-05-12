### commit message
- `fix: reduce storefront firestore and ui drift`

### 인수인계 (최대 3개)
1. Firebase 이미지 WebP 최적화
   - 상품, 카테고리, 이벤트 이미지 업로드 전 WebP quality 75 변환 흐름과 마이그레이션 스크립트가 있음.
   - 대상 스크립트: `product-image-webp-migration.js`, `content-image-webp-migration.js`.

2. Firebase 조회 리스크 완화
   - 추천 페이지 `평점/리뷰` 탭은 `queryProducts()` 복합 정렬 대신 최상위 상품 1회 읽기 + 클라이언트 정렬로 변경.
   - 브랜드 페이지는 `brandSummaries` 컬렉션 우선 조회, 미구성 시 상품 기반 요약 fallback으로 변경. 규칙에 공개 읽기 추가.

3. UI 시스템 통일
   - 추천 페이지 상품 카드를 공용 `ProductCard`로 교체.
   - 추천 필터 탭을 메인 탭 상품 영역과 같은 사각 탭 계열로 조정.

### 참고
- 카테고리 순서 권한
   - 로컬 `firestore.rules`에는 `categoryOrder/{configId}` 공개 읽기가 있음.
   - 배포 전 권한 오류는 기본 순서로 fallback하고, 콘솔 red error를 줄이기 위해 warning 로그로 낮춤.

### 검증
- `npm test -- scripts/product-image-webp-migration.test.js --runInBand`: 통과.
- `npm test -- scripts/content-image-webp-migration.test.js --runInBand`: 통과.
- `npm test -- src/shared/libs/firebase/imageOptimization.test.ts --runInBand`: 통과.
- `npm run typecheck`: 통과.
- `npm test`: 통과.
- `firestore.indexes.json` JSON 파싱: 통과.
- `git diff --check`: 통과. `next build`는 컴파일 성공 후 환경 `spawn EPERM`으로 중단.

### 남은 작업 (최대 3개)
1. 네트워크 가능한 터미널에서 `npm install` 후 `npm run lint`, `npm run ci` 재확인.
2. `firebase deploy --only firestore:rules,firestore:indexes` 실행.
3. 운영 데이터가 커지면 `brandSummaries` 생성/갱신 자동화 검토.
