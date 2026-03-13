'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductService } from '@/shared/services/productService';
import { Product } from '@/shared/types/product';
import styles from "./page.module.css";

export default function RecommendPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'rating' | 'review' | 'sale' | 'new'>('all');

  const filterOptions = [
    { value: 'all' as const, label: '전체', icon: '' },
    { value: 'rating' as const, label: '높은 평점', icon: '' },
    { value: 'review' as const, label: '리뷰 많은', icon: '' },
    { value: 'sale' as const, label: '할인 상품', icon: '' },
    { value: 'new' as const, label: '신상품', icon: '' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      filterRecommendedProducts();
    }
  }, [products, filterType]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const allProducts = await ProductService.getAllProducts();
      setProducts(allProducts);
    } catch (err) {
      console.error('상품 로딩 실패:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterRecommendedProducts = () => {
    let filtered: Product[] = [];
    
    switch (filterType) {
      case 'all':
        filtered = products
          .map((p: Product) => ({
            ...p,
            recommendScore: (p.rating * 0.4) + 
                          (Math.min(p.reviewCount / 10, 50) * 0.3) + 
                          ((p.saleRate || 0) * 0.2) + 
                          (p.isNew ? 10 : 0)
          }))
          .sort((a: any, b: any) => b.recommendScore - a.recommendScore)
          .slice(0, 24);
        break;
        
      case 'rating':
        filtered = products
          .filter((p: Product) => p.rating >= 4.3)
          .sort((a: Product, b: Product) => b.rating - a.rating)
          .slice(0, 20);
        break;
        
      case 'review':
        filtered = products
          .filter((p: Product) => p.reviewCount >= 50)
          .sort((a: Product, b: Product) => b.reviewCount - a.reviewCount)
          .slice(0, 20);
        break;
        
      case 'sale':
        filtered = products
          .filter((p: Product) => p.isSale && p.saleRate && p.saleRate > 0)
          .sort((a: Product, b: Product) => (b.saleRate || 0) - (a.saleRate || 0))
          .slice(0, 20);
        break;
        
      case 'new':
        filtered = products
          .filter((p: Product) => p.isNew)
          .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
        break;
    }
    
    setRecommendedProducts(filtered);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p>추천 상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorWrapper}>
          <p>상품을 불러오는데 실패했습니다.</p>
          <button 
            onClick={() => loadProducts()} 
            className={styles.retryButton}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>추천</h1>
          <p className={styles.heroSubtitle}>
            추천 상품 목록입니다
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Filter Tabs */}
        <div className={styles.filterSection}>
          <div className={styles.filterTabs}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles.filterTab} ${
                  filterType === option.value ? styles.active : ''
                }`}
                onClick={() => setFilterType(option.value)}
              >
                <span className={styles.filterIcon}>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsHeader}>
          <div className={styles.resultsCount}>
            총 <span className={styles.count}>{recommendedProducts.length}</span>개 상품
          </div>
        </div>

        {/* Product Grid */}
        {recommendedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}></div>
            <h3 className={styles.emptyTitle}>추천 상품이 없습니다</h3>
            <p className={styles.emptyDescription}>
              해당 조건에 맞는 상품이 없습니다.<br />
              다른 필터를 선택해보세요.
            </p>
            <button 
              onClick={() => setFilterType('all')} 
              className={styles.resetButton}
            >
              전체 상품 보기
            </button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {recommendedProducts.map((product, index) => (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`}
                className={styles.productCard}
              >
                <div className={styles.productImageWrapper}>
                  {product.mainImage ? (
                    <img 
                      src={product.mainImage} 
                      alt={product.name}
                      className={styles.productImage}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={styles.imagePlaceholder} style={{ display: product.mainImage ? 'none' : 'flex' }}>
                    <div className={styles.placeholderContent}>
                      <span className={styles.placeholderIcon}>
                      </span>
                      <p className={styles.placeholderText}>이미지 준비중</p>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className={styles.badgeWrapper}>
                    {product.isSale && product.saleRate && (
                      <div className={styles.saleBadge}>
                        -{Math.round(product.saleRate)}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className={styles.newBadge}>
                        NEW
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.productInfo}>
                  <div className={styles.brandName}>{product.brand}</div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  
                  <div className={styles.priceWrapper}>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className={styles.originalPrice}>
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                    <span className={styles.currentPrice}>
                      {product.price.toLocaleString()}원
                    </span>
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
