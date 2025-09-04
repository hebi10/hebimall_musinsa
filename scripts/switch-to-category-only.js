const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } = require('firebase/firestore');

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

async function switchToCategoryOnly() {
  console.log('🚀 카테고리 전용 구조로 전환\n');
  console.log('=' .repeat(60));

  try {
    // 1. 기존 products/ 컬렉션 확인
    console.log('\n📦 1. 기존 products/ 컬렉션 확인:');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.log(`   products/ 컬렉션: ${productsSnapshot.size}개 상품`);

    // 2. 카테고리별 상품 확인
    console.log('\n📁 2. 카테고리별 상품 확인:');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    let totalCategoryProducts = 0;
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const categoryData = categoryDoc.data();
      
      try {
        const categoryProductsSnapshot = await getDocs(
          collection(db, 'categories', categoryId, 'products')
        );
        totalCategoryProducts += categoryProductsSnapshot.size;
        console.log(`   categories/${categoryId}/products/: ${categoryProductsSnapshot.size}개 (${categoryData.name})`);
      } catch (error) {
        console.log(`   categories/${categoryId}/products/: 0개 (컬렉션 없음)`);
      }
    }

    console.log(`\n   📊 총 카테고리별 상품: ${totalCategoryProducts}개`);

    // 3. 기존 products/ 컬렉션 삭제 (선택사항)
    if (productsSnapshot.size > 0) {
      console.log('\n❓ 기존 products/ 컬렉션을 삭제하시겠습니까?');
      console.log('   (카테고리별 상품으로 완전히 전환)');
      
      // 삭제 실행
      console.log('\n🗑️  기존 products/ 컬렉션 삭제 중...');
      
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const productDoc of productsSnapshot.docs) {
        batch.delete(doc(db, 'products', productDoc.id));
        batchCount++;
        
        if (batchCount >= 400) {
          await batch.commit();
          console.log(`   ✅ ${batchCount}개 삭제 완료`);
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   ✅ 마지막 ${batchCount}개 삭제 완료`);
      }
      
      console.log('   🎉 products/ 컬렉션 삭제 완료!');
    }

    // 4. 최종 구조 확인
    console.log('\n✅ 4. 최종 구조 확인:');
    
    // products/ 컬렉션 다시 확인
    const finalProductsSnapshot = await getDocs(collection(db, 'products'));
    console.log(`   products/ 컬렉션: ${finalProductsSnapshot.size}개 (삭제됨)`);
    
    // 카테고리별 상품 다시 확인
    console.log('\n   📁 카테고리별 상품:');
    let finalTotalProducts = 0;
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const categoryData = categoryDoc.data();
      
      try {
        const categoryProductsSnapshot = await getDocs(
          collection(db, 'categories', categoryId, 'products')
        );
        finalTotalProducts += categoryProductsSnapshot.size;
        console.log(`      categories/${categoryId}/products/: ${categoryProductsSnapshot.size}개`);
      } catch (error) {
        console.log(`      categories/${categoryId}/products/: 0개`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 카테고리 전용 구조 전환 완료!');
    console.log('\n📊 최종 결과:');
    console.log(`   • 기존 products/ 컬렉션: 삭제됨`);
    console.log(`   • 카테고리별 상품: ${finalTotalProducts}개`);
    console.log('\n🚀 이제 다음과 같이 작동합니다:');
    console.log('   • 전체 상품 조회: 모든 카테고리에서 통합');
    console.log('   • 관리자 페이지: 카테고리별 상품으로 관리');
    console.log('   • 카테고리별 페이지: categories/{id}/products/ 에서 조회');
    console.log('   • 단일 DB 구조로 간소화됨');

  } catch (error) {
    console.error('\n❌ 전환 실패:', error);
  }
}

// 테스트 함수
async function testCategoryOnlyStructure() {
  console.log('\n🧪 카테고리 전용 구조 테스트:');
  
  try {
    // 모든 카테고리에서 상품 통합 조회 테스트
    const allProducts = [];
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      
      try {
        const categoryProductsSnapshot = await getDocs(
          collection(db, 'categories', categoryId, 'products')
        );
        
        categoryProductsSnapshot.docs.forEach(productDoc => {
          const productData = productDoc.data();
          allProducts.push({
            id: productDoc.id,
            name: productData.name,
            category: productData.category
          });
        });
        
      } catch (error) {
        console.warn(`   카테고리 ${categoryId} 조회 실패`);
      }
    }
    
    console.log(`   ✅ 통합 조회 성공: ${allProducts.length}개 상품`);
    
    // 처음 5개 상품 표시
    allProducts.slice(0, 5).forEach(product => {
      console.log(`      - ${product.name} (${product.category})`);
    });
    
  } catch (error) {
    console.error('   ❌ 테스트 실패:', error);
  }
}

// 실행
async function main() {
  await switchToCategoryOnly();
  await testCategoryOnlyStructure();
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}
