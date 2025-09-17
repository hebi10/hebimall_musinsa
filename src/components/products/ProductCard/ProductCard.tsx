'use client';

import styles from './ProductCard.module.css';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/shared/types/product';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.starFull}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.starHalf}>★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.starEmpty}>☆</span>);
    }

    return stars;
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.imageContainer}>
        {((product.mainImage || (product.images && product.images.length > 0)) && !imageError) ? (
          <Image
            src={product.mainImage || product.images[0]}
            alt={product.name}
            fill
            className={styles.image}
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span className={styles.placeholderIcon}>📷</span>
            <span className={styles.placeholderText}>이미지 없음</span>
          </div>
        )}
        
        {product.isNew && (
          <div className={styles.badge}>
            <span>NEW</span>
          </div>
        )}
        
        {product.isSale && (
          <div className={`${styles.badge} ${styles.saleBadge}`}>
            <span>SALE</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        {product.brand && (
          <p className={styles.brand}>{product.brand}</p>
        )}
        
        <h3 className={styles.name}>{product.name}</h3>
        
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        <div className={styles.pricing}>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.discount}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {product.rating && (
          <div className={styles.rating}>
            <div className={styles.stars}>
              {renderStars(product.rating)}
            </div>
            <span className={styles.ratingText}>
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className={styles.reviewCount}>
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className={styles.colors}>
            {product.colors.slice(0, 4).map((color: string, index: number) => (
              <div
                key={index}
                className={styles.colorOption}
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className={styles.moreColors}>
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div className={styles.sizes}>
            <span className={styles.sizesLabel}>사이즈:</span>
            <span className={styles.sizesText}>
              {product.sizes.slice(0, 3).join(', ')}
              {product.sizes.length > 3 && ' 외'}
            </span>
          </div>
        )}

        <div className={styles.shipping}>
          <span className={styles.shippingIcon}>🚚</span>
          <span>무료배송</span>
        </div>
      </div>
    </div>
  );
}