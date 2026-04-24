const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDKDhqcjF1Kbr86rdGJGFDXJgFLcKePxBo",
  authDomain: "hebimall-c7c90.firebaseapp.com",
  projectId: "hebimall-c7c90",
  storageBucket: "hebimall-c7c90.firebasestorage.app",
  messagingSenderId: "511812086460",
  appId: "1:511812086460:web:86b0c2c5d3e0c89dcbfdbc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCurrentStatus() {
  try {
    console.log('🔍 현재 상품 및 리뷰 현황 확인...\n');
    
    // 전체 상품 수 확인
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    let totalProducts = 0;
    const categoryProducts = {};
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const productsSnapshot = await getDocs(collection(db, 'categories', categoryDoc.id, 'products'));
      console.log(` ${categoryDoc.id}: ${productsSnapshot.size}개 상품`);
      totalProducts += productsSnapshot.size;
      categoryProducts[categoryDoc.id] = productsSnapshot.size;
    }
    
    // 전체 리뷰 수 확인
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    
    // 상품별 리뷰 수 확인
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
    
    console.log(`\n현재 현황:`);
    console.log(`  - 전체 상품: ${totalProducts}개`);
    console.log(`  - 전체 리뷰: ${reviewsSnapshot.size}개`);
    console.log(`  - 리뷰가 있는 상품: ${productsWithReviews}개`);
    console.log(`  - 상품당 평균 리뷰: ${avgReviewsPerProduct.toFixed(1)}개`);
    
    // 리뷰 분포 확인
    if (Object.keys(reviewsByProduct).length > 0) {
      const reviewCounts = Object.values(reviewsByProduct);
      const maxReviews = Math.max(...reviewCounts);
      const minReviews = Math.min(...reviewCounts);
      
      console.log(`\n📈 리뷰 분포:`);
      console.log(`  - 최대 리뷰 수: ${maxReviews}개`);
      console.log(`  - 최소 리뷰 수: ${minReviews}개`);
    }
    
    // 10개 추가 시 예상 총량
    const expectedNewReviews = totalProducts * 10;
    const expectedTotalReviews = reviewsSnapshot.size + expectedNewReviews;
    
    console.log(`\n🎯 10개씩 추가 시 예상:`);
    console.log(`  - 추가될 리뷰: ${expectedNewReviews}개`);
    console.log(`  - 예상 총 리뷰: ${expectedTotalReviews}개`);
    console.log(`  - 상품당 예상 리뷰: ${(expectedTotalReviews / totalProducts).toFixed(1)}개`);
    
    return { totalProducts, currentReviews: reviewsSnapshot.size };
    
  } catch (error) {
    console.error('❌ 현황 확인 실패:', error);
    return null;
  }
}

checkCurrentStatus();