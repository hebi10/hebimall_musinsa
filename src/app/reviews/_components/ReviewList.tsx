'use client';

import React, { useEffect, useState } from 'react';
import { useReview } from '@/context/reviewProvider';
import { useProduct } from '@/context/productProvider';
import Link from 'next/link';
import Button from '@/app/_components/Button';
import styles from './ReviewList.module.css';

export default function ReviewList() {
  const { 
    allReviews, 
    loading, 
    error,
    loadAllReviews 
  } = useReview();
  
  const { getProductById } = useProduct();
  
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'helpful'>('latest');
  const [productInfo, setProductInfo] = useState<{ [key: string]: { name: string; mainImage?: string } }>({});

  useEffect(() => {
    loadAllReviews(ratingFilter, sortBy);
  }, [ratingFilter, sortBy, loadAllReviews]);

  // 상품 정보를 가져오는 함수
  useEffect(() => {
    const loadProductInfo = async () => {
      const uniqueProductIds = [...new Set(allReviews.map(review => review.productId))];
      const productData: { [key: string]: { name: string; mainImage?: string } } = {};
      
      for (const productId of uniqueProductIds) {
        try {
          const product = await getProductById(productId);
          if (product) {
            productData[productId] = {
              name: product.name,
              mainImage: product.mainImage
            };
          }
        } catch (error) {
          console.error(`상품 ${productId} 정보 로드 실패:`, error);
        }
      }
      
      setProductInfo(productData);
    };

    if (allReviews.length > 0) {
      loadProductInfo();
    }
  }, [allReviews, getProductById]);

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* 통계 정보 */}
      {allReviews.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{allReviews.length}</div>
            <div className={styles.statLabel}>전체 리뷰</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {(allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)}
            </div>
            <div className={styles.statLabel}>평균 평점</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {Math.round((allReviews.filter(r => r.isRecommended).length / allReviews.length) * 100)}%
            </div>
            <div className={styles.statLabel}>추천율</div>
          </div>
        </div>
      )}

      {/* 필터 및 정렬 */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${ratingFilter === undefined ? styles.active : ''}`}
            onClick={() => setRatingFilter(undefined)}
          >
            전체
          </button>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              className={`${styles.filterButton} ${ratingFilter === rating ? styles.active : ''}`}
              onClick={() => setRatingFilter(rating)}
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
        {loading ? (
          <div className={styles.loading}>리뷰를 불러오는 중...</div>
        ) : allReviews.length === 0 ? (
          <div className={styles.empty}>등록된 리뷰가 없습니다.</div>
        ) : (
          allReviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              {/* 상품 정보 */}
              <div className={styles.productInfo}>
                {productInfo[review.productId]?.mainImage && (
                  <img 
                    src={productInfo[review.productId].mainImage} 
                    alt={productInfo[review.productId]?.name || '상품'}
                    className={styles.productImage}
                  />
                )}
                <div className={styles.productDetails}>
                  <Link 
                    href={`/products/${review.productId}`}
                    className={styles.productName}
                  >
                    {productInfo[review.productId]?.name || '상품 정보 로딩 중...'}
                  </Link>
                  {(review.size || review.color) && (
                    <div className={styles.productOptions}>
                      {review.size && <span>사이즈: {review.size}</span>}
                      {review.color && <span>색상: {review.color}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className={styles.reviewContent}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{review.userName}</span>
                    <span className={styles.rating}>{renderStars(review.rating)}</span>
                    {review.isRecommended && (
                      <span className={styles.recommended}>추천</span>
                    )}
                  </div>
                  <span className={styles.reviewDate}>
                    {review.createdAt.toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.reviewBody}>
                  <h4 className={styles.reviewTitle}>{review.title}</h4>
                  <p className={styles.reviewText}>{review.content}</p>
                </div>

                <div className={styles.reviewActions}>
                  <Link 
                    href={`/products/${review.productId}`}
                    className={styles.productLink}
                  >
                    상품 보기
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 리뷰 작성 안내 */}
      <div className={styles.writeReview}>
        <p>구매하신 상품에 대한 리뷰를 작성해보세요!</p>
        <Button variant="primary" size="lg">마이페이지에서 리뷰 작성하기</Button>
      </div>
    </div>
  );
}
