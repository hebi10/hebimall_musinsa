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

async function debugProduct() {
  const targetProductId = 'ChZAjtmcPliuFmEVQ7XT';
  
  console.log(`🔍 상품 ID: ${targetProductId} 디버깅 시작...`);
  console.log('=' * 50);
  
  try {
    // 1. 모든 카테고리에서 상품 검색
    console.log('📂 모든 카테고리에서 검색 중...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    let foundProduct = null;
    let foundInCategory = null;
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      console.log(`   카테고리: ${categoryId}`);
      
      try {
        const productRef = doc(db, 'categories', categoryId, 'products', targetProductId);
        const snapshot = await getDoc(productRef);
        
        if (snapshot.exists()) {
          foundProduct = snapshot.data();
          foundInCategory = categoryId;
          console.log(`   ✅ 찾음! categories/${categoryId}/products/${targetProductId}`);
          break;
        } else {
          console.log(`   ❌ 없음`);
        }
      } catch (error) {
        console.log(`   ⚠️ 오류: ${error.message}`);
      }
    }
    
    if (foundProduct) {
      console.log('\n📋 상품 정보:');
      console.log(`   이름: ${foundProduct.name}`);
      console.log(`   카테고리: ${foundProduct.category}`);
      console.log(`   브랜드: ${foundProduct.brand}`);
      console.log(`   가격: ${foundProduct.price}`);
      console.log(`   생성일: ${foundProduct.createdAt?.toDate?.() || foundProduct.createdAt}`);
    } else {
      console.log('\n❌ 상품을 찾을 수 없습니다!');
      
      // 2. 모든 상품 목록에서 확인
      console.log('\n📋 모든 상품 목록 확인...');
      let allProducts = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        try {
          const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
          console.log(`   categories/${categoryId}/products: ${productsSnapshot.size}개`);
          
          productsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            allProducts.push({
              id: doc.id,
              name: data.name,
              category: categoryId,
              actualCategory: data.category
            });
            
            if (doc.id === targetProductId) {
              console.log(`   🎯 타겟 상품 발견: ${data.name}`);
            }
          });
        } catch (error) {
          console.log(`   ⚠️ ${categoryId} 조회 실패: ${error.message}`);
        }
      }
      
      console.log(`\n📊 총 상품 수: ${allProducts.length}개`);
      
      // 타겟 ID와 비슷한 상품 찾기
      const similarProducts = allProducts.filter(p => 
        p.id.includes(targetProductId.substring(0, 5)) || 
        targetProductId.includes(p.id.substring(0, 5))
      );
      
      if (similarProducts.length > 0) {
        console.log('\n🔍 비슷한 ID 상품들:');
        similarProducts.forEach(p => {
          console.log(`   ${p.id} - ${p.name} (${p.category})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 디버깅 실패:', error);
  }
}

debugProduct().catch(console.error);
