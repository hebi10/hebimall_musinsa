### commit message
- `style: refine mobile storefront layout`

### 인수인계 (최대 3개)
1. 메인 모바일 diff 코멘트 반영
   - 신상품 섹션 `전체보기`는 bordered 헤더 우측에 유지되도록 보정.
   - 베스트셀러 랭킹 카드에만 `badgePlacement="belowRank"`를 넘겨 순위와 할인율 배지 충돌을 분리.
   - 모바일 배너 전용 `hero_editorial_*_mobile.webp` 3장을 추가하고 768px 이하에서 사용.

2. 하단 모바일 정리
   - 서비스 안내는 640px 이하에서 1열 리스트형으로 전환.
   - 푸터 링크는 640px 이하에서 compact 2열 그리드와 작은 간격으로 정리.

3. 기존 작업 보존
   - 작업 전부터 있던 인증/마이페이지/검색/문서 변경은 되돌리지 않음.
   - 이번 작업은 메인 모바일 레이아웃과 관련 문서 갱신에 한정.

### 검증
- `npm run typecheck`: 통과.
- `npm run test -- --runInBand`: 통과, 8 suites / 54 tests.
- `git diff --check`: 통과.
- `npm run lint`: 실패. 로컬 `eslint` 실행 파일 부재.

### 남은 작업 (최대 3개)
1. 네트워크 가능한 터미널에서 `npm install` 후 `npm run lint`, `npm run ci` 재확인.
2. 실제 브라우저에서 390px, 484px, 768px 메인 화면 배너/상품/푸터 확인.
3. 이전 피드백의 Firebase 인덱스/규칙 배포 여부를 콘솔에서 최종 확인.
