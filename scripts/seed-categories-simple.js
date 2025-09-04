const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

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

const categories = [
  {
    name: '의류',
    slug: 'clothing',
    path: '/categories/clothing',
    description: '티셔츠, 셔츠, 후드, 니트 등 다양한 의류',
    icon: '👕',
    order: 0,
    isActive: true,
    productCount: 0
  },
  {
    name: '신발',
    slug: 'shoes',
    path: '/categories/shoes',
    description: '운동화, 구두, 부츠, 샌들 등 모든 신발',
    icon: '👟',
    order: 1,
    isActive: true,
    productCount: 0
  },
  {
    name: '가방',
    slug: 'bags',
    path: '/categories/bags',
    description: '백팩, 토트백, 크로스백, 지갑 등',
    icon: '👜',
    order: 2,
    isActive: true,
    productCount: 0
  },
  {
    name: '시계/주얼리',
    slug: 'jewelry',
    path: '/categories/jewelry',
    description: '시계, 목걸이, 팔찌, 반지 등 액세서리',
    icon: '💎',
    order: 3,
    isActive: true,
    productCount: 0
  },
  {
    name: '패션소품',
    slug: 'accessories',
    path: '/categories/accessories',
    description: '모자, 벨트, 선글라스, 스카프 등',
    icon: '🧢',
    order: 4,
    isActive: true,
    productCount: 0
  },
  {
    name: '아웃도어',
    slug: 'outdoor',
    path: '/categories/outdoor',
    description: '등산복, 캠핑용품, 스포츠웨어 등',
    icon: '🏔️',
    order: 5,
    isActive: true,
    productCount: 0
  },
  {
    name: '스포츠',
    slug: 'sports',
    path: '/categories/sports',
    description: '운동복, 운동화, 스포츠용품 등',
    icon: '⚽',
    order: 6,
    isActive: true,
    productCount: 0
  }
];

async function seedCategories() {
  try {
    console.log('📦 카테고리 데이터 생성 시작...');
    
    for (const category of categories) {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ 카테고리 생성 완료: ${category.name} (${docRef.id})`);
    }
    
    console.log('🎉 모든 카테고리 생성 완료!');
  } catch (error) {
    console.error('❌ 카테고리 생성 중 오류 발생:', error);
    throw error;
  }
}

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

// 스크립트 실행
seedCategories()
  .then(() => {
    console.log('스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('스크립트 실행 중 오류:', error);
    process.exit(1);
  });
