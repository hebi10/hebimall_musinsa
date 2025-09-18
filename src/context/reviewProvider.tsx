"use client";

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { ReviewService } from "@/shared/services/reviewService";
import { Review, ReviewSummary } from "@/shared/types/review";
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface ReviewContextType {
  // 상태
  productReviews: Review[];
  allReviews: Review[];
  currentReview: Review | null;
  reviewSummary: ReviewSummary | null;
  userReviews: Review[];
  
  // 페이지네이션
  hasMoreReviews: boolean;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  
  // 전체 통계
  reviewStatistics: {
    totalCount: number;
    averageRating: number;
    recommendationRate: number;
  };
  
  // UI 상태
  loading: boolean;
  error: string | null;
  
  // 액션
  loadProductReviews: (productId: string, reset?: boolean) => Promise<void>;
  loadMoreProductReviews: (productId: string) => Promise<void>;
  loadAllReviews: (page?: number, rating?: number, sortBy?: 'latest' | 'rating' | 'helpful') => Promise<void>;
  loadReviewSummary: (productId: string) => Promise<void>;
  loadUserReviews: (userId: string) => Promise<void>;
  createReview: (productId: string, review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Review>;
  updateReview: (productId: string, reviewId: string, updates: Partial<Omit<Review, 'id' | 'productId' | 'userId' | 'createdAt'>>) => Promise<Review>;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;
  clearReviews: () => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function useReview() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  // 상태
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  
  // 페이지네이션
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // 로딩 상태를 ref로 관리하여 클로저 문제 방지
  const isLoadingRef = useRef(false);
  const hasMoreReviewsRef = useRef(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  
  // 전체 통계
  const [reviewStatistics, setReviewStatistics] = useState({
    totalCount: 0,
    averageRating: 0,
    recommendationRate: 0
  });
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상품별 리뷰 로드
  const loadProductReviews = useCallback(async (productId: string, reset: boolean = true) => {
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const { reviews, hasMore, lastDoc: newLastDoc } = await ReviewService.getProductReviews(
        productId, 
        10, 
        reset ? undefined : lastDoc
      );

      if (reset) {
        setProductReviews(reviews);
        setLastDoc(newLastDoc);
        lastDocRef.current = newLastDoc;
      } else {
        setProductReviews(prev => [...prev, ...reviews]);
        setLastDoc(newLastDoc);
        lastDocRef.current = newLastDoc;
      }
      
      setHasMoreReviews(hasMore);
      hasMoreReviewsRef.current = hasMore;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('상품 리뷰 로드 실패:', err);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // 더 많은 상품 리뷰 로드
  const loadMoreProductReviews = useCallback(async (productId: string) => {
    // 이미 로딩 중이면 무시
    if (isLoadingRef.current) {
      console.log('🚫 이미 로딩 중이므로 요청 무시');
      return;
    }
    
    // 더 이상 로드할 리뷰가 없으면 무시
    if (!hasMoreReviewsRef.current) {
      console.log('🚫 더 이상 로드할 리뷰가 없음');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const { reviews, hasMore, lastDoc: newLastDoc } = await ReviewService.getProductReviews(
        productId, 
        10, 
        lastDocRef.current
      );

      setProductReviews(prev => [...prev, ...reviews]);
      setHasMoreReviews(hasMore);
      setLastDoc(newLastDoc);
      
      // ref도 업데이트
      hasMoreReviewsRef.current = hasMore;
      lastDocRef.current = newLastDoc;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '더 많은 리뷰를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('더 많은 상품 리뷰 로드 실패:', err);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // 모든 리뷰 로드
  const loadAllReviews = useCallback(async (
    page: number = 1,
    rating?: number,
    sortBy: 'latest' | 'rating' | 'helpful' = 'latest'
  ) => {
    try {
      console.log('🔄 ReviewProvider - loadAllReviews 시작:', { page, rating, sortBy });
      setLoading(true);
      setError(null);

      // 병렬로 리뷰 데이터와 통계 로드
      const [result, statistics] = await Promise.all([
        ReviewService.getAllReviews(page, 10, rating, sortBy),
        ReviewService.getReviewStatistics(rating)
      ]);

      console.log('✅ ReviewProvider - 리뷰 로드 완료:', result.reviews.length, '개');
      console.log('📊 페이지 정보:', { 
        currentPage: result.currentPage, 
        totalPages: result.totalPages, 
        totalCount: result.totalCount 
      });
      console.log('📈 통계 정보:', statistics);
      
      setAllReviews(result.reviews);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setReviewStatistics(statistics);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 불러오는데 실패했습니다.';
      console.error('❌ ReviewProvider - 전체 리뷰 로드 실패:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 리뷰 요약 정보 로드
  const loadReviewSummary = useCallback(async (productId: string) => {
    try {
      setError(null);

      const summary = await ReviewService.getReviewSummary(productId);
      setReviewSummary(summary);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰 요약 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('리뷰 요약 로드 실패:', err);
    }
  }, []);

  // 사용자 리뷰 로드
  const loadUserReviews = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const reviews = await ReviewService.getUserReviews(userId);
      setUserReviews(reviews);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 리뷰를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('사용자 리뷰 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 리뷰 생성
  const createReview = useCallback(async (productId: string, review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> => {
    try {
      setLoading(true);
      setError(null);

      const newReview = await ReviewService.createReview(productId, review);
      
      // 상품 리뷰 목록에 추가
      setProductReviews(prev => [newReview, ...prev]);
      
      // 리뷰 요약 다시 로드
      await loadReviewSummary(productId);

      return newReview;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 작성하는데 실패했습니다.';
      setError(errorMessage);
      console.error('리뷰 생성 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReviewSummary]);

  // 리뷰 수정
  const updateReview = useCallback(async (productId: string, reviewId: string, updates: Partial<Omit<Review, 'id' | 'productId' | 'userId' | 'createdAt'>>): Promise<Review> => {
    try {
      setLoading(true);
      setError(null);

      const updatedReview = await ReviewService.updateReview(productId, reviewId, updates);
      
      // 상품 리뷰 목록 업데이트
      setProductReviews(prev => prev.map(review => 
        review.id === reviewId ? updatedReview : review
      ));
      
      // 전체 리뷰 목록 업데이트
      setAllReviews(prev => prev.map(review => 
        review.id === reviewId ? updatedReview : review
      ));

      return updatedReview;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 수정하는데 실패했습니다.';
      setError(errorMessage);
      console.error('리뷰 수정 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 리뷰 삭제
  const deleteReview = useCallback(async (productId: string, reviewId: string) => {
    try {
      setLoading(true);
      setError(null);

      await ReviewService.deleteReview(productId, reviewId);
      
      // 상품 리뷰 목록에서 제거
      setProductReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // 전체 리뷰 목록에서 제거
      setAllReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // 리뷰 요약 다시 로드
      await loadReviewSummary(productId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 삭제하는데 실패했습니다.';
      setError(errorMessage);
      console.error('리뷰 삭제 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReviewSummary]);

  // 리뷰 데이터 초기화
  const clearReviews = useCallback(() => {
    setProductReviews([]);
    setAllReviews([]);
    setCurrentReview(null);
    setReviewSummary(null);
    setUserReviews([]);
    setHasMoreReviews(false);
    setLastDoc(undefined);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
    setReviewStatistics({
      totalCount: 0,
      averageRating: 0,
      recommendationRate: 0
    });
    setError(null);
  }, []);

  const value: ReviewContextType = {
    // 상태
    productReviews,
    allReviews,
    currentReview,
    reviewSummary,
    userReviews,
    
    // 페이지네이션
    hasMoreReviews,
    lastDoc,
    currentPage,
    totalPages,
    totalCount,
    
    // 전체 통계
    reviewStatistics,
    
    // UI 상태
    loading,
    error,
    
    // 액션
    loadProductReviews,
    loadMoreProductReviews,
    loadAllReviews,
    loadReviewSummary,
    loadUserReviews,
    createReview,
    updateReview,
    deleteReview,
    clearReviews,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}
