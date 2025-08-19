import { httpsCallable } from 'firebase/functions';
import { functions } from '../libs/firebase/firebase';

// 클라이언트 환경변수 캐시
let clientConfigCache: any = null;

// 환경변수 타입 정의
export interface ClientConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  api: {
    baseUrl: string;
  };
  development: {
    nodeEnv: string;
    useFirebaseEmulator: boolean;
  };
}

// 클라이언트 설정 가져오기 (캐시 사용)
export async function getClientConfig(): Promise<ClientConfig> {
  if (clientConfigCache) {
    return clientConfigCache;
  }

  try {
    const getClientConfigFunction = httpsCallable(functions, 'getClientConfig');
    const result = await getClientConfigFunction();
    const data = result.data as any;

    if (data.success) {
      clientConfigCache = data.config;
      return data.config;
    } else {
      throw new Error(data.error || '환경변수를 불러올 수 없습니다.');
    }
  } catch (error) {
    console.error('환경변수 로드 실패:', error);
    
    // 폴백 설정 (개발용)
    const fallbackConfig: ClientConfig = {
      firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      },
      api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
      },
      development: {
        nodeEnv: process.env.NODE_ENV || 'development',
        useFirebaseEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
      },
    };
    
    return fallbackConfig;
  }
}

// Firebase 설정만 가져오기
export async function getFirebaseConfig() {
  try {
    const getFirebaseConfigFunction = httpsCallable(functions, 'getFirebaseClientConfig');
    const result = await getFirebaseConfigFunction();
    const data = result.data as any;

    if (data.success) {
      return data.config;
    } else {
      throw new Error(data.error || 'Firebase 설정을 불러올 수 없습니다.');
    }
  } catch (error) {
    console.error('Firebase 설정 로드 실패:', error);
    
    // 폴백 설정
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };
  }
}

// OpenAI API Key 가져오기 (서버 사이드에서만 사용)
export async function getOpenAIKey(): Promise<string> {
  try {
    const getOpenAIKeyFunction = httpsCallable(functions, 'getOpenAIKey');
    const result = await getOpenAIKeyFunction();
    const data = result.data as any;

    if (data.success) {
      return data.apiKey;
    } else {
      throw new Error(data.error || 'OpenAI API Key를 불러올 수 없습니다.');
    }
  } catch (error) {
    console.error('OpenAI API Key 로드 실패:', error);
    
    // 폴백 (process.env에서 읽기)
    return process.env.OPENAI_API_KEY || '';
  }
}

// 캐시 초기화
export function clearConfigCache() {
  clientConfigCache = null;
}
