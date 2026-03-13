'use client';

import { useProduct } from '@/context/productProvider';
import ProductCard from '@/app/products/_components/ProductCard';
import Link from 'next/link';
import styles from './ProductSection.module.css';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  type: 'recommended' | 'new' | 'sale' | 'bestseller';
  showViewAllButton?: boolean;
  maxItems?: number;
  variant?: 'default' | 'ranking' | 'sale';
  viewAllLink?: string;
}

export default function ProductSection({
  title,
  subtitle,
  type,
  showViewAllButton = true,
  maxItems = 8,
  variant = 'default',
  viewAllLink = '/recommend'
}: ProductSectionProps) {
  const {
    recommendedProducts,
    newProducts,
    saleProducts,
    bestSellerProducts,
    loading
  } = useProduct();

  const getProducts = () => {
    switch (type) {
      case 'recommended':
        return recommendedProducts;
      case 'new':
        return newProducts;
      case 'sale':
        return saleProducts;
      case 'bestseller':
        return bestSellerProducts;
      default:
        return [];
    }
  };

  const products = getProducts().slice(0, maxItems);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>상품을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const gridClass = variant === 'ranking'
    ? styles.rankingGrid
    : variant === 'sale'
    ? styles.saleGrid
    : styles.productGrid;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {showViewAllButton && (
          <Link href={viewAllLink} className={styles.viewAllLink}>
            전체보기
          </Link>
        )}
      </div>

      <div className={gridClass}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className={variant === 'ranking' ? styles.rankingItem : undefined}
          >
            {variant === 'ranking' && (
              <span className={styles.rankNumber}>{index + 1}</span>
            )}
            <ProductCard
              id={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              originalPrice={product.originalPrice}
              isNew={product.isNew}
              isSale={product.isSale}
              saleRate={product.saleRate}
              rating={product.rating}
              reviewCount={product.reviewCount}
              image={product.mainImage || product.images[0]}
              stock={product.stock}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
