// 사용자 시드 데이터 생성 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// 환경변수에서 Firebase 설정 읽기
require('dotenv').config({ path: '../.env.local' });

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

// 사용자 시드 데이터
const usersData = [
  {
    name: '김헤비',
    email: 'hebi1@test.com',
    role: 'admin',
    status: 'active',
    orders: 25,
    totalSpent: 1250000,
    joinDate: '2024-01-15',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '이쇼핑',
    email: 'shopping@test.com',
    role: 'user',
    status: 'active',
    orders: 15,
    totalSpent: 750000,
    joinDate: '2024-02-20',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '박구매',
    email: 'buyer@test.com',
    role: 'user',
    status: 'active',
    orders: 8,
    totalSpent: 320000,
    joinDate: '2024-03-10',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '최고객',
    email: 'customer@test.com',
    role: 'user',
    status: 'active',
    orders: 32,
    totalSpent: 1800000,
    joinDate: '2023-12-05',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '정단골',
    email: 'regular@test.com',
    role: 'user',
    status: 'active',
    orders: 45,
    totalSpent: 2150000,
    joinDate: '2023-11-20',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '한신규',
    email: 'newuser@test.com',
    role: 'user',
    status: 'active',
    orders: 2,
    totalSpent: 89000,
    joinDate: '2024-08-10',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '조휴면',
    email: 'inactive@test.com',
    role: 'user',
    status: 'inactive',
    orders: 5,
    totalSpent: 180000,
    joinDate: '2023-08-15',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '문제유저',
    email: 'problem@test.com',
    role: 'user',
    status: 'banned',
    orders: 3,
    totalSpent: 150000,
    joinDate: '2024-01-05',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '관리자2',
    email: 'admin2@test.com',
    role: 'admin',
    status: 'active',
    orders: 0,
    totalSpent: 0,
    joinDate: '2024-01-01',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: '김신입',
    email: 'newbie@test.com',
    role: 'user',
    status: 'active',
    orders: 1,
    totalSpent: 45000,
    joinDate: '2024-08-12',
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
];

async function seedUsers() {
  try {
    console.log('🚀 사용자 시드 데이터 생성 시작...');
    
    const usersCollection = collection(db, 'users');
    
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      console.log(`👤 사용자 ${i + 1}/${usersData.length} 생성 중: ${userData.name}`);
      
      const docRef = await addDoc(usersCollection, userData);
      console.log(`✅ 사용자 생성 완료 - ID: ${docRef.id}`);
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
