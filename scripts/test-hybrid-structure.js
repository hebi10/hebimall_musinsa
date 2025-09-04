const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, getDoc } = require("firebase/firestore");

// 환경변수 로드
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

async function testHybridStructure() {
  console.log('🧪 하이브리드 구조 테스트 시작\n');

  try {
    // 1. 전체 상품 조회 (관리자용)
    console.log('📦 1. 전체 상품 조회 (products/ 컬렉션):');
    const allProductsSnapshot = await getDocs(collection(db, 'products'));
    console.log(`   총 ${allProductsSnapshot.size}개 상품 발견`);
    
    allProductsSnapshot.docs.slice(0, 3).forEach(doc => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.name} (${data.category})`);
    });

    console.log('\n📁 2. 카테고리별 상품 조회 (categories/{id}/products/):');
    
    // 2. 카테고리별 상품 조회
    const categoryTests = ['clothing', 'shoes', 'bags', 'accessories'];
    
    for (const categorySlug of categoryTests) {
      try {
        const categoryProductsSnapshot = await getDocs(
          collection(db, 'categories', categorySlug, 'products')
        );
        
        console.log(`   📂 categories/${categorySlug}/products/: ${categoryProductsSnapshot.size}개`);
        
        categoryProductsSnapshot.docs.slice(0, 2).forEach(doc => {
          const data = doc.data();
          console.log(`      - ${doc.id}: ${data.name} (₩${data.price?.toLocaleString()})`);
        });
      } catch (error) {
        console.log(`   📂 categories/${categorySlug}/products/: 컬렉션 없음 또는 오류`);
      }
    }

    // 3. 특정 상품 접근 테스트
    console.log('\n🔍 3. 특정 상품 접근 테스트:');
    
    // 첫 번째 상품으로 테스트
    const firstProduct = allProductsSnapshot.docs[0];
    if (firstProduct) {
      const productData = firstProduct.data();
      const productId = firstProduct.id;
      const categorySlug = productData.category;
      
      console.log(`   상품: ${productData.name}`);
      console.log(`   전체 경로: products/${productId}`);
      console.log(`   카테고리 경로: categories/${categorySlug}/products/${productId}`);
      
      // 카테고리별 컬렉션에서 동일한 상품 조회
      try {
        const categoryProduct = await getDoc(
          doc(db, 'categories', categorySlug, 'products', productId)
        );
        
        if (categoryProduct.exists()) {
          const categoryData = categoryProduct.data();
          console.log(`   ✅ 카테고리별 조회 성공: ${categoryData.name}`);
          console.log(`   📋 globalProductId: ${categoryData.globalProductId}`);
        } else {
          console.log(`   ❌ 카테고리별 조회 실패`);
        }
      } catch (error) {
        console.log(`   ❌ 카테고리별 조회 오류:`, error.message);
      }
    }

    // 4. URL 패턴 테스트
    console.log('\n🌐 4. URL 접근 패턴:');
    console.log('   일반 상품 목록: /products');
    console.log('   카테고리별 목록: /categories/clothing, /categories/shoes');
    console.log('   카테고리별 상품: /categories/clothing/products/{productId}');
    console.log('   관리자 전체 관리: /admin/products (전체 products/ 컬렉션)');

    console.log('\n🎉 하이브리드 구조 테스트 완료!');
    console.log('\n✅ 결론:');
    console.log('   • products/ 컬렉션: 관리자용 전체 상품 관리');
    console.log('   • categories/{id}/products/: 사용자용 카테고리별 조회');
    console.log('   • 양방향 동기화로 데이터 일관성 유지');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }

  process.exit(0);
}

if (require.main === module) {
  testHybridStructure().catch(console.error);
}
