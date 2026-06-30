### commit message
- 메인 이벤트 히어로 배너 반응형 보정

### 인수인계
1. 메인 상단 이벤트 배너
   - `MainBanner`를 3개 이벤트 슬라이드로 구현했다.
   - 1920px stage 안에서는 이미지가 채워지고, 초과 폭 좌우는 슬라이드별 배경색으로 노출된다.
   - 태블릿은 제목 크기와 화살표 위치를 낮추고, 모바일은 화살표를 숨겨 도트 중심으로 조작한다.

2. 이미지 자산
   - 생성 이미지는 텍스트 없이 모델과 배경만 포함한다.
   - `public/main/main_event_midyear_sale.webp`, `main_event_vacation_coupon.webp`, `main_event_cool_touch.webp`를 1920x720 WebP로 추가했다.

3. 문서/테스트
   - `docs/main-banner.md`, `docs/event-page-review.md`를 갱신했다.
   - `MainBanner.test.tsx`는 이벤트 슬라이드, 이미지, 링크를 검증한다.

### 검증
- `npm test -- src/app/_components/MainBanner.test.tsx`: 통과.
- `npm run typecheck`: 통과.
- `npm run lint -- --max-warnings=0`: 통과.
- Playwright: 820px 태블릿, 390px 모바일 캡처 확인. 모바일 화살표 숨김, 도트 대비 보정.

### 남은 작업
1. 운영 이벤트 변경 시 `MainBanner.tsx`의 슬라이드 데이터와 `public/main/main_event_*.webp`만 교체하면 된다.
