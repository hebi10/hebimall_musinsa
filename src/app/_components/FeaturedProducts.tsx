'use client';

import { useState, useEffect } from 'react';
import { FeaturedProductService } from '@/shared/services/featuredProductService';
import { Product } from '@/shared/types/product';
import ProductCard from '@/app/products/_components/ProductCard';
import Link from 'next/link';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title: '추천 상품',
    subtitle: '에디터가 선별한 상품',
    isActive: true
  });

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);

      const [products, configData] = await Promise.all([
        FeaturedProductService.getFeaturedProducts(),
        FeaturedProductService.getFeaturedProductConfig()
      ]);

      setFeaturedProducts(products);

      if (configData) {
        setConfig({
          title: configData.title || '추천 상품',
          subtitle: configData.subtitle || '에디터가 선별한 상품',
          isActive: configData.isActive
        });
      }
    } catch (error) {
      console.error('추천 상품 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!config.isActive) {
    return null;
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>{config.title}</h2>
              <p className={styles.subtitle}>{config.subtitle}</p>
            </div>
          </div>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{config.title}</h2>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>
          <Link href="/recommend" className={styles.viewAllButton}>
            더보기
          </Link>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
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
              image={product.mainImage || product.images[0]}
              stock={product.stock}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
