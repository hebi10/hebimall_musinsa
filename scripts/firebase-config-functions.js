const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getFunctions, httpsCallable } = require("firebase/functions");

// 환경변수 폴백 로드
require('dotenv').config({ path: '.env.local' });

// 기본 Firebase 설정 (폴백용)
const defaultFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(defaultFirebaseConfig);
const functions = getFunctions(app);

// Firebase Config를 Functions에서 가져오는 함수
async function getFirebaseConfigFromFunctions() {
  try {
    const getFirebaseConfigFunction = httpsCallable(functions, 'getFirebaseClientConfig');
    const result = await getFirebaseConfigFunction();
    
    if (result.data.success) {
      console.log('Firebase 설정을 Functions에서 성공적으로 로드했습니다.');
      return result.data.config;
    } else {
      console.warn('Functions에서 설정 로드 실패, 환경변수 사용:', result.data.error);
      return defaultFirebaseConfig;
    }
  } catch (error) {
    console.warn('Functions 연결 실패, 환경변수 사용:', error.message);
    return defaultFirebaseConfig;
  }
}

// 동적으로 Firebase 앱 재초기화
async function initializeFirebaseWithFunctionsConfig() {
  const config = await getFirebaseConfigFromFunctions();
  
  // 기존 앱이 있으면 사용, 없으면 새로 생성
  try {
    const dynamicApp = initializeApp(config, 'dynamic-app');
    return {
      app: dynamicApp,
      auth: getAuth(dynamicApp),
      db: getFirestore(dynamicApp)
    };
  } catch (error) {
    // 이미 초기화된 앱 사용
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app)
    };
  }
}

module.exports = {
  app,
  auth: getAuth(app),
  db: getFirestore(app),
  functions,
  getFirebaseConfigFromFunctions,
  initializeFirebaseWithFunctionsConfig
};
