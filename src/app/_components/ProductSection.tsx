'use client';

import { useProduct } from '@/context/productProvider';
import ProductCard from '@/app/products/_components/ProductCard';
import Link from 'next/link';
import styles from './ProductSection.module.css';

interface ProductSectionProps {
  title: string;
  type: 'recommended' | 'new' | 'sale' | 'bestseller';
  showViewAllButton?: boolean;
  maxItems?: number;
}

export default function ProductSection({ 
  title, 
  type, 
  showViewAllButton = true,
  maxItems = 8
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
          <h2 className={styles.title}>{title}</h2>
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

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {showViewAllButton && (
          <Link href="/products" className={styles.viewAllLink}>
            전체보기 →
          </Link>
        )}
      </div>
      
      <div className={styles.productGrid}>
        {products.map(product => (
          <ProductCard
            key={product.id}
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
            image={product.mainImage || product.images[0]} // 대표 이미지 우선 사용
            stock={product.stock}
          />
        ))}
      </div>
    </section>
  );
}
