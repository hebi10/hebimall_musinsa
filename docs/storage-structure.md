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
  tops/{productId}/{timestamp}_{index}.jpg
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

- 파일명 규칙: `{timestamp}_{index}.{extension}`
- 업로드 전 파일 형식(이미지만) 및 크기(5MB 이하) 검증
- 파일별 진행률 콜백 지원

## Storage Rules

- 읽기: 모든 사용자 허용 (상품 이미지 공개)
- 쓰기: 이미지 파일만, 5MB 이하 (관리자 인증 추가 예정)

## 주의사항

- 이미지 업로드 전 카테고리 선택 필수
- JPG, PNG, GIF, WebP만 허용
- 한 번 생성된 경로는 변경하지 않는 것을 권장
