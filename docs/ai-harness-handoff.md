### commit message
- 없음: 사용자가 커밋을 요청하지 않았다.

### 인수인계 (최대 3개)
1. 상품 목록/카테고리 복구
   - `ProductService.queryProducts()`에 Firestore 복합 쿼리 실패 시 최상위 `products` 기반 client-side fallback을 추가했다.
   - fallback은 category/status/brand/price/rating/new/sale/keyword/sort를 동일하게 적용하고 `hasMore: false`로 반환한다.
   - `/products` 오류 화면과 `/categories/clothing -> tops`의 인덱스 오류를 빈 카테고리처럼 보이던 문제를 완화했다.

2. 모바일 플로팅/404 보정
   - 모바일 메뉴 오픈 시 Header z-index를 올려 쇼핑 안내/실시간 상담 버튼 위에 메뉴가 뜨게 했다.
   - `/auth/*`에서는 쇼핑 안내/실시간 상담 플로팅 UI를 숨기고, 480px 이하에서는 쇼핑 안내 고정 버튼을 숨긴다.
   - App Router용 `src/app/not-found.tsx`를 추가해 기존 커스텀 404 UI가 실제 404에 연결되게 했다.

3. QA 산출물
   - Chrome 실제 탭에서 `/products`, `/categories/clothing`, `/auth/login`, 커스텀 404를 확인했다.
   - Playwright Chrome 채널 스크린샷을 `.gstack/qa-reports/screenshots/verify-*-mobile*.png`에 저장했다.
   - gstack browse는 Windows 설치본에 `server.ts`가 없어 지정 폭 자동 점검에 사용하지 못했다.

### 검증
- `npm test -- --runTestsByPath src/shared/services/productService.test.ts src/app/_components/chat/ChatWidget.test.tsx --runInBand` 통과.
- `npm run typecheck` 통과.
- `npm test -- --runInBand` 통과: 17 suites, 76 tests.
- `npm run lint` 통과: 기존 경고 254개, 에러 0개.
- `git diff --check` 통과.

### 남은 작업 (최대 3개)
1. 실제 배포 Firestore 인덱스가 준비되면 fallback 의존도를 낮추고 서버 쿼리 페이징 정확도를 재점검한다.
2. 개발 모드의 Next/TanStack devtools 플로팅 버튼은 앱 플로팅 UI와 겹칠 수 있으나 production UI 이슈는 아니다.
3. 관리자 로그인 세션이 필요한 `/admin/**` 내부 모바일 실측 QA는 별도 인증 상태에서 추가 확인한다.
