// Firestore 쿠폰 시드 데이터 스크립트
import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  Timestamp 
} from 'firebase/firestore';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 쿠폰 마스터 데이터
const coupons = [
  {
    id: 'C001',
    name: '신규회원 환영 쿠폰',
    type: '할인금액',
    value: 10000,
    minOrderAmount: 50000,
    expiryDate: '2024.12.31',
    description: '첫 구매 시 사용 가능한 특별 할인 쿠폰',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'C002',
    name: '겨울 세일 쿠폰',
    type: '할인율',
    value: 20,
    minOrderAmount: 100000,
    expiryDate: '2024.12.25',
    description: '겨울 상품 전용 할인 쿠폰',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'C003',
    name: '무료배송 쿠폰',
    type: '무료배송',
    value: 0,
    expiryDate: '2024.12.15',
    description: '배송비 무료 혜택',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'C004',
    name: '추석 특가 쿠폰',
    type: '할인율',
    value: 15,
    minOrderAmount: 80000,
    expiryDate: '2024.10.15',
    description: '추석 연휴 특별 할인',
    isActive: false, // 비활성화된 쿠폰
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'C005',
    name: '신년 맞이 특가',
    type: '할인금액',
    value: 15000,
    minOrderAmount: 120000,
    expiryDate: '2025.01.31',
    description: '새해 첫 구매 특별 혜택',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// 유저-쿠폰 매핑 데이터 (예제 사용자용)
const userCoupons = [
  {
    uid: 'user_1234', // 예제 사용자 UID
    couponId: 'C001',
    status: '사용가능',
    issuedDate: '2024.08.06',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: 'user_1234',
    couponId: 'C003',
    status: '사용완료',
    issuedDate: '2024.10.01',
    usedDate: '2024.11.28',
    orderId: 'ORDER_001',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: 'user_1234',
    couponId: 'C002',
    status: '사용가능',
    issuedDate: '2024.11.01',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: 'user_1234',
    couponId: 'C005',
    status: '사용가능',
    issuedDate: '2024.12.01',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    uid: 'user_5678', // 다른 예제 사용자
    couponId: 'C004',
    status: '기간만료',
    issuedDate: '2024.09.15',
    expiredDate: '2024.10.16',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function seedCouponData() {
  try {
    console.log('🚀 쿠폰 시드 데이터 생성을 시작합니다...');

    // 1. 쿠폰 마스터 데이터 생성
    console.log('📝 쿠폰 마스터 데이터 생성 중...');
    for (const coupon of coupons) {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
      console.log(`✅ 쿠폰 마스터 생성: ${coupon.name} (${coupon.id})`);
    }

    // 2. 유저-쿠폰 매핑 데이터 생성
    console.log('👤 유저-쿠폰 매핑 데이터 생성 중...');
    for (const userCoupon of userCoupons) {
      const docRef = await addDoc(collection(db, 'user_coupons'), userCoupon);
      console.log(`✅ 유저쿠폰 생성: ${docRef.id} (${userCoupon.uid} - ${userCoupon.couponId})`);
    }

    console.log('🎉 쿠폰 시드 데이터 생성이 완료되었습니다!');
    console.log(`📊 생성된 데이터:
    - 쿠폰 마스터: ${coupons.length}개
    - 유저쿠폰 매핑: ${userCoupons.length}개`);

  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedCouponData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedCouponData };
