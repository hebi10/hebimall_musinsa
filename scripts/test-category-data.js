const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function testCategoryProducts() {
  console.log('🧪 카테고리별 상품 데이터 테스트\n');
  console.log('=' .repeat(60));

  const categories = ['tops', 'bottoms', 'shoes', 'bags', 'accessories'];
  
  for (const categoryId of categories) {
    try {
      console.log(`\n📂 ${categoryId} 카테고리:`);
      
      const categoryProductsSnapshot = await getDocs(
        collection(db, 'categories', categoryId, 'products')
      );
      
      const products = [];
      categoryProductsSnapshot.docs.forEach(productDoc => {
        const productData = productDoc.data();
        products.push({
          id: productDoc.id,
          name: productData.name,
          price: productData.price,
          brand: productData.brand,
          rating: productData.rating,
          reviewCount: productData.reviewCount,
          mainImage: productData.mainImage ? '이미지 있음' : '이미지 없음'
        });
      });
      
      console.log(`   총 상품 수: ${products.length}개`);
      
      if (products.length > 0) {
        console.log('   샘플 상품:');
        products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ${product.price.toLocaleString()}원`);
          console.log(`      브랜드: ${product.brand || '미지정'}, 평점: ${product.rating || 0}, 리뷰: ${product.reviewCount || 0}`);
          console.log(`      이미지: ${product.mainImage}`);
        });
      }
      
      console.log(`   ✅ URL: /categories/${categoryId}`);
      
    } catch (error) {
      console.log(`   ❌ 오류: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 테스트 완료!');
  console.log('\n📌 확인 사항:');
  console.log('   1. 각 카테고리별 상품 데이터 존재 확인');
  console.log('   2. 상품 정보 (이름, 가격, 브랜드 등) 확인');
  console.log('   3. 이미지 데이터 존재 여부 확인');
  console.log('   4. URL 패턴 확인');
  
  console.log('\n🚀 이제 브라우저에서 테스트 가능:');
  console.log('   • /categories/shoes - 신발 카테고리');
  console.log('   • /categories/tops - 상의 카테고리');
  console.log('   • /categories/bottoms - 하의 카테고리');
  console.log('   • /categories/bags - 가방 카테고리');
  console.log('   • /categories/accessories - 액세서리 카테고리');
  
  process.exit(0);
}

testCategoryProducts().catch(console.error);
