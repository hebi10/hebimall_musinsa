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
    productCount: 0,
    subCategories: [
      { name: '티셔츠', slug: 'tshirt', path: '/categories/clothing/tshirt', order: 0, isActive: true },
      { name: '셔츠', slug: 'shirt', path: '/categories/clothing/shirt', order: 1, isActive: true },
      { name: '후드/스웨트셔츠', slug: 'hoodie', path: '/categories/clothing/hoodie', order: 2, isActive: true },
      { name: '니트/스웨터', slug: 'knit', path: '/categories/clothing/knit', order: 3, isActive: true },
      { name: '바지', slug: 'pants', path: '/categories/clothing/pants', order: 4, isActive: true },
      { name: '재킷/아우터', slug: 'jacket', path: '/categories/clothing/jacket', order: 5, isActive: true },
      { name: '원피스/스커트', slug: 'dress', path: '/categories/clothing/dress', order: 6, isActive: true }
    ]
  },
  {
    name: '신발',
    slug: 'shoes',
    path: '/categories/shoes',
    description: '운동화, 구두, 부츠, 샌들 등 모든 신발',
    icon: '👟',
    order: 1,
    isActive: true,
    productCount: 0,
    subCategories: [
      { name: '운동화/스니커즈', slug: 'sneakers', path: '/categories/shoes/sneakers', order: 0, isActive: true },
      { name: '구두', slug: 'dress-shoes', path: '/categories/shoes/dress-shoes', order: 1, isActive: true },
      { name: '부츠', slug: 'boots', path: '/categories/shoes/boots', order: 2, isActive: true },
      { name: '샌들/슬리퍼', slug: 'sandals', path: '/categories/shoes/sandals', order: 3, isActive: true },
      { name: '로퍼', slug: 'loafers', path: '/categories/shoes/loafers', order: 4, isActive: true },
      { name: '등산화', slug: 'hiking', path: '/categories/shoes/hiking', order: 5, isActive: true }
    ]
  },
  {
    name: '가방',
    slug: 'bags',
    path: '/categories/bags',
    description: '백팩, 토트백, 크로스백, 지갑 등',
    icon: '👜',
    order: 2,
    isActive: true,
    productCount: 0,
    subCategories: [
      { name: '백팩', slug: 'backpack', path: '/categories/bags/backpack', order: 0, isActive: true },
      { name: '토트백', slug: 'tote', path: '/categories/bags/tote', order: 1, isActive: true },
      { name: '크로스백', slug: 'crossbody', path: '/categories/bags/crossbody', order: 2, isActive: true },
      { name: '클러치', slug: 'clutch', path: '/categories/bags/clutch', order: 3, isActive: true },
      { name: '지갑', slug: 'wallet', path: '/categories/bags/wallet', order: 4, isActive: true },
      { name: '여행가방', slug: 'travel', path: '/categories/bags/travel', order: 5, isActive: true }
    ]
  },
  {
    name: '시계/주얼리',
    slug: 'jewelry',
    path: '/categories/jewelry',
    description: '시계, 목걸이, 팔찌, 반지 등 액세서리',
    icon: '💎',
    order: 3,
    isActive: true,
    productCount: 0,
    subCategories: [
      { name: '시계', slug: 'watch', path: '/categories/jewelry/watch', order: 0, isActive: true },
      { name: '목걸이', slug: 'necklace', path: '/categories/jewelry/necklace', order: 1, isActive: true },
      { name: '팔찌', slug: 'bracelet', path: '/categories/jewelry/bracelet', order: 2, isActive: true },
      { name: '반지', slug: 'ring', path: '/categories/jewelry/ring', order: 3, isActive: true },
      { name: '귀걸이', slug: 'earring', path: '/categories/jewelry/earring', order: 4, isActive: true }
    ]
  },
  {
    name: '패션소품',
    slug: 'accessories',
    path: '/categories/accessories',
    description: '모자, 벨트, 선글라스, 스카프 등',
    icon: '🧢',
    order: 4,
    isActive: true,
    productCount: 0,
    subCategories: [
      { name: '모자', slug: 'hat', path: '/categories/accessories/hat', order: 0, isActive: true },
      { name: '벨트', slug: 'belt', path: '/categories/accessories/belt', order: 1, isActive: true },
      { name: '선글라스', slug: 'sunglasses', path: '/categories/accessories/sunglasses', order: 2, isActive: true },
      { name: '스카프', slug: 'scarf', path: '/categories/accessories/scarf', order: 3, isActive: true },
      { name: '장갑', slug: 'gloves', path: '/categories/accessories/gloves', order: 4, isActive: true }
    ]
  },
  {
    name: '아웃도어',
    slug: 'outdoor',
    path: '/categories/outdoor',
    description: '등산복, 캠핑용품, 스포츠웨어 등',
    icon: '🏔️',
    order: 5,
    isActive: true,
    productCount: 0,
    subCategories: [
      { name: '등산복', slug: 'hiking-wear', path: '/categories/outdoor/hiking-wear', order: 0, isActive: true },
      { name: '캠핑용품', slug: 'camping', path: '/categories/outdoor/camping', order: 1, isActive: true },
      { name: '스포츠웨어', slug: 'sports-wear', path: '/categories/outdoor/sports-wear', order: 2, isActive: true },
      { name: '아웃도어 신발', slug: 'outdoor-shoes', path: '/categories/outdoor/outdoor-shoes', order: 3, isActive: true },
      { name: '등산가방', slug: 'outdoor-backpack', path: '/categories/outdoor/outdoor-backpack', order: 4, isActive: true }
    ]
  },
  {
    name: '스포츠',
    slug: 'sports',
    path: '/categories/sports',
    description: '운동복, 운동화, 스포츠용품 등',
    icon: '⚽',
    order: 6,
    isActive: true,
    productCount: 0,
    subCategories: [
      { name: '운동복', slug: 'sportswear', path: '/categories/sports/sportswear', order: 0, isActive: true },
      { name: '러닝', slug: 'running', path: '/categories/sports/running', order: 1, isActive: true },
      { name: '헬스/피트니스', slug: 'gym', path: '/categories/sports/gym', order: 2, isActive: true },
      { name: '요가', slug: 'yoga', path: '/categories/sports/yoga', order: 3, isActive: true },
      { name: '축구', slug: 'football', path: '/categories/sports/football', order: 4, isActive: true },
      { name: '농구', slug: 'basketball', path: '/categories/sports/basketball', order: 5, isActive: true }
    ]
  }
];

async function seedCategories() {
  try {
    for (const category of categories) {
      const now = Timestamp.now();
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('❌ 카테고리 생성 중 오류 발생:', error);
    throw error;
  }
}

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

// 스크립트 실행
seedCategories().catch((error) => {
  console.error('스크립트 실행 중 오류:', error);
  process.exit(1);
});
