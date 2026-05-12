### commit message
- `fix: harden admin operations flows`

### 인수인계 (최대 3개)
1. 관리자 운영 지표/주문
   - `/admin` 카테고리 차트의 랜덤 값을 제거하고 실제 `categoryBreakdown` 집계로 표시.
   - 주문 상태 변경은 `/api/order` 관리자 `updateStatus` 액션으로 이동하고 상태 전이/이력 기록을 추가.

2. 관리자 쿠폰/내비
   - 쿠폰 마스터 생성/수정/삭제성 작업은 `/api/coupon` 관리자 액션으로 이동.
   - 삭제는 발급 이력 보존을 위해 비활성화/보관 처리로 변경.
   - 관리자 내비에 active 상태와 모바일 메뉴 토글/오버레이 닫기를 추가.

3. 기존 변경 보존
   - 작업 전부터 있던 상담/팝업/채팅/구매 흐름 점검 문맥은 되돌리지 않음.
   - 카테고리/마이그레이션성 관리자 도구의 직접 Firestore 작업은 이번 범위에서 유지.

### 검증
- `npm run typecheck`: 통과.
- `npm --prefix functions run build`: 통과.
- `npm run test -- --runInBand`: 통과, 8 suites / 54 tests.
- `git diff --check`: 통과. 줄바꿈 경고만 출력.

### 남은 작업 (최대 3개)
1. 실제 관리자 계정으로 주문 상태 변경과 쿠폰 생성/수정/비활성화 end-to-end 확인.
2. 카테고리/마이그레이션성 관리자 도구의 직접 Firestore 쓰기 경계 재검토.
3. 네트워크/의존성 문제가 있으면 `npm install` 후 lint/ci 재확인.
