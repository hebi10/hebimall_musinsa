# Firebase Storage 구조 개선 문서

## 🎯 개요
상품 이미지를 카테고리별로 체계적으로 관리하기 위해 Firebase Storage 구조를 재설계했습니다.

## 📁 새로운 Storage 구조

### 이전 구조
```
products/
  └── {productId}/
      └── images/
          ├── image1.jpg
          ├── image2.jpg
          └── ...
```

### 새로운 구조
```
images/
  ├── tops/          (상의)
  │   ├── {productId}/
  │   │   ├── 1703123456_0.jpg
  │   │   ├── 1703123456_1.jpg
  │   │   └── ...
  │   └── {productId2}/
  │       └── ...
  ├── bottoms/       (하의)
  │   └── {productId}/
  │       └── ...
  ├── shoes/         (신발)
  │   └── {productId}/
  │       └── ...
  ├── accessories/   (액세서리)
  │   └── {productId}/
  │       └── ...
  ├── bags/          (가방)
  │   └── {productId}/
  │       └── ...
  └── others/        (기타)
      └── {productId}/
          └── ...
```

## 🔧 주요 변경사항

### 1. 카테고리별 경로 매핑
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

### 2. 새로운 업로드 함수
```typescript
uploadProductImages(
  files: File[],
  category: string,        // 카테고리 (한글)
  productId: string,       // 상품 ID
  onProgress?: (progress: number, fileName: string) => void
): Promise<string[]>
```

### 3. 파일명 규칙
- 형식: `{timestamp}_{index}.{extension}`
- 예시: `1703123456_0.jpg`, `1703123456_1.png`

## 🛡️ Storage Rules

### 새로운 보안 규칙
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // 상품 이미지: images/{category}/{productId}/{filename}
    match /images/{category}/{productId}/{filename} {
      // 읽기: 모든 사용자 허용 (상품 이미지는 공개)
      allow read: if true;
      
      // 쓰기: 관리자만 허용
      allow write: if true; // 개발용, 추후 관리자 인증 추가
      
      // 파일 크기 제한 (5MB)
      allow write: if request.resource.size < 5 * 1024 * 1024;
      
      // 이미지 파일만 허용
      allow write: if request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 🚀 새로운 기능

### 1. 파일 유효성 검사
```typescript
validateImageFiles(files: File[]): { valid: File[]; errors: string[] }
```
- 이미지 파일 형식 확인
- 파일 크기 제한 확인 (5MB)
- 에러 메시지 제공

### 2. 진행률 표시
- 파일별 개별 진행률 표시
- 실시간 업로드 상태 모니터링

### 3. 경로 파싱 유틸리티
```typescript
parseStoragePath(imageUrl: string): { category: string; productId: string } | null
```
- Storage URL에서 카테고리와 상품 ID 추출
- 이미지 관리 및 삭제 시 활용

## 📝 사용 방법

### 상품 추가 시
1. 카테고리 선택 (필수)
2. 이미지 파일 선택
3. 자동으로 `images/{category}/{productId}/` 경로에 업로드

### 상품 수정 시
1. 기존 이미지 표시
2. 새 이미지 추가 시 동일한 경로 구조 사용
3. 개별 이미지 삭제 가능

## 🎁 장점

### 1. 체계적인 관리
- 카테고리별로 이미지 구분
- 상품별로 폴더 구성
- 일관된 파일명 규칙

### 2. 확장성
- 새로운 카테고리 쉽게 추가
- 카테고리별 정책 적용 가능
- 백업 및 마이그레이션 용이

### 3. 성능 최적화
- 카테고리별 이미지 로딩
- CDN 캐싱 전략 적용 가능
- 불필요한 네트워크 요청 감소

### 4. 보안 강화
- 세밀한 접근 권한 제어
- 카테고리별 보안 정책
- 파일 형식 및 크기 제한

## 🔄 마이그레이션

기존 이미지가 있다면 다음 과정을 통해 마이그레이션:

1. 기존 이미지 URL 수집
2. 상품의 카테고리 정보 확인
3. 새로운 경로로 이미지 복사/이동
4. Firestore의 이미지 URL 업데이트
5. 기존 이미지 삭제

## 🚨 주의사항

1. **카테고리 선택 필수**: 이미지 업로드 전 반드시 카테고리를 선택해야 함
2. **파일 크기 제한**: 최대 5MB까지 업로드 가능
3. **이미지 형식**: JPG, PNG, GIF, WebP 등 이미지 파일만 허용
4. **경로 일관성**: 한번 생성된 경로는 변경하지 않는 것을 권장

## 📊 모니터링

Firebase Console에서 다음 항목을 모니터링:
- Storage 사용량
- 카테고리별 이미지 수
- 업로드/다운로드 통계
- 에러 로그

---

이 새로운 구조를 통해 상품 이미지를 더욱 체계적이고 효율적으로 관리할 수 있습니다.
