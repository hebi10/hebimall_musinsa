import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Review, ReviewSummary } from '@/shared/types/review';

export class ReviewService {
  // 리뷰 컬렉션 경로: reviews/{productId}
  private static getReviewsCollectionPath(productId: string) {
    return `reviews`;
  }

  // 리뷰 생성
  static async createReview(productId: string, review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      
      const reviewData = {
        ...review,
        productId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(reviewsCollection, reviewData);
      
      const createdReview: Review = {
        id: docRef.id,
        ...review,
        productId,
        createdAt: reviewData.createdAt.toDate(),
        updatedAt: reviewData.updatedAt.toDate()
      };

      console.log(`✅ 리뷰 생성 완료 - 상품: ${productId}, 리뷰: ${docRef.id}`);
      return createdReview;

    } catch (error) {
      console.error('리뷰 생성 실패:', error);
      throw new Error('리뷰를 생성하는데 실패했습니다.');
    }
  }

  // 상품별 리뷰 조회
  static async getProductReviews(
    productId: string, 
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ reviews: Review[], hasMore: boolean, lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      
      let reviewQuery = query(
        reviewsCollection,
        where('productId', '==', productId),
        limit(pageSize)
      );

      if (lastDoc) {
        reviewQuery = query(reviewQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(reviewQuery);
      
      const reviews: Review[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          size: data.size,
          color: data.color,
          height: data.height,
          weight: data.weight,
          isRecommended: data.isRecommended,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      const hasMore = snapshot.docs.length === pageSize;
      const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : undefined;

      return { reviews, hasMore, lastDoc: newLastDoc };

    } catch (error) {
      console.error('상품 리뷰 조회 실패:', error);
      throw new Error('상품 리뷰를 불러오는데 실패했습니다.');
    }
  }

  // 전체 리뷰 통계 조회
  static async getReviewStatistics(rating?: number): Promise<{
    totalCount: number;
    averageRating: number;
    recommendationRate: number;
  }> {
    try {
      console.log('🔄 ReviewService.getReviewStatistics 시작:', { rating });
      
      const reviewsCollection = collection(db, 'reviews');
      let reviewQuery = query(reviewsCollection);
      
      // 평점 필터 (통계에도 적용)
      if (rating) {
        reviewQuery = query(reviewQuery, where('rating', '==', rating));
      }

      const snapshot = await getDocs(reviewQuery);
      const reviews = snapshot.docs.map(doc => doc.data());
      
      const totalCount = reviews.length;
      const averageRating = totalCount > 0 
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalCount
        : 0;
      const recommendationRate = totalCount > 0 
        ? (reviews.filter(review => review.isRecommended).length / totalCount) * 100
        : 0;

      console.log('✅ ReviewService.getReviewStatistics 완료:', { totalCount, averageRating, recommendationRate });
      
      return {
        totalCount,
        averageRating: Math.round(averageRating * 10) / 10, // 소수점 첫째자리까지
        recommendationRate: Math.round(recommendationRate)
      };

    } catch (error) {
      console.error('❌ ReviewService.getReviewStatistics 실패:', error);
      return {
        totalCount: 0,
        averageRating: 0,
        recommendationRate: 0
      };
    }
  }

  // 전체 리뷰 개수 조회
  static async getTotalReviewsCount(rating?: number): Promise<number> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      let reviewQuery = query(reviewsCollection);
      
      // 평점 필터
      if (rating) {
        reviewQuery = query(reviewQuery, where('rating', '==', rating));
      }

      const snapshot = await getDocs(reviewQuery);
      return snapshot.size;

    } catch (error) {
      console.error('전체 리뷰 개수 조회 실패:', error);
      return 0;
    }
  }

