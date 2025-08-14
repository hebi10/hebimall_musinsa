'use client';

import { useState, useEffect } from 'react';
import { useProduct } from '@/context/productProvider';
import ProductCard from '@/app/products/_components/ProductCard';
import PageHeader from '@/app/_components/PageHeader';
import { Product } from '@/shared/types/product';
import styles from './page.module.css';

export default function SalePage() {
  const { 
    products = [], 
    loading, 
    error,
    loadProducts
  } = useProduct();

  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (products && products.length > 0) {
      // 할인율이 있는 상품만 필터링
      const saleProducts = products.filter((product: Product) => 
        product.isSale && product.saleRate && product.saleRate > 0
      );
      setLocalProducts(saleProducts);
    }
  }, [products]);

  if (loading) {
    return (
      <div className={styles.container}>
        <PageHeader 
          title="🔥 세일" 
          description="특가 상품을 만나보세요" 
        />
        <div className={styles.loading}>상품을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <PageHeader 
          title="🔥 세일" 
          description="특가 상품을 만나보세요" 
        />
        <div className={styles.error}>
          상품을 불러오는 중 오류가 발생했습니다: {error}
        </div>
      </div>
    );
  }

  if (localProducts.length === 0) {
    return (
      <div className={styles.container}>
        <PageHeader 
          title="🔥 세일" 
          description="특가 상품을 만나보세요" 
        />
        <div className={styles.empty}>
          현재 세일 중인 상품이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader 
        title="🔥 세일" 
        description="특가 상품을 만나보세요" 
      />
      
      <div className={styles.content}>
        <div className={styles.saleInfo}>
          <h2 className={styles.sectionTitle}>
            🎯 특가 할인 ({localProducts.length}개 상품)
          </h2>
          <p className={styles.sectionDescription}>
            지금 놓치면 후회할 특가 상품들을 확인해보세요!
          </p>
        </div>

        <div className={styles.productGrid}>
          {localProducts.map((product) => (
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
