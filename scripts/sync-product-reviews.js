const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { syncAllProductsReviewData } = require('../src/shared/utils/syncProductReviews');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBEXFEZ3xZYj_7R6YH_2lPYXzKGz8H9Kmk",
  authDomain: "hebimall-musinsa.firebaseapp.com",
  projectId: "hebimall-musinsa",
  storageBucket: "hebimall-musinsa.firebasestorage.app",
  messagingSenderId: "488088828901",
  appId: "1:488088828901:web:4c35ee2b4b8c4f5d5e4b9e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 리뷰 데이터 동기화 실행
async function runSync() {
  try {
    await syncAllProductsReviewData();
    process.exit(0);
  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    process.exit(1);
  }
}

runSync();
