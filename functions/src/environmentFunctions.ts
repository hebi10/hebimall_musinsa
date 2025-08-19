import { onCall, CallableRequest } from "firebase-functions/v2/https";
import { getEnvironmentConfig, getFirebaseConfig, secrets } from "./config/environment";

// 클라이언트용 환경변수 제공 함수
export const getClientConfig = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest) => {
  try {
    const config = getEnvironmentConfig();
    
    // 클라이언트에게 안전하게 제공할 수 있는 환경변수만 반환
    return {
      success: true,
      config: {
        firebase: config.firebase,
        api: {
          baseUrl: config.api.baseUrl,
        },
        development: {
          nodeEnv: config.development.nodeEnv,
          useFirebaseEmulator: config.development.useFirebaseEmulator,
        }
      }
    };
  } catch (error: any) {
    console.error("환경변수 조회 실패:", error);
    return {
      success: false,
      error: "환경변수를 불러올 수 없습니다.",
      config: null
    };
  }
});

// Firebase Config만 반환하는 함수
export const getFirebaseClientConfig = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest) => {
  try {
    const firebaseConfig = getFirebaseConfig();
    
    return {
      success: true,
      config: firebaseConfig
    };
  } catch (error: any) {
    console.error("Firebase 설정 조회 실패:", error);
    return {
      success: false,
      error: "Firebase 설정을 불러올 수 없습니다.",
      config: null
    };
  }
});

// OpenAI API Key를 반환하는 함수 (서버 사이드에서만 사용)
export const getOpenAIKey = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1',
  secrets: [secrets.OPENAI_API_KEY] // OpenAI Secret만 사용
}, async (request: CallableRequest) => {
  // 인증된 사용자만 접근 가능 (옵션)
  if (!request.auth) {
    return {
      success: false,
      error: "인증이 필요합니다.",
      apiKey: null
    };
  }

  try {
    const config = getEnvironmentConfig();
    
    return {
      success: true,
      apiKey: config.openai.apiKey
    };
  } catch (error: any) {
    console.error("OpenAI API Key 조회 실패:", error);
    return {
      success: false,
      error: "API Key를 불러올 수 없습니다.",
      apiKey: null
    };
  }
});
