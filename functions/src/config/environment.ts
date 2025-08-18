import { defineSecret } from "firebase-functions/params";

// Firebase Functions secrets/params 정의
export const secrets = {
  // Firebase 설정 (public)
  FIREBASE_API_KEY: defineSecret("FIREBASE_API_KEY"),
  FIREBASE_AUTH_DOMAIN: defineSecret("FIREBASE_AUTH_DOMAIN"),
  FIREBASE_PROJECT_ID: defineSecret("FIREBASE_PROJECT_ID"),
  FIREBASE_STORAGE_BUCKET: defineSecret("FIREBASE_STORAGE_BUCKET"),
  FIREBASE_MESSAGING_SENDER_ID: defineSecret("FIREBASE_MESSAGING_SENDER_ID"),
  FIREBASE_APP_ID: defineSecret("FIREBASE_APP_ID"),
  
  // OpenAI API
  OPENAI_API_KEY: defineSecret("OPENAI_API_KEY"),
  
  // 기타 API Keys
  NEXT_PUBLIC_API_URL: defineSecret("NEXT_PUBLIC_API_URL"),
  
  // 개발 환경 설정
  NODE_ENV: defineSecret("NODE_ENV"),
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: defineSecret("NEXT_PUBLIC_USE_FIREBASE_EMULATOR"),
};

// 환경변수 타입 정의
export interface EnvironmentConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  openai: {
    apiKey: string;
  };
  api: {
    baseUrl: string;
  };
  development: {
    nodeEnv: string;
    useFirebaseEmulator: boolean;
  };
}

// 환경변수 가져오기 함수
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    firebase: {
      apiKey: secrets.FIREBASE_API_KEY.value(),
      authDomain: secrets.FIREBASE_AUTH_DOMAIN.value(),
      projectId: secrets.FIREBASE_PROJECT_ID.value(),
      storageBucket: secrets.FIREBASE_STORAGE_BUCKET.value(),
      messagingSenderId: secrets.FIREBASE_MESSAGING_SENDER_ID.value(),
      appId: secrets.FIREBASE_APP_ID.value(),
    },
    openai: {
      apiKey: secrets.OPENAI_API_KEY.value(),
    },
    api: {
      baseUrl: secrets.NEXT_PUBLIC_API_URL.value(),
    },
    development: {
      nodeEnv: secrets.NODE_ENV.value(),
      useFirebaseEmulator: secrets.NEXT_PUBLIC_USE_FIREBASE_EMULATOR.value() === 'true',
    },
  };
}

// Firebase Config 객체 반환
export function getFirebaseConfig() {
  const config = getEnvironmentConfig();
  return config.firebase;
}
