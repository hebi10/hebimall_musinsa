# API 캐시 정책 및 디버그 라우트 정리

## 변경 범위
- `middleware.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/debug/firebase/route.ts` 제거

## 작업 요약
- `/api/*`는 기본적으로 사용자별 응답/민감 응답 캐시가 섞이지 않도록 `no-store` 정책을 기본 적용하도록 변경.
- 공개 캐시가 필요한 API는 `middleware.ts`의 `API_PUBLIC_CACHE_RULES`에 명시적으로 추가할 수 있도록 템플릿 정리.
- `/api/debug/firebase` 라우트를 제거해 운영 노출 가능한 데이터 덤프 경로를 삭제.
- `/api/chat` 응답에 대해 라우트 레벨에서도 `no-store` 헤더를 명시해서 캐시 안전성 보강.
- 2026-05-12: 실시간 상담 목적 선택에 `상품 문의`를 추가하고 Next/API Functions 공통 응답 파일을 함께 갱신했다.
- 2026-05-12: 실시간 상담의 상담 연결 intent를 버튼/자연어 중심으로 정리하고, 과거 붙임 명령어는 내부 호환만 처리하도록 Next/API Functions 공통 응답 파일을 함께 갱신했다.
- 2026-05-12: `/api/order`는 주문 생성 외 관리자 주문 상태 변경 액션을 처리하며, `/api/coupon`은 관리자 쿠폰 마스터 생성/수정/보관 액션을 처리한다. 두 API 모두 인증 토큰 기반 민감 응답이라 `no-store` 대상이다.
- 2026-05-14: `/api/chat`은 `CHAT_API_URL` 또는 `NEXT_PUBLIC_CHAT_API_URL`이 절대 URL이면 upstream 상담 API로 no-store 프록시한 뒤 실패 시 기존 메뉴/fallback 응답으로 돌아간다.
- 2026-05-14: 실시간 상담 위젯은 브라우저 CORS 차단을 피하도록 항상 same-origin `/api/chat`만 호출한다. `/api/chat`은 upstream이 없으면 서버 환경변수 `OPENAI_API_KEY`로 OpenAI Chat Completions를 직접 호출한다. `OPENAI_CHAT_MODEL`이 없으면 `gpt-4o-mini`를 사용한다.
- 2026-05-14: `NEXT_PUBLIC_CHAT_API_URL`은 클라이언트 직접 호출용이 아니라 Next `/api/chat`의 서버 측 upstream 프록시 후보로만 사용한다.
- 2026-05-14: Firebase Hosting의 `/api/chat` rewrite가 사용하는 Functions `chat`도 기본 모델을 `gpt-4o-mini`로 맞추고, OpenAI 호출 실패 시 문의 내용 기반 fallback 응답을 반환하도록 보정했다.

## 검증
- `rg --files src/app/api` 결과 경로 확인:
  - 남은 API: `src/app/api/chat/route.ts`
  - `/api/debug/firebase` 라우트 파일 삭제 확인
- API 캐시 정책은 `middleware.ts`의 `matcher: ['/api/(.*)']`를 통해 API 응답 헤더에서 전역 적용.
- 민감 API 기본 헤더:
  - `Cache-Control: no-store, max-age=0`
  - `Pragma: no-cache`
  - `Expires: 0`
- 2026-05-14 검증:
  - `npm test -- --runTestsByPath src/app/_components/chat/ChatWidget.test.tsx --runInBand`: 통과.
  - `npm test -- --runTestsByPath src/app/api/chat/route.test.ts --runInBand`: 통과.
  - `npm run typecheck`: 통과.
  - `npm run functions:build`: 통과.
- 2026-05-14 추가 검증:
  - `npm test -- --runTestsByPath src/app/_components/chat/ChatWidget.test.tsx --runInBand`: 통과.
  - `npm test -- --runTestsByPath src/app/api/chat/route.test.ts --runInBand`: 통과.
  - `npm run typecheck`: 통과.
  - `npm run lint`: 통과, 기존 warning 254개 잔존.
- 2026-05-14 상담 경로 복구 검증:
  - `npm test -- --runTestsByPath src/app/_components/chat/ChatWidget.test.tsx src/app/api/chat/route.test.ts --runInBand`: 통과.
  - `npm run typecheck`: 통과.
  - `npm run functions:build`: 통과.

## 남은 작업
- 사용자 대상 공개 API 목록 확정 시 `API_PUBLIC_CACHE_RULES`에 개별 엔드포인트 등록 및 revalidate 값 조정.
