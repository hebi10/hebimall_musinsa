import Link from 'next/link';
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
  rating?: number;
  reviewCount?: number;
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
  rating,
  reviewCount,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const discountRate = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {image ? (
          <img
            src={image}
            alt={name}
            className={styles.image}
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
        </div>
      </div>
      
      <div className={styles.info}>
        <p className={styles.brand}>{brand}</p>
        <h3 className={styles.name}>{name}</h3>
        
        <div className={styles.priceContainer}>
          {originalPrice && (
            <span className={styles.originalPrice}>
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className={styles.price}>
            {formatPrice(price)}
          </span>
        </div>
        
        {rating && reviewCount && (
          <div className={styles.rating}>
            <span>★ {rating}</span>
            <span>({reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
