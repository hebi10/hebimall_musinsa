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

## 검증
- `rg --files src/app/api` 결과 경로 확인:
  - 남은 API: `src/app/api/chat/route.ts`
  - `/api/debug/firebase` 라우트 파일 삭제 확인
- API 캐시 정책은 `middleware.ts`의 `matcher: ['/api/(.*)']`를 통해 API 응답 헤더에서 전역 적용.
- 민감 API 기본 헤더:
  - `Cache-Control: no-store, max-age=0`
  - `Pragma: no-cache`
  - `Expires: 0`

## 남은 작업
- 사용자 대상 공개 API 목록 확정 시 `API_PUBLIC_CACHE_RULES`에 개별 엔드포인트 등록 및 revalidate 값 조정.
