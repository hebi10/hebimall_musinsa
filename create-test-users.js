// 테스트 사용자 데이터 생성 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBaKyZ8Z3eWw6n8kKhvJ7rFVlD1RhBKx-k",
  authDomain: "hebi-mall.firebaseapp.com",
  projectId: "hebi-mall",
  storageBucket: "hebi-mall.firebasestorage.app",
  messagingSenderId: "82467588522",
  appId: "1:82467588522:web:9b8d8e7b4e5c8d6a7f8b9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestUsers() {
  console.log('👥 테스트 사용자 데이터를 생성합니다...');
  
  try {
    // 관리자 계정 먼저 생성 (기존 ID 사용)
    const adminUser = {
      name: '관리자',
      email: 'admin@hebimall.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-01',
      orders: 5,
      totalSpent: 500000,
      pointBalance: 10000,
      isAdmin: true,
      lastLogin: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      phone: '010-1234-5678',
      gender: 'male',
      grade: 'vip',
      addresses: [],
      preferences: {
        favoriteCategories: ['tops', 'accessories'],
        favoriteBrands: ['Nike', 'Adidas'],
        sizes: { top: 'L', bottom: '32' },
        newsletter: true,
        smsMarketing: true,
      }
    };

    // 특정 ID로 관리자 계정 생성
    await setDoc(doc(db, 'users', 'TVQTUGzParcYqdSwcXHw90YCgTS2'), adminUser);
    console.log('✅ 관리자 계정 생성됨: TVQTUGzParcYqdSwcXHw90YCgTS2');

    // 일반 사용자 계정들 생성
    const testUsers = [
      {
        name: '김철수',
        email: 'kim@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-06-15',
        orders: 3,
        totalSpent: 120000,
        pointBalance: 5000,
        phone: '010-1111-2222',
        gender: 'male',
        grade: 'silver'
      },
      {
        name: '이영희',
        email: 'lee@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-07-20',
        orders: 7,
        totalSpent: 350000,
        pointBalance: 15000,
        phone: '010-3333-4444',
        gender: 'female',
        grade: 'gold'
      },
      {
        name: '박민수',
        email: 'park@example.com',
        role: 'user',
        status: 'inactive',
        joinDate: '2024-05-10',
        orders: 1,
        totalSpent: 45000,
        pointBalance: 2000,
        phone: '010-5555-6666',
        gender: 'male',
        grade: 'bronze'
      },
      {
        name: '최수정',
        email: 'choi@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-08-05',
        orders: 2,
        totalSpent: 89000,
        pointBalance: 3500,
        phone: '010-7777-8888',
        gender: 'female',
        grade: 'bronze'
      },
      {
        name: '정대한',
        email: 'jung@example.com',
        role: 'admin',
        status: 'active',
        joinDate: '2024-02-01',
        orders: 0,
        totalSpent: 0,
        pointBalance: 50000,
        phone: '010-9999-0000',
        gender: 'male',
        grade: 'admin'
      }
    ];

    for (const user of testUsers) {
      const userData = {
        ...user,
        isAdmin: user.role === 'admin',
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        addresses: [],
        preferences: {
          favoriteCategories: [],
          favoriteBrands: [],
          sizes: {},
          newsletter: Math.random() > 0.5,
          smsMarketing: Math.random() > 0.5,
        }
      };

      const docRef = await addDoc(collection(db, 'users'), userData);
      console.log(`✅ 사용자 생성됨: ${user.name} (${docRef.id})`);
    }

    console.log('🎉 모든 테스트 사용자 생성 완료!');
    
  } catch (error) {
    console.error('❌ 사용자 생성 실패:', error);
  }
}

createTestUsers();
