'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/app/_components/Button';
import { useProductMap } from '@/shared/hooks/useProducts';
import { useAllReviews } from '@/shared/hooks/useReviews';
import { formatDate } from '@/shared/utils/dateFormat';
import styles from './ReviewList.module.css';

export default function ReviewList() {
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'helpful'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading: loading, error, refetch } = useAllReviews(currentPage, ratingFilter, sortBy);
  const allReviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;
  const reviewStatistics = data?.statistics || {
    totalCount: 0,
    averageRating: 0,
    recommendationRate: 0,
  };
  const { data: productInfo = {} } = useProductMap(allReviews.map((review) => review.productId));

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - halfVisible);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const changeRatingFilter = (rating?: number) => {
    setCurrentPage(1);
    setRatingFilter(rating);
  };

  const changeSort = (nextSort: 'latest' | 'rating' | 'helpful') => {
    setCurrentPage(1);
    setSortBy(nextSort);
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>리뷰 로딩 중 오류가 발생했습니다</h3>
          <p>{error instanceof Error ? error.message : String(error)}</p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {reviewStatistics.totalCount > 0 && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{reviewStatistics.totalCount}</div>
            <div className={styles.statLabel}>전체 리뷰</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {reviewStatistics.averageRating.toFixed(1)}
            </div>
            <div className={styles.statLabel}>평균 평점</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {reviewStatistics.recommendationRate}%
            </div>
            <div className={styles.statLabel}>추천률</div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${ratingFilter === undefined ? styles.active : ''}`}
            onClick={() => changeRatingFilter(undefined)}
          >
            전체
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`${styles.filterButton} ${ratingFilter === rating ? styles.active : ''}`}
              onClick={() => changeRatingFilter(rating)}
            >
              {rating}점
            </button>
          ))}
        </div>

        <div className={styles.sorting}>
          <select
            value={sortBy}
            onChange={(e) => changeSort(e.target.value as 'latest' | 'rating' | 'helpful')}
            className={styles.sortSelect}
          >
            <option value="latest">최신순</option>
            <option value="rating">평점순</option>
            <option value="helpful">도움순</option>
          </select>
        </div>
      </div>

      <div className={styles.reviewList}>
        {loading ? (
          <div className={styles.loading}>리뷰를 불러오는 중...</div>
        ) : allReviews.length === 0 ? (
          <div className={styles.empty}>등록된 리뷰가 없습니다.</div>
        ) : (
          allReviews.map((review) => {
            const product = productInfo[review.productId];

            return (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.productInfo}>
                  {product?.mainImage && (
                    <Image
                      src={product.mainImage}
                      alt={product.name || '상품'}
                      className={styles.productImage}
                      width={96}
                      height={96}
                    />
                  )}
                  <div className={styles.productDetails}>
                    <Link href={`/products/${review.productId}`} className={styles.productName}>
                      {product?.name || '상품 정보 로딩 중...'}
                    </Link>
                    {(review.size || review.color) && (
                      <div className={styles.productOptions}>
                        {review.size && <span>사이즈: {review.size}</span>}
                        {review.color && <span>색상: {review.color}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.reviewContent}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{review.userName}</span>
                      <span className={styles.rating}>{renderStars(review.rating)}</span>
                      {review.isRecommended && <span className={styles.recommended}>추천</span>}
                    </div>
                    <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                  </div>

                  <div className={styles.reviewBody}>
                    <h4 className={styles.reviewTitle}>{review.title}</h4>
                    <p className={styles.reviewText}>{review.content}</p>
                  </div>

                  <div className={styles.reviewActions}>
                    <Link href={`/products/${review.productId}`} className={styles.productLink}>
                      상품 보기
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === 'number' ? (
                <button
                  className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ) : (
                <span className={styles.ellipsis}>{page}</span>
              )}
            </React.Fragment>
          ))}

          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {totalCount > 0 && (
        <div className={styles.pageInfo}>
          <span>
            총 {totalCount}개의 리뷰 중 {currentPage}페이지 ({(currentPage - 1) * 10 + 1}~
            {Math.min(currentPage * 10, totalCount)}번째)
          </span>
        </div>
      )}

      <div className={styles.writeReview}>
        <p>구매하신 상품에 대한 리뷰를 작성해보세요.</p>
        <Button variant="primary" size="lg">마이페이지에서 리뷰 작성하기</Button>
      </div>
    </div>
  );
}
