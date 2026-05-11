### 상품 조회 구조 개선 : 6순위

## 완료 범위
- 상품 목록/검색에서 전체 상품을 선로딩하지 않고 `ProductService.queryProducts()` 기반으로 필터·정렬·커서 페이징 적용.
- `ProductList` 및 `SearchClient`에 페이지 상태/커서 캐시를 도입해 페이지 이동 시 재조회 비용 최소화.
- `main/sale`, `recommend`에서 `getAllProducts()` 의존 제거.
- 카테고리 상위 목록은 `categories` 컬렉션 조회만 사용하도록 정리 (`categories/{id}/products` 읽기 의존 제거).

## 변경 파일
- `src/shared/services/productService.ts`
- `src/app/products/_components/ProductList.tsx`
- `src/app/search/SearchClient.tsx`
- `src/app/main/sale/page.tsx`
- `src/app/recommend/page.tsx`
- `src/context/categoryProvider.tsx`

## 핵심 결과
- 서버쿼리에서 `category/status/price/range/sort`를 우선 반영하고, 필요한 경우 클라이언트에서 `keyword`를 추가 필터링.
- `startAfter` 커서 기반 페이지네이션 도입으로 `page` 이동 시 전체 적재 없이 필요한 구간만 조회.
- 대규모 데이터 환경에서 목록/검색/세일/추천 페이지의 Firestore read 패턴이 줄어들도록 구조 전환.

## 완료 기준(6순위)
- 전체 상품 무조건 로드 제거: 확인 (`ProductList`, `SearchClient`, `sale`, `recommend`에서 제거됨).
- `legacy categories/{id}/products` 의존도 감소: `categoryProvider`에서 제거, 나머지 경로는 단계적 정리 대상.
- 필터·검색 시 read 비용 감소: 서버 쿼리 범위를 최대화, 커서 기반 조회로 페이지 이동 시 추가 전체 조회 제거.

## 확인 메모
- `ProductService.queryProducts`는 키워드 필터를 Firestore 인덱스 미지원 필드에서 보완적으로 처리하므로, 향후 검색 인덱스 강화 또는 컬렉션 설계 개선이 필요.
- 2026-05-11: `reviewCount` 정렬 사용에 맞춰 `ProductSort.field` 타입을 확장하고, 검색 결과 카드는 실제 props 기반 카드(`src/app/products/_components/ProductCard`)를 사용하도록 정리.
