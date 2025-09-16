const { getFirestore, collection, doc, getDoc, getDocs } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

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

async function listAllCategories() {
  console.log('📋 모든 카테고리 목록 조회...\n');
  
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    console.log(`총 ${categoriesSnapshot.size}개 카테고리:`);
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const categoryData = categoryDoc.data();
      
      try {
        const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
        
        
        // 카테고리 데이터가 있으면 표시
        if (categoryData && Object.keys(categoryData).length > 0) {
          console.log(`   데이터: ${JSON.stringify(categoryData, null, 2)}`);
        }
        
        // 첫 번째 상품 몇 개 샘플 표시
        if (productsSnapshot.size > 0) {
          const sampleProducts = productsSnapshot.docs.slice(0, 3);
          sampleProducts.forEach((doc, index) => {
            const data = doc.data();
          });
          if (productsSnapshot.size > 3) {
            console.log(`   ... 외 ${productsSnapshot.size - 3}개`);
          }
        }
        
      } catch (error) {
        console.log(`   ⚠️ ${categoryId} 조회 실패: ${error.message}`);
      }
      
      console.log(''); // 빈 줄
    }
    
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

listAllCategories().catch(console.error);
