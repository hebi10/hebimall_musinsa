"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
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
  
  // UI 상태
  loading: boolean;
  error: string | null;
  
  // 액션
  loadProductReviews: (productId: string, reset?: boolean) => Promise<void>;
  loadMoreProductReviews: (productId: string) => Promise<void>;
  loadAllReviews: (rating?: number, sortBy?: 'latest' | 'rating' | 'helpful') => Promise<void>;
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
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상품별 리뷰 로드
  const loadProductReviews = useCallback(async (productId: string, reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const { reviews, hasMore, lastDoc: newLastDoc } = await ReviewService.getProductReviews(
        productId, 
        10, 
        reset ? undefined : lastDoc
      );

      if (reset) {
        setProductReviews(reviews);
      } else {
        setProductReviews(prev => [...prev, ...reviews]);
      }
      
      setHasMoreReviews(hasMore);
      setLastDoc(newLastDoc);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('상품 리뷰 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  // 더 많은 상품 리뷰 로드
  const loadMoreProductReviews = useCallback(async (productId: string) => {
    if (!hasMoreReviews || loading) return;
    
    await loadProductReviews(productId, false);
  }, [hasMoreReviews, loading, loadProductReviews]);

  // 모든 리뷰 로드
  const loadAllReviews = useCallback(async (rating?: number, sortBy: 'latest' | 'rating' | 'helpful' = 'latest') => {
    try {
      setLoading(true);
      setError(null);

      const reviews = await ReviewService.getAllReviews(20, rating, sortBy);
      setAllReviews(reviews);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '리뷰를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('전체 리뷰 로드 실패:', err);
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
