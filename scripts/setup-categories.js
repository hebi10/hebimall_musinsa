const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

const categories = [
  {
    id: 'clothing',
    name: '의류',
    description: '트렌디하고 편안한 의류로 완성하는 나만의 스타일',
    order: 1,
    isActive: true,
    icon: '👕',
    color: '#007bff'
  },
  {
    id: 'accessories',
    name: '액세서리',
    description: '포인트가 되는 액세서리로 스타일 완성',
    order: 2,
    isActive: true,
    icon: '💍',
    color: '#28a745'
  },
  {
    id: 'bags',
    name: '가방',
    description: '실용성과 스타일을 겸비한 가방 컬렉션',
    order: 3,
    isActive: true,
    icon: '🎒',
    color: '#ffc107'
  },
  {
    id: 'bottoms',
    name: '하의',
    description: '편안하고 스타일리시한 하의 컬렉션',
    order: 4,
    isActive: true,
    icon: '👖',
    color: '#dc3545'
  },
  {
    id: 'shoes',
    name: '신발',
    description: '편안하고 스타일리시한 신발로 완벽한 발걸음을',
    order: 5,
    isActive: true,
    icon: '👟',
    color: '#6610f2'
  },
  {
    id: 'tops',
    name: '상의',
    description: '다양한 스타일의 상의로 완성하는 코디',
    order: 6,
    isActive: true,
    icon: '👔',
    color: '#fd7e14'
  },
  {
    id: 'outdoor',
    name: '아웃도어',
    description: '자연과 함께하는 아웃도어 라이프를 위한 전문 장비',
    order: 7,
    isActive: true,
    icon: '🏔️',
    color: '#20c997'
  },
  {
    id: 'sports',
    name: '스포츠',
    description: '운동과 레저를 위한 전문 스포츠 용품',
    order: 8,
    isActive: true,
    icon: '⚽',
    color: '#6f42c1'
  },
  {
    id: 'jewelry',
    name: '주얼리',
    description: '특별한 순간을 빛내주는 프리미엄 주얼리',
    order: 9,
    isActive: true,
    icon: '💎',
    color: '#e83e8c'
  }
];

async function setupCategories() {
  console.log('📁 카테고리 데이터 Firebase 설정 시작\n');
  
  try {
    let addedCount = 0;
    
    for (const category of categories) {
      try {
        await setDoc(
          doc(db, 'categories', category.id),
          {
            ...category,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        
        console.log(`✅ ${category.name} (${category.id}) 카테고리 설정 완료`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ ${category.name} 설정 실패:`, error.message);
      }
    }
    
    console.log(`\n🎉 총 ${addedCount}개 카테고리가 설정되었습니다!`);
    console.log('📄 각 카테고리는 name과 description 필드를 포함합니다.');
    
  } catch (error) {
    console.error('❌ 카테고리 설정 실패:', error);
  }
  
  process.exit(0);
}

setupCategories().catch(console.error);
