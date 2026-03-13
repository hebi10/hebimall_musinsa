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

  // 색상명을 실제 색상 값으로 변환하는 함수
  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      '검정': '#000000',
      '검은색': '#000000',
      '블랙': '#000000',
      'black': '#000000',
      '흰색': '#ffffff',
      '화이트': '#ffffff',
      'white': '#ffffff',
      '빨강': '#dc2626',
      '빨간색': '#dc2626',
      '레드': '#dc2626',
      'red': '#dc2626',
      '파랑': '#2563eb',
      '파란색': '#2563eb',
      '블루': '#2563eb',
      'blue': '#2563eb',
      '초록': '#16a34a',
      '초록색': '#16a34a',
      '그린': '#16a34a',
      'green': '#16a34a',
      '노랑': '#eab308',
      '노란색': '#eab308',
      '옐로우': '#eab308',
      'yellow': '#eab308',
      '네이비': '#1e3a8a',
      'navy': '#1e3a8a',
      '회색': '#6b7280',
      '그레이': '#6b7280',
      'gray': '#6b7280',
      'grey': '#6b7280',
      '보라': '#7c3aed',
      '보라색': '#7c3aed',
      '퍼플': '#7c3aed',
      'purple': '#7c3aed',
      '핑크': '#ec4899',
      'pink': '#ec4899',
      '갈색': '#8b4513',
      '브라운': '#8b4513',
      'brown': '#8b4513'
    };
    
    return colorMap[colorName.toLowerCase()] || '#cccccc';
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
                style={{ backgroundColor: getColorValue(color) }}
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
          <span>무료배송</span>
        </div>
      </div>
    </div>
  );
}