### commit message
- 없음: 사용자가 커밋을 요청하지 않았다.

### 인수인계 (최대 3개)
1. 구매 흐름 서버/클라이언트 보정
   - 로컬 Next `/api/order/` 프록시를 추가하고 `OrderService` 호출 경로를 trailing slash 기준으로 맞췄다.
   - Functions 주문 생성 트랜잭션의 장바구니 읽기를 모든 쓰기 전에 수행하도록 순서를 바꿨다.
   - 배포된 Function은 아직 이전 코드라 Chrome 실제 주문 완료는 함수 배포 전까지 같은 트랜잭션 오류가 날 수 있다.

2. 가격/장바구니/checkout 보정
   - `getProductPricing`으로 `originalPrice > price` 상품을 재할인하지 않게 통합했다.
   - 장바구니 조회 시 기존 잘못된 단가/할인 합계를 상품 문서 기준으로 보정해 저장한다.
   - 장바구니/checkout 인증 가드는 auth 로딩 종료 후 리다이렉트하고, checkout 표시 라벨은 한국어로 정리했다.

3. 마이페이지 활동 조회 보정
   - 최근 본 상품/찜한 상품 조회는 복합 인덱스 부재 시 단일 조건 조회와 클라이언트 정렬로 fallback한다.
   - `firestore.indexes.json`에 최근 본 상품/찜한 상품 복합 인덱스를 추가했다.
   - Chrome 확인에서 마이페이지 최근 본 상품/찜 목록의 인덱스 콘솔 오류가 사라졌다.

### 검증
- `npm run typecheck` 통과.
- `npm test -- --runTestsByPath src/app/api/order/route.test.ts src/shared/utils/productPricing.test.ts src/app/products/_components/ProductDetailClient.test.tsx src/app/categories/[category]/products/[productId]/page.test.tsx --runInBand` 통과.
- `npm run test:functions -- --runTestsByPath functions/__tests__/orderDomain.test.ts functions/__tests__/couponDomain.test.ts --runInBand` 통과.
- `npm run functions:build` 통과.
- `npm run lint` exit 0 통과: 기존 경고 254개, 에러 0개.
- `git diff --check` 통과: 공백 오류 없음, LF/CRLF 치환 경고만 출력.
- Chrome 확인: 로그인, 찜/최근, 장바구니 금액 보정, checkout 한국어 라벨은 확인. 구매 완료/마이페이지 주문 노출은 함수 배포 후 재확인 필요.

### 남은 작업 (최대 3개)
1. `firebase deploy --only functions:order,firestore:indexes` 또는 운영 배포 절차로 Functions/인덱스를 반영한다.
2. 배포 후 Chrome에서 장바구니 주문 생성, 주문 완료 화면, 마이페이지 주문 목록/상세 노출을 다시 확인한다.
3. 기존 lint warning 254개는 별도 품질 정리 작업으로 줄인다.
