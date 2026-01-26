// 현재 로그인된 사용자로 쿠폰 데이터 업데이트
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  addDoc,
  query,
  where,
  getDocs,
  Timestamp 
} = require('firebase/firestore');

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 실제 사용자 UID (실행 시 매개변수로 받음)
const userUID = process.argv[2];

if (!userUID) {
  console.error('사용법: node scripts/add-user-coupons.js [USER_UID]');
  process.exit(1);
}

// 해당 사용자에게 발급할 쿠폰들
const userCoupons = [
  {
    uid: userUID,
    couponId: 'C001',
    status: '사용가능',
    issuedDate: '2024.08.06',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: userUID,
    couponId: 'C002',
    status: '사용가능',
    issuedDate: '2024.11.01',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: userUID,
    couponId: 'C003',
    status: '사용완료',
    issuedDate: '2024.10.01',
    usedDate: '2024.11.28',
    orderId: 'ORDER_001',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: userUID,
    couponId: 'C005',
    status: '사용가능',
    issuedDate: '2024.12.01',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function addUserCoupons() {
  try {
    // 기존 사용자 쿠폰이 있는지 확인
    const q = query(
      collection(db, 'user_coupons'),
      where('uid', '==', userUID)
    );
    const existingSnapshot = await getDocs(q);
    
    // 새로운 쿠폰 발급
    for (const userCoupon of userCoupons) {
      await addDoc(collection(db, 'user_coupons'), userCoupon);
    }

  } catch (error) {
    console.error('❌ 쿠폰 발급 중 오류 발생:', error);
    process.exit(1);
  }
}

addUserCoupons();
