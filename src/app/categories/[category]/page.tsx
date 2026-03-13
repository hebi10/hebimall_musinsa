'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { ProductService } from '@/shared/services/productService';
import { Product } from '@/shared/types/product';
import { getCategoryName } from '@/shared/utils/categoryUtils';
import styles from './page.module.css';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function DynamicCategoryPage({ params }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState<string>('');

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

  // 카테고리명 매핑 - Firebase에서 가져오기
  const [categoryDisplayName, setCategoryDisplayName] = useState<string>('');

  useEffect(() => {
    const loadCategoryName = async () => {
      if (!category) return;
      
      const displayName = await getCategoryName(category);
      setCategoryDisplayName(displayName);
    };

    loadCategoryName();
  }, [category]);

  useEffect(() => {
    const loadProducts = async () => {
      // category가 설정되지 않았으면 대기
      if (!category) return;
      
      try {
        setLoading(true);
        setError(null);

        // 카테고리별 상품 조회 (중첩 컬렉션에서)
        const categoryProducts = await ProductService.getProductsByCategory(category);
        
        // 정렬 적용
        const sortedProducts = await sortProducts(categoryProducts, sortBy);
        setProducts(sortedProducts);

      } catch (err) {
        console.error('카테고리 상품 로드 실패:', err);
        setError('상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, sortBy]);

  const sortProducts = async (productList: Product[], sortOption: string): Promise<Product[]> => {
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

  const handleSortChange = async (newSortBy: string) => {
    setSortBy(newSortBy);
    const sortedProducts = await sortProducts(products, newSortBy);
    setProducts(sortedProducts);
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
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
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
                  <img 
                    src={product.mainImage} 
                    alt={product.name}
                    className={styles.productImg}
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
                    <span className={styles.productIcon}>
                    </span>
                    <p className={styles.placeholderText}>이미지 준비중</p>
                  </div>
                </div>
                {product.isSale && product.saleRate && (
                  <div className={styles.discountBadge}>
                    {product.saleRate}%
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
