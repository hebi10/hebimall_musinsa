# Firebase Functions 환경변수 관리 가이드

## 개요

이 프로젝트는 모든 환경변수를 Firebase Functions의 Secrets를 통해 중앙 관리합니다. 이를 통해 보안성을 높이고 환경변수 관리를 단순화합니다.

## 환경변수 설정 방법

### 1. 환경변수 파일 생성

먼저 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경변수를 설정합니다:

```bash
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Keys
OPENAI_API_KEY=your_openai_key

# API 설정
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 개발 환경 설정
NODE_ENV=development
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

### 2. Firebase Functions Secrets 설정

환경변수를 Firebase Functions Secrets로 설정하는 스크립트를 실행합니다:

```bash
# Firebase CLI 로그인 (최초 1회)
firebase login

# 환경변수 설정 스크립트 실행
node scripts/setup-firebase-secrets.js
```

### 3. Functions 빌드 및 배포

```bash
cd functions
npm run build
firebase deploy --only functions
```

## 환경변수 사용 방법

### 클라이언트 측에서 사용

```typescript
import { getClientConfig, getFirebaseConfig } from '@/shared/services/configService';

// 전체 클라이언트 설정 가져오기
const config = await getClientConfig();
console.log(config.firebase.apiKey);

// Firebase 설정만 가져오기
const firebaseConfig = await getFirebaseConfig();
```

### 서버 측 API에서 사용

```typescript
import { getOpenAIKey } from '@/shared/services/configService';

export async function POST(request: NextRequest) {
  const apiKey = await getOpenAIKey();
  // OpenAI API 사용
}
```

### Firebase Functions에서 사용

```typescript
import { getEnvironmentConfig } from './config/environment';

export const myFunction = onCall({
  secrets: [secrets.OPENAI_API_KEY]
}, async (request) => {
  const config = getEnvironmentConfig();
  const apiKey = config.openai.apiKey;
  // 사용
});
```

## 환경변수 목록

### 필수 환경변수

| 환경변수 | 설명 | 예시 |
|---------|------|------|
| `FIREBASE_API_KEY` | Firebase API 키 | `AIzaSyC...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | `project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | `my-project` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 | `project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 센더 ID | `123456789` |
| `FIREBASE_APP_ID` | Firebase 앱 ID | `1:123:web:abc` |
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |

### 선택적 환경변수

| 환경변수 | 설명 | 기본값 |
|---------|------|--------|
| `NEXT_PUBLIC_API_URL` | API 기본 URL | `/api` |
| `NODE_ENV` | 개발 환경 | `development` |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | Firebase 에뮬레이터 사용 여부 | `false` |

## 보안 주의사항

1. **Public vs Secret**: `NEXT_PUBLIC_` 접두사가 있는 환경변수는 클라이언트에 노출됩니다.
2. **API Keys**: 민감한 API 키는 서버 사이드에서만 사용하고 클라이언트에 노출하지 마세요.
3. **Production 환경**: 프로덕션에서는 반드시 Firebase Functions Secrets를 사용하세요.

## 문제 해결

### Functions에서 환경변수 로드 실패

Functions에서 환경변수를 로드할 수 없는 경우, 자동으로 `.env.local` 파일의 값을 폴백으로 사용합니다.

### Secret 설정 오류

```bash
# 개별 secret 확인
firebase functions:secrets:access SECRET_NAME

# 모든 secrets 목록 보기
firebase functions:secrets:list
```

### 캐시 문제

클라이언트에서 환경변수가 업데이트되지 않는 경우:

```typescript
import { clearConfigCache } from '@/shared/services/configService';

// 캐시 초기화
clearConfigCache();
```

## 개발 환경에서의 사용

개발 환경에서는 `.env.local` 파일의 환경변수가 우선 사용되며, Functions가 준비되지 않은 경우 자동으로 폴백됩니다.

## 스크립트 업데이트

기존 스크립트들(`scripts/seed-*.js`)은 이제 자동으로 Functions에서 환경변수를 가져오거나 `.env.local`을 폴백으로 사용합니다.

```bash
# 예시: 사용자 데이터 시드
node scripts/seed-users.js
```
