// 기본 사용자 시드 데이터 생성 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// 환경변수에서 Firebase 설정 읽기
require('dotenv').config({ path: '.env.local' });

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

// 간단한 사용자 시드 데이터
const usersData = [
  {
    name: '김헤비',
    email: 'hebi1@test.com',
    phone: '010-1111-1111',
    role: 'admin',
    status: 'active',
    orders: 25,
    totalSpent: 1250000,
    pointBalance: 12500,
    grade: 'platinum',
    isAdmin: true,
    joinDate: '2024-01-15',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '이쇼핑',
    email: 'shopping@test.com',
    phone: '010-2222-2222',
    role: 'user',
    status: 'active',
    orders: 15,
    totalSpent: 750000,
    pointBalance: 7500,
    grade: 'gold',
    isAdmin: false,
    joinDate: '2024-02-20',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '박구매',
    email: 'buyer@test.com',
    phone: '010-3333-3333',
    role: 'user',
    status: 'active',
    orders: 8,
    totalSpent: 320000,
    pointBalance: 3200,
    grade: 'silver',
    isAdmin: false,
    joinDate: '2024-03-10',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '최고객',
    email: 'customer@test.com',
    phone: '010-4444-4444',
    role: 'user',
    status: 'active',
    orders: 32,
    totalSpent: 1800000,
    pointBalance: 18000,
    grade: 'platinum',
    isAdmin: false,
    joinDate: '2023-12-05',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '정단골',
    email: 'regular@test.com',
    phone: '010-5555-5555',
    role: 'user',
    status: 'active',
    orders: 45,
    totalSpent: 2150000,
    pointBalance: 21500,
    grade: 'platinum',
    isAdmin: false,
    joinDate: '2023-11-20',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '한신규',
    email: 'newuser@test.com',
    phone: '010-6666-6666',
    role: 'user',
    status: 'active',
    orders: 2,
    totalSpent: 89000,
    pointBalance: 5890,
    grade: 'bronze',
    isAdmin: false,
    joinDate: '2024-08-10',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '조휴면',
    email: 'inactive@test.com',
    phone: '010-7777-7777',
    role: 'user',
    status: 'inactive',
    orders: 5,
    totalSpent: 180000,
    pointBalance: 1800,
    grade: 'bronze',
    isAdmin: false,
    joinDate: '2023-08-15',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '문제유저',
    email: 'problem@test.com',
    phone: '010-8888-8888',
    role: 'user',
    status: 'banned',
    orders: 3,
    totalSpent: 150000,
    pointBalance: 0,
    grade: 'bronze',
    isAdmin: false,
    joinDate: '2024-01-05',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
];

async function seedUsers() {
  try {
    console.log('🚀 기본 사용자 시드 데이터 생성 시작...');
    
    const usersCollection = collection(db, 'users');
    
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      console.log(`👤 사용자 ${i + 1}/${usersData.length} 생성 중: ${userData.name}`);
      
      const docRef = await addDoc(usersCollection, userData);
      console.log(`✅ 사용자 생성 완료 - ID: ${docRef.id}`);

      // 포인트 히스토리 생성 (포인트가 있는 사용자만)
      if (userData.pointBalance > 0) {
        console.log(`💰 ${userData.name}의 포인트 히스토리 생성 중...`);
        
        const pointHistoryCollection = collection(db, 'users', docRef.id, 'pointHistory');
        
        // 회원가입 포인트 히스토리
        await addDoc(pointHistoryCollection, {
          type: 'earn',
          amount: 5000,
          description: '신규 회원가입 적립',
          date: serverTimestamp(),
          balanceAfter: 5000,
        });

        // 추가 포인트가 있다면 주문 적립으로 처리
        if (userData.pointBalance > 5000) {
          const additionalPoints = userData.pointBalance - 5000;
          await addDoc(pointHistoryCollection, {
            type: 'earn',
            amount: additionalPoints,
            description: `주문 완료 적립`,
            date: serverTimestamp(),
            balanceAfter: userData.pointBalance,
            orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        }

        console.log(`✅ ${userData.name}의 포인트 히스토리 생성 완료`);
      }
    }
    
    console.log(`🎉 총 ${usersData.length}개의 사용자 시드 데이터 생성 완료!`);
    
  } catch (error) {
    console.error('❌ 사용자 시드 데이터 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedUsers().then(() => {
    process.exit(0);
  });
}

module.exports = { seedUsers };
