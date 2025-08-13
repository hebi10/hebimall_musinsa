import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

/**
 * 상품의 리뷰 개수와 평점을 Firebase에서 실제 리뷰 데이터를 기반으로 동기화
 */
export async function syncProductReviewData(productId: string): Promise<{ reviewCount: number; rating: number }> {
  try {
    // Firebase에서 해당 상품의 모든 리뷰 조회
    const reviewsCollection = collection(db, 'reviews');
    const reviewQuery = query(reviewsCollection, where('productId', '==', productId));
    const snapshot = await getDocs(reviewQuery);
    
    if (snapshot.empty) {
      return { reviewCount: 0, rating: 0 };
    }
    
    const reviews = snapshot.docs.map(doc => doc.data());
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = Math.round((totalRating / reviewCount) * 10) / 10; // 소수점 1자리
    
    console.log(`📊 상품 ${productId} 리뷰 동기화: ${reviewCount}개, 평점 ${averageRating}`);
    
    return { reviewCount, rating: averageRating };
  } catch (error) {
    console.error('리뷰 데이터 동기화 실패:', error);
    return { reviewCount: 0, rating: 0 };
  }
}

/**
 * 모든 상품의 리뷰 개수와 평점을 일괄 동기화
 */
export async function syncAllProductsReviewData(): Promise<void> {
  try {
    console.log('🔄 모든 상품의 리뷰 데이터 동기화 시작...');
    
    // 모든 리뷰 가져오기
    const reviewsCollection = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsCollection);
    
    // 상품별로 리뷰 그룹화
    const productReviews: { [productId: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
      const review = doc.data();
      if (review.productId) {
        if (!productReviews[review.productId]) {
          productReviews[review.productId] = [];
        }
        productReviews[review.productId].push(review);
      }
    });
    
    // 각 상품별로 통계 계산 및 업데이트
    const updatePromises = Object.entries(productReviews).map(async ([productId, reviews]) => {
      const reviewCount = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = Math.round((totalRating / reviewCount) * 10) / 10;
      
      // 상품 문서 업데이트 (여러 카테고리에 있을 수 있으므로 모든 카테고리에서 찾아서 업데이트)
      const categories = ['clothing', 'shoes', 'bags', 'jewelry', 'accessories', 'outdoor', 'sports'];
      
      for (const category of categories) {
        try {
          const productDoc = doc(db, 'categories', category, 'products', productId);
          await updateDoc(productDoc, {
            reviewCount,
            rating: averageRating,
            updatedAt: new Date()
          });
          console.log(`✅ 상품 ${productId} (${category}) 업데이트: ${reviewCount}개 리뷰, 평점 ${averageRating}`);
          break; // 첫 번째 찾은 카테고리에서만 업데이트
        } catch (error) {
          // 해당 카테고리에 상품이 없으면 계속 진행
        }
      }
    });
    
    await Promise.all(updatePromises);
    console.log('✅ 모든 상품의 리뷰 데이터 동기화 완료');
    
  } catch (error) {
    console.error('❌ 리뷰 데이터 동기화 실패:', error);
  }
}

/**
 * 특정 상품의 리뷰 개수와 평점을 실시간으로 가져오기
 */
export async function getProductReviewStats(productId: string): Promise<{ reviewCount: number; rating: number }> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const reviewQuery = query(reviewsCollection, where('productId', '==', productId));
    const snapshot = await getDocs(reviewQuery);
    
    if (snapshot.empty) {
      return { reviewCount: 0, rating: 0 };
    }
    
    const reviews = snapshot.docs.map(doc => doc.data());
    const reviewCount = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = Math.round((totalRating / reviewCount) * 10) / 10;
    
    return { reviewCount, rating: averageRating };
  } catch (error) {
    console.error('리뷰 통계 조회 실패:', error);
    return { reviewCount: 0, rating: 0 };
  }
}
