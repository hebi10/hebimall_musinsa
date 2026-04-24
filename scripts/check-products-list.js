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

async function listAllProducts() {
  console.log('📋 모든 상품 목록 조회...');
  
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    let allProducts = [];
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      
      try {
        const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
        console.log(`\n📂 ${categoryId} (${productsSnapshot.size}개):`);
        
        productsSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          allProducts.push({
            id: doc.id,
            name: data.name,
            category: categoryId,
            brand: data.brand
          });
        });
      } catch (error) {
        console.log(`   ⚠️ ${categoryId} 조회 실패: ${error.message}`);
      }
    }
    
    console.log(`\n총 ${allProducts.length}개 상품`);
    
    // 액세서리 카테고리 상품 ID 몇 개 출력
    console.log('\n🔍 액세서리 카테고리 상품 ID 샘플:');
    const accessoryProducts = allProducts.filter(p => p.category === 'accessories').slice(0, 5);
    accessoryProducts.forEach(p => {
      console.log(`   ${p.id} - ${p.name}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

listAllProducts().catch(console.error);
