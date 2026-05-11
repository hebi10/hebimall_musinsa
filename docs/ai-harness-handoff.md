### commit message
- `fix: avoid homepage firestore index dependency`

### 인수인계 (최대 3개)
1. Firebase 이미지 WebP 최적화
   - 상품, 카테고리, 이벤트 이미지 업로드 전 WebP quality 75 변환 흐름과 마이그레이션 스크립트가 있음.
   - 대상 스크립트: `product-image-webp-migration.js`, `content-image-webp-migration.js`.

2. 홈 Firebase 오류 대응
   - Firestore가 요구한 `__name__` 포함 상품 인덱스로 `firestore.indexes.json`을 보정.
   - 홈 상품 섹션은 `getHomePageProducts()`에서 최상위 `products`를 1회 읽고 클라이언트 정렬해 인덱스 생성 대기 중에도 깨지지 않게 조정.

3. 카테고리 순서 권한
   - 로컬 `firestore.rules`에는 `categoryOrder/{configId}` 공개 읽기가 있음.
   - 배포 전 권한 오류는 기본 순서로 fallback하고, 콘솔 red error를 줄이기 위해 warning 로그로 낮춤.

### 검증
- `npm test -- scripts/product-image-webp-migration.test.js --runInBand`: 통과.
- `npm test -- scripts/content-image-webp-migration.test.js --runInBand`: 통과.
- `npm test -- src/shared/libs/firebase/imageOptimization.test.ts --runInBand`: 통과.
- `npm run typecheck`: 통과.
- `firestore.indexes.json` JSON 파싱: 통과.
- `git diff --check`: 통과. 개발 서버 실행은 `spawn EPERM`으로 실패.

### 남은 작업 (최대 3개)
1. `firebase deploy --only firestore:rules,firestore:indexes` 실행.
2. 인덱스 생성 완료 후 상품 목록/검색의 복합 조건 조회까지 재확인.
3. 로컬 IDE/터미널에서 메인 반응형 화면 확인.
