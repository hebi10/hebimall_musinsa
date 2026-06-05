### commit message
- 없음: 사용자가 커밋을 요청하지 않았다.

### 인수인계 (최대 3개)
1. 이벤트 20개/이미지 자산
   - `src/mocks/eventCatalog2026.json`에 2026년 1월~8월 월별 2~3개씩 총 20개 이벤트를 추가했다.
   - 이미지 생성 기능으로 전신 모델컷 source 20개를 만들고 `public/events/2026/*-source.png`에 복사했다.
   - `scripts/generate-event-assets.js`가 source에서 `*-banner.webp`, `*-thumb.webp` 40개를 생성한다.

2. 데이터 연결/seed
   - `src/mocks/event.ts`는 이벤트 카탈로그를 읽어 Date 객체로 변환한다.
   - `scripts/seed-events.js`도 같은 카탈로그를 사용하며 기존 이벤트 삭제 없이 동일 ID만 upsert하고 `detailImage`를 함께 넣는다.
   - 사용자 `/events` 목록/상세는 Firestore에 없는 2026 카탈로그 이벤트를 로컬 fallback으로 병합/조회한다.

3. 이미지/디자인 보정
   - 목록/상세 배너는 `object-position: right center`로 보정했다.
   - 문구 합성 `*-banner.webp`, 카드용 `*-thumb.webp`, 오버레이/상세용 텍스트 없는 `*-detail.webp`로 역할을 분리했다.
   - 목록 대표 히어로는 UI 제목과 이미지 내 문구가 겹치지 않도록 `detailImage`를 우선 사용한다.
   - 카드 썸네일은 텍스트 합성을 제거하고, 메인/이벤트 영문 장식 문구는 한국어 정보형 문구로 바꿨다.
   - 이벤트 목록/상세 주요 텍스트에는 긴 쿠폰 코드·영문명 대비 줄바꿈 방어를 추가했다.
   - 모바일 이벤트 목록은 카드 높이/오버레이를 낮추고 상담 플로팅 버튼을 숨겨 CTA 가림을 제거했다.
   - React Query Devtools와 Next dev indicator는 포트폴리오 확인 화면에 보이지 않도록 설정했다.

### 검증
- `node scripts/generate-event-assets.js` 통과.
- `npm run typecheck` 통과.
- `npm test -- --runTestsByPath src/shared/utils/eventImages.test.ts --runInBand` 통과.
- `npm run lint` 통과: 기존 경고 254개, 에러 0개.
- 자산 검사 통과: source PNG 20개, banner/detail/thumb WebP 60개 존재.
- Chrome 확인: `/events` 페이지네이션 1~4페이지에서 신규 링크 20개 노출, 20개 상세 URL 모두 404/이미지 깨짐/가로 오버플로우 없음.
- Chrome 확인: `/events/` 첫 화면 대표 영역은 `*-detail.webp`를 사용하고 `*-banner.webp`를 쓰지 않는다.
- Firebase 확인: 현재 `events` 문서 2개에는 `detailImage`가 없고 `bannerImage`/`thumbnailImage`만 있다. 상세는 로컬 2026 카탈로그 기준 `detailImage` fallback으로 분리했다.
- AI 느낌 보정 후 `npm run typecheck`, `npm test -- --runTestsByPath src/app/_components/chat/ChatWidget.test.tsx --runInBand`, `git diff --check` 통과.
- Browser 캡처 확인: `/events` 390px 모바일에서 상담/개발 도구 버튼 미노출, 수평 오버플로우 없음.

### 남은 작업 (최대 3개)
1. Firestore 반영은 인증 설정 후 `node scripts/seed-events.js`로 실행한다.
2. DB 반영 후 사용자 페이지의 로컬 fallback 병합을 유지할지 제거할지 운영 정책을 정한다.
3. 운영 이미지 업로드 시 텍스트 합성 배너와 별도로 `detailImage`를 넣는 정책을 유지한다.
