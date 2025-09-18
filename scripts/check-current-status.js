const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'hebimall-c7c90'
  });
}

const db = admin.firestore();

async function checkCurrentStatus() {
  try {
    console.log('🔍 현재 상품 및 리뷰 현황 확인...\n');
    
    // 전체 상품 수 확인
    const categoriesSnapshot = await db.collection('categories').get();
    let totalProducts = 0;
    const categoryProducts = {};
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const productsSnapshot = await db.collection('categories').doc(categoryDoc.id).collection('products').get();
      console.log(`📁 ${categoryDoc.id}: ${productsSnapshot.size}개 상품`);
      totalProducts += productsSnapshot.size;
      categoryProducts[categoryDoc.id] = productsSnapshot.size;
    }
    
    // 전체 리뷰 수 확인
    const reviewsSnapshot = await db.collection('reviews').get();
    
    // 상품별 리뷰 수 확인 (샘플)
    const reviewsByProduct = {};
    reviewsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (reviewsByProduct[data.productId]) {
        reviewsByProduct[data.productId]++;
      } else {
        reviewsByProduct[data.productId] = 1;
      }
    });
    
    const productsWithReviews = Object.keys(reviewsByProduct).length;
    const avgReviewsPerProduct = reviewsSnapshot.size / totalProducts;
    
    console.log(`\n📊 현재 현황:`);
    console.log(`  - 전체 상품: ${totalProducts}개`);
    console.log(`  - 전체 리뷰: ${reviewsSnapshot.size}개`);
    console.log(`  - 리뷰가 있는 상품: ${productsWithReviews}개`);
    console.log(`  - 상품당 평균 리뷰: ${avgReviewsPerProduct.toFixed(1)}개`);
    
    // 리뷰 분포 확인
    const reviewCounts = Object.values(reviewsByProduct);
    const maxReviews = Math.max(...reviewCounts);
    const minReviews = Math.min(...reviewCounts);
    
    console.log(`\n📈 리뷰 분포:`);
    console.log(`  - 최대 리뷰 수: ${maxReviews}개`);
    console.log(`  - 최소 리뷰 수: ${minReviews}개`);
    
    // 10개 추가 시 예상 총량
    const expectedNewReviews = totalProducts * 10;
    const expectedTotalReviews = reviewsSnapshot.size + expectedNewReviews;
    
    console.log(`\n🎯 10개씩 추가 시 예상:`);
    console.log(`  - 추가될 리뷰: ${expectedNewReviews}개`);
    console.log(`  - 예상 총 리뷰: ${expectedTotalReviews}개`);
    console.log(`  - 상품당 예상 리뷰: ${(expectedTotalReviews / totalProducts).toFixed(1)}개`);
    
  } catch (error) {
    console.error('❌ 현황 확인 실패:', error);
  }
}

checkCurrentStatus();