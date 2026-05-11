'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductService } from '@/shared/services/productService';
import { Product } from '@/shared/types/product';
import styles from "./page.module.css";

export default function RecommendPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'rating' | 'review' | 'sale' | 'new'>('all');

  const filterOptions = [
    { value: 'all' as const, label: '전체' },
    { value: 'rating' as const, label: '평점' },
    { value: 'review' as const, label: '리뷰' },
    { value: 'sale' as const, label: '세일 상품' },
    { value: 'new' as const, label: '신상품' },
  ];

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
          const result = await ProductService.queryProducts({
            status: 'active',
            sort: { field: 'rating', order: 'desc' },
            limitCount: 80,
          });
          nextProducts = result.items.filter((product) => product.rating >= 4.3).slice(0, 24);
          break;
        }
        case 'review': {
          const result = await ProductService.queryProducts({
            status: 'active',
            sort: { field: 'createdAt', order: 'desc' },
            limitCount: 120,
          });
          nextProducts = result.items.filter((product) => product.reviewCount >= 10).slice(0, 24);
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
                onClick={() => setFilterType(option.value)}
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
            <button onClick={() => setFilterType('all')} className={styles.resetButton}>
              전체 보기
            </button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {recommendedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className={styles.productCard}>
                <div className={styles.productImageWrapper}>
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className={styles.productImage}
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={styles.imagePlaceholder} style={{ display: product.mainImage ? 'none' : 'flex' }}>
                    <p className={styles.placeholderText}>대표이미지 없음</p>
                  </div>

                  <div className={styles.badgeWrapper}>
                    {product.isSale && product.saleRate ? (
                      <div className={styles.saleBadge}>-{Math.round(product.saleRate)}%</div>
                    ) : null}
                    {product.isNew ? <div className={styles.newBadge}>NEW</div> : null}
                  </div>
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.brandName}>{product.brand}</div>
                  <h3 className={styles.productName}>{product.name}</h3>

                  <div className={styles.priceWrapper}>
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <span className={styles.originalPrice}>{product.originalPrice.toLocaleString()}원</span>
                    ) : null}
                    <span className={styles.currentPrice}>{product.price.toLocaleString()}원</span>
                  </div>

                  <div className={styles.ratingWrapper}>
                    <span className={styles.rating}>{product.rating}</span>
                    <span className={styles.reviewCount}>({product.reviewCount})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
