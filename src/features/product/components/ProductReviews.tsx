'use client';

import { useState } from 'react';
import { Review, ReviewSummary } from '@/shared/types/review';
import Button from '@/shared/components/Button';
import styles from './ProductReviews.module.css';

interface Props {
  productId: string;
}

// Mock 데이터
const mockReviewSummary: ReviewSummary = {
  averageRating: 4.5,
  totalReviews: 128,
  ratingDistribution: {
    5: 80,
    4: 30,
    3: 12,
    2: 4,
    1: 2
  },
  recommendationRate: 92
};

const mockReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    userName: '김**',
    rating: 5,
    title: '정말 만족합니다!',
    content: '소재도 좋고 핏도 완벽해요. 배송도 빨라서 좋았습니다.',
    images: [],
    size: 'M',
    color: 'black',
    height: 170,
    weight: 65,
    isRecommended: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'review-2',
    productId: 'product-1',
    userId: 'user-2',
    userName: '이**',
    rating: 4,
    title: '괜찮아요',
    content: '생각보다 얇은 느낌이지만 여름용으로는 좋을 것 같아요.',
    images: [],
    size: 'L',
    color: 'white',
    isRecommended: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

export default function ProductReviews({ productId }: Props) {
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'helpful'>('latest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = mockReviews.filter(review => 
    filterRating === null || review.rating === filterRating
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'latest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className={styles.container}>
      {/* 리뷰 요약 */}
      <div className={styles.summary}>
        <div className={styles.ratingOverview}>
          <div className={styles.averageRating}>
            <span className={styles.ratingNumber}>{mockReviewSummary.averageRating}</span>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < Math.floor(mockReviewSummary.averageRating) ? styles.filled : styles.empty}>
                  ★
                </span>
              ))}
            </div>
            <span className={styles.totalReviews}>
              총 {mockReviewSummary.totalReviews}개 리뷰
            </span>
          </div>

          <div className={styles.ratingDistribution}>
            {Object.entries(mockReviewSummary.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className={styles.ratingBar}>
                  <span className={styles.ratingLabel}>{rating}점</span>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar}
                      style={{ 
                        width: `${(count / mockReviewSummary.totalReviews) * 100}%` 
                      }}
                    />
                  </div>
                  <span className={styles.ratingCount}>{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className={styles.recommendation}>
          <div className={styles.recommendationRate}>
            {mockReviewSummary.recommendationRate}%
          </div>
          <div className={styles.recommendationText}>
            구매자가 추천합니다
          </div>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filterRating === null ? styles.active : ''}`}
            onClick={() => setFilterRating(null)}
          >
            전체
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              className={`${styles.filterButton} ${filterRating === rating ? styles.active : ''}`}
              onClick={() => setFilterRating(rating)}
            >
              {rating}점
            </button>
          ))}
        </div>

        <div className={styles.sorting}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'rating' | 'helpful')}
            className={styles.sortSelect}
          >
            <option value="latest">최신순</option>
            <option value="rating">평점순</option>
            <option value="helpful">도움순</option>
          </select>
        </div>
      </div>

      {/* 리뷰 작성 버튼 */}
      <div className={styles.writeReview}>
        <Button variant="primary">리뷰 작성하기</Button>
      </div>

      {/* 리뷰 목록 */}
      <div className={styles.reviewList}>
        {sortedReviews.map(review => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{review.userName}</span>
                <div className={styles.reviewStars}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < review.rating ? styles.filled : styles.empty}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.reviewDate}>
                {review.createdAt.toLocaleDateString()}
              </div>
            </div>

            <div className={styles.reviewContent}>
              <h4 className={styles.reviewTitle}>{review.title}</h4>
              <p className={styles.reviewText}>{review.content}</p>
            </div>

            <div className={styles.reviewMeta}>
              <div className={styles.purchaseInfo}>
                <span className={styles.option}>사이즈: {review.size}</span>
                <span className={styles.option}>색상: {review.color}</span>
                {review.height && review.weight && (
                  <span className={styles.option}>
                    {review.height}cm, {review.weight}kg
                  </span>
                )}
              </div>
              {review.isRecommended && (
                <span className={styles.recommended}>추천</span>
              )}
            </div>

            <div className={styles.reviewActions}>
              <button className={styles.helpfulButton}>
                도움돼요 <span className={styles.helpfulCount}>12</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className={styles.loadMore}>
        <Button variant="outline">리뷰 더보기</Button>
      </div>
    </div>
  );
}
