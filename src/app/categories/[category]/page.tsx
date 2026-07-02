'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/shared/types/product';
import { useCategoriesQuery } from '@/shared/hooks/useCategoriesQuery';
import { useProductsByCategory } from '@/shared/hooks/useProducts';
import { getDefaultCategoryNames } from '@/shared/utils/categoryUtils';
import styles from './page.module.css';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function DynamicCategoryPage({ params }: CategoryPageProps) {
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState<string>('');
  const { data: categoryProducts = [], isLoading: loading, error, refetch } = useProductsByCategory(category || null);
  const { data: categories = [] } = useCategoriesQuery();

  // params 비동기 처리
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      let categoryParam = resolvedParams.category;
      
      // clothing을 tops로 리다이렉트
      if (categoryParam === 'clothing') {
        categoryParam = 'tops';
        // URL도 변경
        window.history.replaceState(null, '', `/categories/tops`);
      }
      
      setCategory(categoryParam);
    };
    loadParams();
  }, [params]);

  const sortOptions = [
    { value: 'popular', label: '인기순' },
    { value: 'newest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
    { value: 'review', label: '리뷰 많은순' }
  ];

  const categoryDisplayName =
    categories.find((item) => item.id === category)?.name ||
    getDefaultCategoryNames()[category] ||
    category;

  const sortProducts = (productList: Product[], sortOption: string): Product[] => {
    const sorted = [...productList];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'review':
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating));
    }
  };

  const products = useMemo(() => sortProducts(categoryProducts, sortBy), [categoryProducts, sortBy]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>
          <div className={styles.loadingSpinner}></div>
          <p>상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>{error instanceof Error ? error.message : '상품을 불러오는데 실패했습니다.'}</p>
          <button 
            onClick={() => refetch()} 
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
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>홈</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <Link href="/categories" className={styles.breadcrumbLink}>카테고리</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <span className={styles.breadcrumbCurrent}>{categoryDisplayName}</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{categoryDisplayName}</h1>
        <p className={styles.subtitle}>
          다양한 상품을 만나보세요
        </p>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.sortSection}>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        <span className={styles.resultCount}>총 {products.length}개 상품</span>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>해당 카테고리에 상품이 없습니다.</p>
          <Link href="/categories" className={styles.backButton}>
            다른 카테고리 보기
          </Link>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className={styles.productCard}
            >
              <div className={styles.productImage}>
                {product.mainImage ? (
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    className={styles.productImg}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : null}
                <div className={styles.imagePlaceholder} style={{ display: product.mainImage ? 'none' : 'flex' }}>
                  <div className={styles.placeholderContent}>
                    <span className={styles.productIcon}>
                    </span>
                    <p className={styles.placeholderText}>이미지 준비중</p>
                  </div>
                </div>
                {product.isSale && product.saleRate && (
                  <div className={styles.discountBadge}>
                    -{product.saleRate}%
                  </div>
                )}
                {product.isNew && (
                  <div className={styles.newBadge}>
                    NEW
                  </div>
                )}
              </div>
              <div className={styles.productInfo}>
                <div className={styles.brandName}>{product.brand}</div>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceSection}>
                  <span className={styles.currentPrice}>
                    {product.price.toLocaleString()}원
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className={styles.originalPrice}>
                      {product.originalPrice.toLocaleString()}원
                    </span>
                  )}
                </div>
                <div className={styles.ratingSection}>
                  <span className={styles.rating}>{product.rating}</span>
                  <span className={styles.reviewCount}>({product.reviewCount})</span>
                </div>
                <div className={styles.stockInfo}>
                  {product.stock > 0 ? (
                    <span className={styles.inStock}>재고 있음</span>
                  ) : (
                    <span className={styles.outOfStock}>품절</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
