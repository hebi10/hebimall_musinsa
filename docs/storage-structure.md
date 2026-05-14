# Firebase Storage 구조

## 디렉토리 구조

상품 이미지를 카테고리별로 분리 저장합니다.

### 이전
```
products/{productId}/images/image1.jpg
```

### 이후
```
images/
  tops/{productId}/{timestamp}_{index}_q75.webp
  bottoms/{productId}/...
  shoes/{productId}/...
  accessories/{productId}/...
  bags/{productId}/...
  others/{productId}/...
```

## 카테고리 매핑

```typescript
const categoryMap = {
  '상의': 'tops',
  '하의': 'bottoms',
  '신발': 'shoes',
  '액세서리': 'accessories',
  '가방': 'bags',
  '기타': 'others'
};
```

## 업로드 함수

```typescript
uploadProductImages(
  files: File[],
  category: string,
  productId: string,
  onProgress?: (progress: number, fileName: string) => void
): Promise<string[]>
```

- 파일명 규칙: `{timestamp}_{index}_q75.webp`
- 업로드 전 브라우저에서 WebP 변환, quality 75(`0.75`) 적용
- Storage content type은 `image/webp`로 저장
- 업로드 전 파일 형식(이미지만) 및 크기(5MB 이하) 검증
- 파일별 진행률 콜백 지원

## 기존 상품 이미지 WebP 마이그레이션

대상은 `products.images`, `products.mainImage`에 연결된 Firebase Storage 상품 이미지 URL만 포함합니다.

```bash
npm run migrate:product-images:analyze
npm run migrate:product-images:dry-run
npm run migrate:product-images:execute
npm run migrate:product-images:validate
npm run migrate:product-images:delete-originals
```

- `dry-run`은 Firestore/Storage를 수정하지 않고 변환 대상과 새 경로를 로그로 남깁니다.
- `execute`는 원본을 내려받아 `{기존파일명}_q75.webp`로 새 파일을 업로드한 뒤 상품 문서 URL을 새 URL로 교체합니다.
- `delete-originals`는 최근 실행 로그를 기준으로 상품 문서가 더 이상 원본 URL을 참조하지 않는 파일만 삭제합니다.
- 실행 로그는 `migration-logs/product-image-webp-*.json`, 삭제 로그는 `migration-logs/product-image-webp-delete-originals-*.json`에 생성되며 Git에는 포함하지 않습니다.

## 상품 외 이미지 WebP 마이그레이션

대상은 상품 외 운영 이미지입니다.

- `categories.image`, `categories.imageUrl`
- `events.bannerImage`, `events.thumbnailImage`
- `reviews.images`
- `qna.images`

```bash
npm run migrate:content-images:analyze
npm run migrate:content-images:dry-run
npm run migrate:content-images:execute
npm run migrate:content-images:validate
npm run migrate:content-images:delete-originals
```

- 카테고리/이벤트 신규 업로드도 WebP q75로 변환 후 저장합니다.
- 실행 로그는 `migration-logs/content-image-webp-*.json`, 삭제 로그는 `migration-logs/content-image-webp-delete-originals-*.json`에 생성되며 Git에는 포함하지 않습니다.

## Storage Rules

- 읽기: 상품/카테고리/이벤트 이미지는 모든 사용자 허용
- 쓰기: 관리자 custom claim(`admin == true` 또는 `role == "admin"`) 사용자만 이미지 파일, 5MB 이하

## 주의사항

- 이미지 업로드 전 카테고리 선택 필수
- JPG, PNG, GIF, WebP를 입력으로 허용하되 최종 저장 파일은 WebP
- 한 번 생성된 경로는 변경하지 않는 것을 권장

## 2026-05-12 상품 상세 이미지 검토 메모

- 현재 상품 이미지는 `products.images[]`와 `products.mainImage`로 관리되며, 관리자 업로드는 WebP q75로 변환해 Storage에 저장한다.
- 목록 카드는 1:1, 상품 상세 상단 이미지는 4:5 비율 컨테이너에서 `object-fit: cover`로 보이므로 8:16 원본은 현재 화면에서 크게 잘릴 수 있다.
- 긴 세로형 상세 이미지를 상품 상세 본문에 한 장씩 노출하려면 `detailImages` 같은 별도 필드와 상세 탭 렌더링을 추가하는 방식이 적합하다.
- 샘플 상품 `products/ZEMIfgpl9ZLAG8lgkMub`는 상세 본문에서 `detailImages[]`를 읽어 세로형 WebP를 렌더링하도록 클라이언트가 준비됐다.
- 상세 이미지도 기존 상품 이미지와 같은 카테고리 경로를 사용하되 파일명에 `detail` 용도를 포함한다. 예: `images/accessories/{productId}/{timestamp}_detail_0_q75.webp`.
- 2026-05-12 현재 작업 환경은 Google OAuth/Firestore/Storage 요청이 프록시 `127.0.0.1:9 ECONNREFUSED`로 차단되어 실제 업로드와 Firestore 문서 갱신은 네트워크 가능한 환경에서 재실행해야 한다.
