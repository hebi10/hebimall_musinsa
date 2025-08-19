import { defineSecret } from "firebase-functions/params";

// Firebase Functions secrets/params 정의 - OpenAI API Key만 Secret으로 관리
export const secrets = {
  // OpenAI API (민감한 정보)
  OPENAI_API_KEY: defineSecret("OPENAI_API_KEY"),
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
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    },
    openai: {
      apiKey: secrets.OPENAI_API_KEY.value(),
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    },
    development: {
      nodeEnv: process.env.NODE_ENV || 'development',
      useFirebaseEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
    },
  };
}

// Firebase Config 객체 반환
export function getFirebaseConfig() {
  const config = getEnvironmentConfig();
  return config.firebase;
}
