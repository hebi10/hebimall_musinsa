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

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyD9xCrkmFZw0PvS9hXl5kpWv81qX1v4lcw",
  authDomain: "hebimall.firebaseapp.com",
  projectId: "hebimall",
  storageBucket: "hebimall.firebasestorage.app",
  messagingSenderId: "404572243739",
  appId: "1:404572243739:web:8a5b237d8532015cde35be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 실제 사용자 UID (실행 시 매개변수로 받음)
const userUID = process.argv[2];

if (!userUID) {
  console.error('사용법: node scripts/add-user-coupons.js [USER_UID]');
  process.exit(1);
}

console.log(`사용자 ${userUID}에게 쿠폰을 발급합니다...`);

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
    console.log('🚀 사용자 쿠폰 발급을 시작합니다...');

    // 기존 사용자 쿠폰이 있는지 확인
    const q = query(
      collection(db, 'user_coupons'),
      where('uid', '==', userUID)
    );
    const existingSnapshot = await getDocs(q);
    
    if (!existingSnapshot.empty) {
      console.log(`⚠️  사용자 ${userUID}에게 이미 ${existingSnapshot.size}개의 쿠폰이 있습니다.`);
      console.log('기존 쿠폰:');
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.couponId} (${data.status})`);
      });
    }

    // 새로운 쿠폰 발급
    console.log('👤 새로운 쿠폰 발급 중...');
    for (const userCoupon of userCoupons) {
      const docRef = await addDoc(collection(db, 'user_coupons'), userCoupon);
      console.log(`✅ 유저쿠폰 발급: ${docRef.id} (${userCoupon.couponId} - ${userCoupon.status})`);
    }

    console.log('🎉 사용자 쿠폰 발급이 완료되었습니다!');
    console.log(`📊 발급된 쿠폰: ${userCoupons.length}개`);

  } catch (error) {
    console.error('❌ 쿠폰 발급 중 오류 발생:', error);
  }
  
  process.exit(0);
}

addUserCoupons();
