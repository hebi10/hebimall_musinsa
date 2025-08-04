'use client';

import { useState } from 'react';
import { Review } from '@/src/types/review';
import Button from '@/src/components/common/Button';
import styles from './ReviewList.module.css';

// Mock 데이터
const mockReviews: Review[] = [
  {
    id: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    userName: '김**',
    rating: 5,
    title: '정말 만족합니다!',
    content: '소재도 좋고 핏도 완벽해요. 배송도 빨라서 좋았습니다. 다음에도 또 구매하고 싶어요.',
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
    productId: 'product-2',
    userId: 'user-2',
    userName: '이**',
    rating: 4,
    title: '괜찮아요',
    content: '생각보다 얇은 느낌이지만 여름용으로는 좋을 것 같아요. 가격 대비 만족스럽습니다.',
    images: [],
    size: 'L',
    color: 'white',
    isRecommended: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'review-3',
    productId: 'product-3',
    userId: 'user-3',
    userName: '박**',
    rating: 5,
    title: '완전 강추!',
    content: '디자인이 예쁘고 착용감도 좋아요. 친구들에게도 추천했습니다.',
    images: [],
    size: 'S',
    color: 'navy',
    height: 165,
    weight: 55,
    isRecommended: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'review-4',
    productId: 'product-4',
    userId: 'user-4',
    userName: '최**',
    rating: 3,
    title: '보통이네요',
    content: '기대했던 것보다는 평범해요. 그래도 나쁘지는 않습니다.',
    images: [],
    size: 'M',
    color: 'gray',
    isRecommended: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

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
