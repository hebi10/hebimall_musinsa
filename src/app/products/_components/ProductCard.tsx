'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useProduct } from '@/context/productProvider';
import { useUserActivity } from '@/context/userActivityProvider';
import { getProductReviewStats } from '@/shared/utils/syncProductReviews';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string;
  isNew?: boolean;
  isSale?: boolean;
  saleRate?: number;
  rating?: number;
  reviewCount?: number;
  stock?: number;
}

export default function ProductCard({
  id,
  name,
  brand,
  price,
  originalPrice,
  image,
  isNew,
  isSale,
  saleRate,
  rating,
  reviewCount,
  stock = 0,
}: ProductCardProps) {
  const { calculateDiscountPrice } = useProduct();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useUserActivity();
  const [imageError, setImageError] = useState(false);
  const [actualReviewStats, setActualReviewStats] = useState<{ reviewCount: number; rating: number } | null>(null);

  // 찜하기 상태는 실제 데이터에서 가져오기
  const isWishlisted = wishlistItems.some(item => item.productId === id);

  // 실제 리뷰 개수와 평점 가져오기
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const stats = await getProductReviewStats(id);
        setActualReviewStats(stats);
      } catch (error) {
        console.error('리뷰 통계 조회 실패:', error);
      }
    };

    fetchReviewStats();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const discountRate = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : saleRate || 0;

  const displayPrice = saleRate ? calculateDiscountPrice(price, saleRate) : price;
  const inStock = stock > 0;

  // 실제 리뷰 데이터가 있으면 우선 사용, 없으면 기본값 사용
  const displayRating = actualReviewStats?.rating || rating || 0;
  const displayReviewCount = actualReviewStats?.reviewCount ?? reviewCount ?? 0;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch (error) {
      console.error('찜하기 처리 실패:', error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={`/products/${id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {image && !imageError ? (
          <img
            src={image}
            alt={name}
            className={styles.image}
            onError={handleImageError}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>이미지 준비중</span>
          </div>
        )}
        
        {/* 배지들 */}
        <div className={styles.badges}>
          {isNew && (
            <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>
          )}
          {isSale && discountRate > 0 && (
            <span className={`${styles.badge} ${styles.badgeSale}`}>
              {discountRate}%
            </span>
          )}
          {!inStock && (
            <span className={`${styles.badge} ${styles.badgeOutOfStock}`}>품절</span>
          )}
        </div>

        {/* 위시리스트 버튼 */}
        <button
          className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlistClick}
          aria-label="위시리스트에 추가"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      
      <div className={styles.info}>
        <p className={styles.brand}>{brand}</p>
        <h3 className={styles.name}>{name}</h3>
        
        <div className={styles.priceContainer}>
          {originalPrice && originalPrice > price && (
            <span className={styles.originalPrice}>
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className={styles.price}>
            {formatPrice(displayPrice)}
          </span>
        </div>
        
        {displayRating > 0 && displayReviewCount > 0 && (
          <div className={styles.rating}>
            <span className={styles.ratingValue}>★ {displayRating}</span>
            <span className={styles.reviewCount}>({displayReviewCount})</span>
          </div>
        )}

        {/* 재고 상태 */}
        {!inStock && (
          <div className={styles.stockStatus}>
            <span className={styles.outOfStock}>품절</span>
          </div>
        )}
      </div>
    </Link>
  );
}
