# Firestore AI 요약 Export

## 목적
- 원본 Firestore 데이터를 AI에 직접 공유하지 않고, 컬렉션 구조/문서 수/샘플 필드만 익명화해서 `firestore-ai-summary.json`으로 만든다.
- 기존 `scripts/util-firestore-admin.js` 인증 흐름을 사용하므로 `.env.local`, `scripts/serviceAccountKey.json`, 또는 `gcloud auth application-default login` 중 하나가 필요하다.

## 명령
```bash
npm run firestore:ai-summary
```

옵션:
```bash
node scripts/firestore-ai-summary.js --output=tmp/firestore-ai-summary.json --sample-limit=5 --max-depth=2
```

## 출력 내용
- 루트 컬렉션 목록
- 컬렉션별 문서 수
- 샘플 문서 필드 타입
- 익명화된 샘플 문서
- 샘플 문서에서 발견한 하위 컬렉션 요약

`name`, `phone`, `email`, `address`, `uid`, `userId`, `token`, `password`처럼 개인정보 또는 인증정보로 추정되는 키는 `[REDACTED]`로 대체한다. 문서 ID가 포함된 경로는 `users/[DOC_ID]`처럼 ID 세그먼트를 익명화한다.

## 주의
- `count()`와 샘플 조회를 사용하므로 Firestore 읽기 비용이 발생한다.
- 하위 컬렉션은 전체 문서가 아니라 샘플 문서 기준으로 탐색한다. 누락 없는 전체 구조가 필요하면 `--sample-limit`을 늘려 실행한다.
