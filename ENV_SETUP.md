# 환경변수 설정 안내

## .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수를 설정하세요.

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI ChatGPT API (1:1 채팅 상담용)
OPENAI_API_KEY=your_openai_api_key
```

## OpenAI API 키 발급 방법

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 계정 생성 또는 로그인
3. API 섹션에서 새 API 키 생성
4. 생성된 키를 `OPENAI_API_KEY` 환경변수에 설정

## 채팅 기능 동작 방식

### API 키가 있는 경우
- `/api/chat` 엔드포인트에서 OpenAI GPT API 호출
- 실시간으로 AI가 고객 문의에 응답
- 대화 히스토리를 유지하여 맥락 있는 대화 제공

### API 키가 없는 경우  
- 기본 키워드 기반 응답 시스템 동작
- 주요 쇼핑몰 문의사항에 대한 미리 정의된 답변 제공
- 여전히 유용한 고객 지원 기능 제공

## 보안 주의사항

1. `.env.local` 파일은 **절대 Git에 커밋하지 마세요**
2. OpenAI API 키는 서버 환경변수로만 사용 (NEXT_PUBLIC_ 접두사 없음)
3. 프로덕션 환경에서는 별도의 환경변수 관리 시스템 사용 권장

## 추가 설정

### OpenAI API 사용량 제한
```typescript
// src/app/api/chat/route.ts에서 설정
max_tokens: 500,        // 응답 최대 토큰 수
temperature: 0.7,       // 응답 창의성 (0-1)
```

### 대화 히스토리 제한
- 최근 10개 메시지만 GPT API에 전송
- 메모리 사용량 및 API 비용 최적화
