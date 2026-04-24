'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FeaturedProductService } from '@/shared/services/featuredProductService';
import { Product } from '@/shared/types/product';
import ProductCard from '@/app/products/_components/ProductCard';
import styles from './FeaturedProducts.module.css';

interface FeaturedProductsProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  sectionClassName?: string;
  viewAllLabel?: string;
}

export default function FeaturedProducts({
  eyebrow,
  title,
  subtitle,
  description,
  sectionClassName = '',
  viewAllLabel = '전체 보기',
}: FeaturedProductsProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title: '추천 셀렉션',
    subtitle: '메인에서 먼저 보여드리는 편집 상품입니다.',
    isActive: true,
  });

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);

      const [products, configData] = await Promise.all([
        FeaturedProductService.getFeaturedProducts(),
        FeaturedProductService.getFeaturedProductConfig(),
      ]);

      setFeaturedProducts(products);

      if (configData) {
        setConfig({
          title: configData.title || '추천 셀렉션',
          subtitle:
            configData.subtitle || '메인에서 먼저 보여드리는 편집 상품입니다.',
          isActive: configData.isActive,
        });
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!config.isActive) {
    return null;
  }

  const sectionClassNameCombined = [styles.section, sectionClassName]
    .filter(Boolean)
    .join(' ');
  const resolvedTitle = title || config.title;
  const resolvedSubtitle = subtitle || config.subtitle;

  const headerContent = (
    <div className={styles.header}>
      <div className={styles.copyBlock}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{resolvedTitle}</h2>
        <p className={styles.subtitle}>{resolvedSubtitle}</p>
      </div>

      <div className={styles.headerSide}>
        {description && <p className={styles.description}>{description}</p>}
        <Link href="/recommend" className={styles.viewAllButton}>
          {viewAllLabel}
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className={sectionClassNameCombined}>
        <div className={styles.container}>
          {headerContent}
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
    <section className={sectionClassNameCombined}>
      <div className={styles.container}>
        {headerContent}

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
