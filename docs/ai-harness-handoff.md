### commit message
- `fix: 상담원 연결 후 채팅 입력 활성화`

### 인수인계 (최대 3개)
1. 실시간 상담 UI
   - 하단 `주문내역`, `배송조회`, `1:1 문의`, `상품문의` 이동 CTA를 제거했다.
   - `상담원 연결` 요청 전에는 직접 입력창을 비활성화하고, 연결 후에만 입력/전송 가능하게 했다.
   - `상담원 연결` 요청 후 빠른 선택 버튼을 숨기고, 메시지 영역을 기본 320px/연결 후 460px로 넓혔다.

2. 상담 API 연동
   - `ChatWidget`은 `NEXT_PUBLIC_CHAT_API_URL`이 있으면 해당 URL을 호출하고, 없으면 `/api/chat`을 호출한다.
   - `/api/chat`은 `CHAT_API_URL` 또는 `NEXT_PUBLIC_CHAT_API_URL` 절대 URL이 있으면 upstream 상담 API로 no-store 프록시한다.
   - upstream 실패 시 기존 메뉴/fallback 응답으로 돌아가므로 로컬 키가 없어도 기본 상담은 유지된다.

3. 문서
   - `docs/design-system-refactor.md`와 `docs/api-cache-debug-route.md`에 UI/상담 API 변경 이력을 반영했다.

### 검증
- `npm test -- --runTestsByPath src/app/_components/chat/ChatWidget.test.tsx --runInBand`: 통과.
- `npm test -- --runTestsByPath src/app/api/chat/route.test.ts --runInBand`: 통과.
- `npm run typecheck`: 통과.
- `npm run lint`: 통과, 기존 warning 254개 잔존.
- `npm run functions:build`: 통과.

### 남은 작업 (최대 3개)
1. 로컬 브라우저에서 실시간 상담 팝업을 열고 연결 전 입력 비활성, 연결 후 입력 활성, 확장된 높이를 시각 확인한다.
