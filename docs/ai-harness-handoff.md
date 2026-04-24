### commit message
- `style: 이벤트 페이지 톤을 메인 페이지처럼 단정하게 정리`

### 작업 요약
- `src/app/events/page.tsx`와 `src/app/events/page.module.css`에 메인 페이지식의 짧은 소개 블록을 추가하고, 이벤트 페이지 배경과 여백을 메인 톤에 맞게 차분하게 조정했다.
- `src/app/events/_components/EventList.module.css`에서 대표 배너를 밝은 카드형 레이아웃으로 바꾸고 통계·필터·이벤트 카드의 라운드, 그림자, 보더, 타이포를 메인 페이지와 비슷한 단정한 톤으로 다시 맞췄다.
- `docs/event-page-review.md`, `docs/ai-harness-handoff.md`를 갱신했고 `npx tsc --noEmit --pretty false` 타입 검사를 통과했다.

### 남은 작업
- 실제 브라우저에서 대표 배너의 스플릿 레이아웃과 메인 페이지 대비 톤 차이가 모바일까지 자연스러운지 확인이 필요하다.
- 세일형·리뷰형·신상형 CTA 클릭 뒤 참여 처리와 후속 이동이 자연스럽게 이어지고, 쿠폰형은 상단/하단 역할이 겹치지 않는지 확인이 필요하다.
- 로그인 후 원래 이벤트 상세로 복귀하는 리다이렉트는 아직 없다.
- `next lint`는 ESLint 설정 파일이 없어 초기 설정 프롬프트가 떠서 이번 작업에서도 실행하지 못했다.
