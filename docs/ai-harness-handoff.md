### commit message
- 없음: 사용자가 커밋을 요청하지 않음.

### 인수인계
1. 보안/신뢰 경계 보강
   - 쿠폰 `issue`는 코드 없는 직접 발급 쿠폰만 허용하고, 코드 쿠폰은 `register`로만 등록되게 했다.
   - Next/Functions 상담 API에 메시지 길이 제한, history 개수 제한, `user`/`assistant` role 필터를 적용했다.
   - 이벤트 상세 HTML은 allowlist sanitizer를 거쳐 렌더링한다.

2. 구매/회원 흐름 및 운영 흔적 정리
   - 로그인 redirect query, checkout draft 복구 UI, `/orders/cart` 링크 흐름을 보정했다.
   - 배송조회 mock/test 안내, 영문 editorial 문구, 준비중 이미지 문구, 가짜 공지 표현을 쇼핑몰 운영 문맥으로 교체했다.
   - 관리자 사용자 쿠폰의 가짜 지급 성공/최근 지급 이력을 제거하고, 관리자 리뷰는 Firestore 조회 기반 상태로 전환했다.

3. ESLint warning 0개 정리
   - `functions/src/**`, `src/shared/**`, `src/context/**`, `src/app/**` 전반의 warning을 제거했다.
   - 주요 처리: `any` 구체화, unused 제거, Hook 의존성 보정, `next/image`/`Link` 전환, unescaped entity 정리.
   - warning 제거 후 생긴 `unknown` 타입 오류는 실제 폼/API 타입과 값 좁히기 헬퍼로 보정했다.

### 보존한 의도
- 포트폴리오/개인 연락처 안내 문구는 면접관이 포트폴리오임을 구분해야 하므로 제거하지 않고 유지했다.

### 검증
- `npm run lint -- --max-warnings=0`: 통과.
- `npm run typecheck`: 통과.
- `npm test`: 통과, 35 suites / 115 tests.
- `npm run functions:build`: 통과.

### 제한/남은 작업
1. 로컬 Next dev/build는 이 환경에서 `spawn EPERM`으로 실행되지 않아 실제 화면 재캡처는 완료하지 못했다.
2. Chrome 캡처는 `artifacts/screenshots/chrome-localhost-3000-error.png`에 dev 서버 실패 상태만 남아 있다.
