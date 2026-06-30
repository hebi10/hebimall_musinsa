# 메인 상단 배너 작업 영역

## 현재 상태
- 메인 화면 상단 배너는 `src/app/_components/MainBanner.tsx`에서 렌더링한다.
- 2026 이벤트 3개를 연결한 에디토리얼 슬라이드 배너로 구성한다.
- 이미지는 `public/main/main_event_*.webp`에 있으며, 이미지 자체에는 텍스트를 넣지 않는다.
- 1920px까지는 배너 이미지 stage가 꽉 차고, 그 이상 넓이에서는 슬라이드별 배경색이 좌우 여백에 노출된다.
- 태블릿에서는 제목/버튼 크기를 줄이고 좌우 화살표를 하단으로 내려 카피와 겹치지 않게 한다.
- 모바일에서는 좌우 화살표를 숨기고 도트만 노출하며, 하단 그라데이션 위에 카피를 배치한다.

## 작업 파일
- `src/app/_components/MainBanner.tsx`
- `src/app/_components/MainBanner.module.css`
- `src/app/_components/MainBanner.test.tsx`
- `public/main/main_event_midyear_sale.webp`
- `public/main/main_event_vacation_coupon.webp`
- `public/main/main_event_cool_touch.webp`

## 연결 이벤트
- `/events/event-2026-06-midyear-sale`
- `/events/event-2026-07-vacation-coupon`
- `/events/event-2026-07-cool-touch`

## 검증
- `src/app/_components/MainBanner.test.tsx`에서 이벤트 슬라이드, 이미지, 링크를 확인한다.
- Playwright로 2200px 화면에서 stage `1920px`, 좌우 배경색 노출, 390px 모바일 수평 오버플로우 없음을 확인했다.
- Playwright로 820px 태블릿과 390px 모바일 캡처를 확인해 텍스트/버튼/컨트롤 겹침을 보정했다.