  // 모든 리뷰 조회 (리뷰 페이지용) - 페이징 지원
  static async getAllReviews(
    page: number = 1,
    pageSize: number = 10,
    rating?: number,
    sortBy: 'latest' | 'rating' | 'helpful' = 'latest'
  ): Promise<{ reviews: Review[]; totalCount: number; totalPages: number; currentPage: number }> {
    try {
      console.log('🔄 ReviewService.getAllReviews 시작:', { page, pageSize, rating, sortBy });
      
      // 총 개수 조회
      const totalCount = await this.getTotalReviewsCount(rating);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      console.log('📊 총 리뷰 개수:', totalCount, '/ 총 페이지:', totalPages);
      
      const reviewsCollection = collection(db, 'reviews');
      let reviewQuery = query(reviewsCollection);
      
      // 평점 필터
      if (rating) {
        console.log('📊 평점 필터 적용:', rating);
        reviewQuery = query(reviewQuery, where('rating', '==', rating));
      }
      
      // 단순한 정렬만 사용 (복합 인덱스 문제 방지)
      switch (sortBy) {
        case 'rating':
          console.log('📈 평점순 정렬 적용');
          reviewQuery = query(reviewQuery, orderBy('rating', 'desc'));
          break;
        case 'helpful':
        case 'latest':
        default:
          console.log('⏰ 정렬 없이 가져오기 (인덱스 생성 완료 전까지)');
          // 임시로 정렬 없이 가져오기 (인덱스 생성 완료 전까지)
          break;
      }
      
      // 페이징 적용
      const offset = (page - 1) * pageSize;
      reviewQuery = query(reviewQuery, limit(pageSize + offset)) as any;

      console.log('📋 Firestore 쿼리 실행...');
      const snapshot = await getDocs(reviewQuery);
      console.log('📊 Firestore 응답:', snapshot.size, '개 문서');
      
      // 페이지에 맞는 데이터만 추출
      const allDocs = snapshot.docs.slice(offset);
      
      const reviews: Review[] = allDocs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          size: data.size,
          color: data.color,
          height: data.height,
          weight: data.weight,
          isRecommended: data.isRecommended,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      // 클라이언트에서 sortBy 적용
      if (sortBy === 'latest') {
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (sortBy === 'helpful') {
        // 현재 Review 타입에 helpfulCount가 없으므로 rating으로 대체
        reviews.sort((a, b) => b.rating - a.rating);
      }

      console.log(`✅ ReviewService.getAllReviews 완료: ${reviews.length}개`);
      
      return {
        reviews,
        totalCount,
        totalPages,
        currentPage: page
      };

    } catch (error) {
      console.error('❌ ReviewService.getAllReviews 실패:', error);
      // 에러 시 빈 결과 반환
      console.warn('⚠️ 임시로 빈 결과를 반환합니다.');
      return {
        reviews: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      };
    }
  }

  // 리뷰 수정
  static async updateReview(productId: string, reviewId: string, updates: Partial<Omit<Review, 'id' | 'productId' | 'userId' | 'createdAt'>>): Promise<Review> {
    try {
      const reviewDoc = doc(db, 'reviews', reviewId);
      
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(reviewDoc, updateData);
      
      // 업데이트된 리뷰 조회
      const updatedDoc = await getDoc(reviewDoc);
      if (!updatedDoc.exists()) {
        throw new Error('업데이트된 리뷰를 찾을 수 없습니다.');
      }

      const data = updatedDoc.data();
      const updatedReview: Review = {
        id: updatedDoc.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        title: data.title,
        content: data.content,
        images: data.images || [],
        size: data.size,
        color: data.color,
        height: data.height,
        weight: data.weight,
        isRecommended: data.isRecommended,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };

      return updatedReview;

    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      throw new Error('리뷰를 수정하는데 실패했습니다.');
    }
  }

  // 리뷰 삭제
  static async deleteReview(productId: string, reviewId: string): Promise<void> {
    try {
      const reviewDoc = doc(db, 'reviews', reviewId);
      await deleteDoc(reviewDoc);
      
      console.log(`✅ 리뷰 삭제 완료 - 상품: ${productId}, 리뷰: ${reviewId}`);

    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      throw new Error('리뷰를 삭제하는데 실패했습니다.');
    }
  }

  // 상품 리뷰 요약 정보 조회
  static async getReviewSummary(productId: string): Promise<ReviewSummary> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      const reviewQuery = query(reviewsCollection, where('productId', '==', productId));
      const snapshot = await getDocs(reviewQuery);
      
      if (snapshot.empty) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recommendationRate: 0
        };
      }

      const reviews = snapshot.docs.map(doc => doc.data());
      const totalReviews = reviews.length;
      
      // 평점 분포 계산
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;
      let recommendedCount = 0;

      reviews.forEach(review => {
        const rating = review.rating as keyof typeof ratingDistribution;
        ratingDistribution[rating]++;
        totalRating += review.rating;
        if (review.isRecommended) recommendedCount++;
      });

      const averageRating = totalRating / totalReviews;
      const recommendationRate = (recommendedCount / totalReviews) * 100;

      return {
        averageRating: Math.round(averageRating * 10) / 10, // 소수점 1자리
        totalReviews,
        ratingDistribution,
        recommendationRate: Math.round(recommendationRate)
      };

    } catch (error) {
      console.error('리뷰 요약 조회 실패:', error);
      throw new Error('리뷰 요약 정보를 불러오는데 실패했습니다.');
    }
  }

  // 사용자별 리뷰 조회
  static async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      
      const reviewQuery = query(
        reviewsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(reviewQuery);
      
      const reviews: Review[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          size: data.size,
          color: data.color,
          height: data.height,
          weight: data.weight,
          isRecommended: data.isRecommended,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      return reviews;

    } catch (error) {
      console.error('사용자 리뷰 조회 실패:', error);
      throw new Error('사용자 리뷰를 불러오는데 실패했습니다.');
    }
  }
}
