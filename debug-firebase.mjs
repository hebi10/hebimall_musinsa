import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkProducts() {
  console.log('🔍 Firebase 상품 데이터 확인 중...');
  
  try {
    // 카테고리 목록 먼저 확인
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      try {
        const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
        console.log(`  └─ 상품 ${productsSnapshot.size}개`);
        
        productsSnapshot.forEach(productDoc => {
          const productData = productDoc.data();
          console.log(`    - ${productDoc.id}: ${productData.name || '이름 없음'}`);
        });
        
        // SE2niktLz1IXGoFDaPaq 상품이 이 카테고리에 있는지 확인
        const targetProduct = productsSnapshot.docs.find(doc => doc.id === 'SE2niktLz1IXGoFDaPaq');
      } catch (error) {
        console.error(`❌ ${categoryId} 상품 조회 실패:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ 카테고리 조회 실패:', error);
  }
}

checkProducts().catch(console.error);
