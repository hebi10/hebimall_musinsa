'use client';

import { useState } from 'react';
import { Review } from '@/shared/types/review';
import Button from '@/app/_components/Button';
import styles from './ReviewList.module.css';

import { mockReviews } from '@/mocks/review';

export default function ReviewList() {
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'helpful'>('latest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

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

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const displayedReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

  return (
    <div className={styles.container}>
      {/* 통계 정보 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{mockReviews.length}</div>
          <div className={styles.statLabel}>전체 리뷰</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {(mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length).toFixed(1)}
          </div>
          <div className={styles.statLabel}>평균 평점</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {Math.round((mockReviews.filter(r => r.isRecommended).length / mockReviews.length) * 100)}%
          </div>
          <div className={styles.statLabel}>추천율</div>
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

      {/* 리뷰 목록 */}
      <div className={styles.reviewList}>
        {displayedReviews.map(review => (
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
              <button className={styles.productLink}>
                상품 보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {/* 리뷰 작성 버튼 */}
      <div className={styles.writeReview}>
        <Button variant="primary" size="lg">리뷰 작성하기</Button>
      </div>
    </div>
  );
}
