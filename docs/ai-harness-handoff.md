### commit message
- 메인 이벤트 히어로 배너 위치 보정

### 인수인계
1. 메인 상단 이벤트 배너
   - `MainBanner`를 3개 이벤트 슬라이드로 구현했다.
   - 1920px stage 안에서는 이미지가 채워지고, 초과 폭 좌우는 슬라이드별 배경색으로 노출된다.
   - 태블릿은 제목 크기와 화살표 위치를 낮추고, 모바일은 화살표를 숨겨 도트 중심으로 조작한다.
   - 3번째 쿨터치 배너는 데스크톱 기본 `object-position: 25% top`을 유지하고 이미지 자체의 모델 위치를 맞췄다.
   - 수동 넘김 시 자동 전환 타이머가 4.5초로 초기화된다.

2. 이미지 자산
   - 생성 이미지는 텍스트 없이 모델과 배경만 포함한다.
   - `public/main/main_event_midyear_sale.webp`, `main_event_vacation_coupon.webp`, `main_event_cool_touch.webp`를 1920x720 WebP로 추가했다.
   - 모바일은 중앙 모델 구도의 `*_mobile.webp` 768x960 이미지를 별도로 사용한다.

3. 문서/테스트
   - `docs/main-banner.md`, `docs/event-page-review.md`를 갱신했다.
   - Firestore 권한 실패/빈 결과는 fallback 이벤트 배너 3개를 렌더링한다.
   - `MainBanner.test.tsx`는 fallback, 3번째 위치값, 수동 전환 타이머 초기화를 검증한다.

### 검증
- `npm test -- src/app/_components/MainBanner.test.tsx`: 통과.
- `npm run typecheck`: 통과.
- `npm run lint -- --max-warnings=0`: 통과.
- Playwright: 820px 태블릿, 390px 모바일 캡처 확인. 모바일 화살표 숨김, 도트 대비 보정.
- Playwright: 3번째 배너를 1280px, 820px, 390px에서 확인. 모델 얼굴/상체 잘림 없음.
- Playwright: 수동 넘김 4.4초 뒤 클릭 후 0.2초 대기해도 클릭한 배너 유지 확인.

### 남은 작업
1. 운영 이벤트 변경 시 `MainBanner.tsx`의 슬라이드 데이터와 `public/main/main_event_*.webp`만 교체하면 된다.
