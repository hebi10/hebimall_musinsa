# 메인 상단 배너 작업 영역

## 현재 상태
- 메인 화면 상단 배너는 `src/app/_components/MainBanner.tsx`에서 렌더링한다.
- 2026 이벤트 3개를 연결한 에디토리얼 슬라이드 배너로 구성한다.
- 이미지는 `public/main/main_event_*.webp`에 있으며, 이미지 자체에는 텍스트를 넣지 않는다.
- 1920px까지는 배너 이미지 stage가 꽉 차고, 그 이상 넓이에서는 슬라이드별 배경색이 좌우 여백에 노출된다.
- 태블릿에서는 제목/버튼 크기를 줄이고 좌우 화살표를 하단으로 내려 카피와 겹치지 않게 한다.
- 모바일에서는 좌우 화살표를 숨기고 도트만 노출하며, 하단 그라데이션 위에 카피를 배치한다.
- 3번째 쿨터치 배너는 기본 `object-position`은 유지하고, 이미지 자체의 모델 위치를 1,2번째 배너 구도에 맞춘다.
- Firestore 배너 조회 실패나 빈 결과에서는 같은 3개 이벤트 배너를 fallback으로 렌더링한다.
- 좌우 버튼이나 도트를 누르면 자동 전환 타이머가 다시 4.5초부터 시작된다.

## 작업 파일
- `src/app/_components/MainBanner.tsx`
- `src/app/_components/MainBanner.module.css`
- `src/app/_components/MainBanner.test.tsx`
- `public/main/main_event_midyear_sale.webp`
- `public/main/main_event_midyear_sale_mobile.webp`
- `public/main/main_event_vacation_coupon.webp`
- `public/main/main_event_vacation_coupon_mobile.webp`
- `public/main/main_event_cool_touch.webp`
- `public/main/main_event_cool_touch_mobile.webp`

## 연결 이벤트
- `/events/event-2026-06-midyear-sale`
- `/events/event-2026-07-vacation-coupon`
- `/events/event-2026-07-cool-touch`

## 검증
- `src/app/_components/MainBanner.test.tsx`에서 이벤트 슬라이드, 이미지, 링크를 확인한다.
- Playwright로 2200px 화면에서 stage `1920px`, 좌우 배경색 노출, 390px 모바일 수평 오버플로우 없음을 확인했다.
- Playwright로 820px 태블릿과 390px 모바일 캡처를 확인해 텍스트/버튼/컨트롤 겹침을 보정했다.
- Playwright로 3번째 쿨터치 배너를 1280px, 820px, 390px에서 확인해 모델 얼굴/상체가 잘리지 않고 1,2번째 배너와 유사한 우측 중심 구도로 보이게 조정했다.
- Playwright로 수동 넘김 4.4초 뒤 클릭 후 0.2초 대기해도 다음 슬라이드로 밀리지 않는 것을 확인했다.
