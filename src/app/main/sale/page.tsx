'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/app/products/_components/ProductCard';
import PageHeader from '@/app/_components/PageHeader';
import { ProductService } from '@/shared/services/productService';
import { Product } from '@/shared/types/product';
import styles from './page.module.css';

export default function SalePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const saleProducts = await ProductService.getSaleProducts(100);
      setProducts(saleProducts);
    } catch (err) {
      console.error('상품 로드 실패:', err);
      setError('상품을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  if (loading) {
    return (
      <div className={styles.container}>
        <PageHeader
          title="세일"
          description="할인 상품 목록을 한눈에 확인하세요."
        />
        <div className={styles.loading}>상품 목록을 불러오는 중입니다...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <PageHeader
          title="세일"
          description="할인 상품 목록을 한눈에 확인하세요."
        />
        <div className={styles.error}>
          상품을 불러오지 못했습니다: {error}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.container}>
        <PageHeader
          title="세일"
          description="할인 상품 목록을 한눈에 확인하세요."
        />
        <div className={styles.empty}>현재 할인 상품이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="세일"
        description="한눈에 할인 상품을 확인하세요."
      />
      
      <div className={styles.content}>
        <div className={styles.saleInfo}>
          <h2 className={styles.sectionTitle}>할인 상품 ({products.length}개)</h2>
          <p className={styles.sectionDescription}>현재 할인 상품을 모았습니다.</p>
        </div>

        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.mainImage || product.images[0]}
              isNew={product.isNew}
              isSale={product.isSale}
              saleRate={product.saleRate}
              rating={product.rating}
              reviewCount={product.reviewCount}
              stock={product.stock}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
