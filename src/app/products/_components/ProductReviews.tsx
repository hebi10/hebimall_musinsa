'use client';

import React, { useEffect, useState } from 'react';
import { useReview } from '@/context/reviewProvider';
import { useAuth } from '@/context/authProvider';
import { Review } from '@/shared/types/review';
import styles from './ProductReviews.module.css';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { 
    productReviews, 
    reviewSummary, 
    hasMoreReviews,
    loading, 
    error,
    loadProductReviews,
    loadMoreProductReviews,
    loadReviewSummary,
    createReview,
    deleteReview
  } = useReview();
  
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    size: '',
    color: '',
    isRecommended: true
  });

  useEffect(() => {
    loadProductReviews(productId);
    loadReviewSummary(productId);
  }, [productId, loadProductReviews, loadReviewSummary]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await createReview(productId, {
        ...reviewForm,
        productId,
        userId: user.uid,
        userName: user.displayName || '익명',
        images: [] // 이미지 업로드 기능은 추후 구현
      });
      
      setShowReviewForm(false);
      setReviewForm({
        rating: 5,
        title: '',
        content: '',
        size: '',
        color: '',
        isRecommended: true
      });
      
      alert('리뷰가 등록되었습니다.');
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteReview(productId, reviewId);
      alert('리뷰가 삭제되었습니다.');
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>상품 리뷰</h3>
        {user && (
          <button 
            className={styles.writeButton}
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* 리뷰 요약 */}
      {reviewSummary && (
        <div className={styles.summary}>
          <div className={styles.averageRating}>
            <span className={styles.rating}>{reviewSummary.averageRating}</span>
            <span className={styles.stars}>{renderStars(Math.round(reviewSummary.averageRating))}</span>
            <span className={styles.count}>({reviewSummary.totalReviews}개 리뷰)</span>
          </div>
          
          <div className={styles.distribution}>
            {Object.entries(reviewSummary.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className={styles.ratingBar}>
                  <span>{rating}점</span>
                  <div className={styles.bar}>
                    <div 
                      className={styles.fill}
                      style={{ 
                        width: `${reviewSummary.totalReviews > 0 ? (count / reviewSummary.totalReviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span>{count}</span>
                </div>
              ))}
          </div>
          
          <div className={styles.recommendation}>
            추천율: {reviewSummary.recommendationRate}%
          </div>
        </div>
      )}

      {/* 리뷰 작성 폼 */}
      {showReviewForm && (
        <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
          <div className={styles.formGroup}>
            <label>평점</label>
            <select 
              value={reviewForm.rating}
              onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>
                  {renderStars(rating)} ({rating}점)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>제목</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="리뷰 제목을 입력하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>내용</label>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="리뷰 내용을 입력하세요"
              rows={5}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>사이즈</label>
              <input
                type="text"
                value={reviewForm.size}
                onChange={(e) => setReviewForm(prev => ({ ...prev, size: e.target.value }))}
                placeholder="예: M, L, 250"
              />
            </div>

            <div className={styles.formGroup}>
              <label>색상</label>
              <input
                type="text"
                value={reviewForm.color}
                onChange={(e) => setReviewForm(prev => ({ ...prev, color: e.target.value }))}
                placeholder="예: 블랙, 화이트"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={reviewForm.isRecommended}
                onChange={(e) => setReviewForm(prev => ({ ...prev, isRecommended: e.target.checked }))}
              />
              이 상품을 추천합니다
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowReviewForm(false)}>
              취소
            </button>
            <button type="submit" disabled={loading}>
              {loading ? '등록 중...' : '리뷰 등록'}
            </button>
          </div>
        </form>
      )}

      {/* 리뷰 목록 */}
      <div className={styles.reviewList}>
        {loading && productReviews.length === 0 ? (
          <div className={styles.loading}>리뷰를 불러오는 중...</div>
        ) : productReviews.length === 0 ? (
          <div className={styles.empty}>아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</div>
        ) : (
          <>
            {productReviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{review.userName}</span>
                    <span className={styles.rating}>{renderStars(review.rating)}</span>
                    {review.isRecommended && (
                      <span className={styles.recommended}>추천</span>
                    )}
                  </div>
                  <div className={styles.reviewMeta}>
                    <span className={styles.date}>
                      {review.createdAt.toLocaleDateString()}
                    </span>
                    {user?.uid === review.userId && (
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.reviewContent}>
                  <h4 className={styles.reviewTitle}>{review.title}</h4>
                  <p className={styles.reviewText}>{review.content}</p>
                  
                  {(review.size || review.color) && (
                    <div className={styles.productInfo}>
                      {review.size && <span>사이즈: {review.size}</span>}
                      {review.color && <span>색상: {review.color}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {hasMoreReviews && (
              <button 
                className={styles.loadMoreButton}
                onClick={() => loadMoreProductReviews(productId)}
                disabled={loading}
              >
                {loading ? '로딩 중...' : '더 보기'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
