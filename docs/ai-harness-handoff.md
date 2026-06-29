### commit message
- 없음: 사용자가 커밋을 요청하지 않음.

### 인수인계
1. 전체 리뷰 결론
   - STYNA는 실운영 쇼핑몰보다 "운영 신뢰까지 설계한 패션 이커머스 포트폴리오"로 포지셔닝하는 것이 강하다.
   - 차별점은 AI 상담보다 서버 주문 생성, 쿠폰/포인트 검증, QnA 비밀글, 관리자 운영 흐름이다.
   - 실결제 미연동, 샘플/실데이터 경계, 배포 Functions 최신성은 평가자가 오해하지 않도록 명시가 필요하다.

2. 개발 리스크
   - `points`, `coupon`, `adminUsers` Function은 Firebase Hosting rewrite로 Next middleware를 우회하므로 Function 자체 no-store 헤더가 필요하다.
   - 회원가입은 `/api/points`에 `action: add`를 호출하지만 서버는 관리자만 허용해 보너스 포인트 지급이 실패할 수 있다.
   - 관리자 포인트 직접 Firestore 쓰기, 쿠폰 발급/등록 트랜잭션 부재, Rules 테스트 부재, 배포 전 CI 강제 부재가 남은 상위 리스크다.

3. 디자인/UX 리스크
   - 오래된 CSS를 하단 override로 덮는 구조, 헤더 active/aria-current 부재, 전역 focus-visible/link 구분 부족이 남아 있다.
   - 모바일 상품 목록에서 상담 플로팅 버튼이 필터 영역을 가리고, 초기 로딩 상태가 첫인상을 과하게 차지한다.

### 보존한 의도
- 상품 수 100개 이하 포트폴리오에서는 전체 스캔 fallback을 무리하게 제거하기보다 안정적인 데모와 명확한 로딩/실패 상태가 우선이다.
- 1000개 이상 운영을 목표로 하면 홈/추천/검색/관리자 목록을 쿼리+커서/검색 인덱스/요약 문서로 분리해야 한다.

### 검증
- `npm run ci`: 통과.
- `npm run build`: 통과, 66개 App Router 페이지 생성.
- Chrome 채널 Playwright CLI로 `artifacts/review-*.png` 화면 캡처 확인. 기본 Playwright 브라우저는 미설치라 `--channel=chrome`을 사용했다.
- gstack browse는 `server.ts` 탐색 실패로 사용하지 못했다.

### 제한/남은 작업
1. 1순위: Function no-store, 회원가입 포인트, 관리자 포인트 서버화, 쿠폰 transaction, Rules 테스트, `verify`/배포 스크립트 순서로 닫는다.
2. 2순위: checkout/complete/푸터/README에 실결제 미연동과 포트폴리오 범위를 작고 명확하게 표시한다.
3. 3순위: 헤더 active, 전역 focus-visible, 모바일 플로팅 버튼 위치, 오래된 CSS override 제거를 페이지 단위로 정리한다.
