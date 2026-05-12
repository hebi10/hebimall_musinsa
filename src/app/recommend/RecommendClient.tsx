'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/app/products/_components/ProductCard';
import { ProductService } from '@/shared/services/productService';
import { Product } from '@/shared/types/product';
import styles from "./page.module.css";

type RecommendFilterType = 'all' | 'rating' | 'review' | 'sale' | 'new';

const FILTER_VALUES: RecommendFilterType[] = ['all', 'rating', 'review', 'sale', 'new'];

function normalizeFilterType(value: string | null): RecommendFilterType {
  return FILTER_VALUES.includes(value as RecommendFilterType)
    ? (value as RecommendFilterType)
    : 'all';
}

export default function RecommendClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<RecommendFilterType>('all');

  const filterOptions = [
    { value: 'all' as const, label: '전체' },
    { value: 'rating' as const, label: '평점' },
    { value: 'review' as const, label: '리뷰' },
    { value: 'sale' as const, label: '세일 상품' },
    { value: 'new' as const, label: '신상품' },
  ];

  useEffect(() => {
    setFilterType(normalizeFilterType(searchParams.get('filter')));
  }, [searchParams]);

  const selectFilterType = useCallback((nextFilterType: RecommendFilterType) => {
    setFilterType(nextFilterType);
    router.replace(
      nextFilterType === 'all' ? '/recommend' : `/recommend?filter=${nextFilterType}`,
      { scroll: false }
    );
  }, [router]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let nextProducts: Product[] = [];

      switch (filterType) {
        case 'all': {
          nextProducts = await ProductService.getRecommendedProducts(24);
          break;
        }
        case 'rating': {
          nextProducts = await ProductService.getTopRatedProducts(24);
          break;
        }
        case 'review': {
          nextProducts = await ProductService.getReviewPopularProducts(24);
          break;
        }
        case 'sale': {
          const result = await ProductService.getSaleProducts(120);
          nextProducts = result.slice(0, 24);
          break;
        }
        case 'new': {
          const result = await ProductService.getNewProducts(80);
          nextProducts = result.slice(0, 24);
          break;
        }
        default:
          nextProducts = await ProductService.getRecommendedProducts(24);
      }

      setRecommendedProducts(nextProducts);
    } catch (err) {
      console.error('상품 추천 로드 실패:', err);
      setError('상품을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p>추천 상품 목록을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorWrapper}>
          <p>{error}</p>
          <button onClick={() => void loadProducts()} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>추천</h1>
          <p className={styles.heroSubtitle}>평점, 리뷰, 할인율, 신상품 기준으로 큐레이션한 추천 상품입니다.</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterSection}>
          <div className={styles.filterTabs}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles.filterTab} ${filterType === option.value ? styles.active : ''}`}
                onClick={() => selectFilterType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.resultsHeader}>
          <div className={styles.resultsCount}>
            결과: <span className={styles.count}>{recommendedProducts.length}</span>개
          </div>
        </div>

        {recommendedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>추천 상품이 없습니다.</h3>
            <p className={styles.emptyDescription}>잠시 후 다시 확인해 주세요.</p>
            <button onClick={() => selectFilterType('all')} className={styles.resetButton}>
              전체 보기
            </button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {recommendedProducts.map((product) => (
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
        )}
      </div>
    </div>
  );
}
