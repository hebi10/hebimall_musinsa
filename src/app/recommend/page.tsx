'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProduct } from '@/context/productProvider';
import { Product } from '@/shared/types/product';
import PageHeader from "@/app/_components/PageHeader";
import styles from "./page.module.css";

export default function RecommendPage() {
  const { products, loading, error, loadProducts } = useProduct();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<'rating' | 'review' | 'sale' | 'new' | 'all'>('all');

  const filterOptions = [
    { value: 'all' as const, label: '🎯 전체 추천', description: '종합적으로 추천하는 상품들' },
    { value: 'rating' as const, label: '⭐ 높은 평점', description: '평점 4.5 이상의 우수한 상품들' },
    { value: 'review' as const, label: '💬 리뷰 많은', description: '많은 고객들이 검증한 인기 상품들' },
    { value: 'sale' as const, label: '🔥 할인 상품', description: '지금 놓치면 후회할 특가 상품들' },
    { value: 'new' as const, label: '✨ 신상품', description: '최근 출시된 트렌디한 상품들' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      filterRecommendedProducts();
    }
  }, [products, filterType]);

  const filterRecommendedProducts = () => {
    let filtered: Product[] = [];
    
    switch (filterType) {
      case 'all':
        // 종합 추천: 평점, 리뷰, 할인 등을 종합 고려
        filtered = products
          .map(p => ({
            ...p,
            recommendScore: (p.rating * 0.4) + 
                          (Math.min(p.reviewCount / 10, 50) * 0.3) + 
                          ((p.saleRate || 0) * 0.2) + 
                          (p.isNew ? 10 : 0)
          }))
          .sort((a, b) => (b as any).recommendScore - (a as any).recommendScore)
          .slice(0, 24);
        break;
        
      case 'rating':
        // 평점 4.3 이상
        filtered = products
          .filter(p => p.rating >= 4.3)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 20);
        break;
        
      case 'review':
        // 리뷰 80개 이상
        filtered = products
          .filter(p => p.reviewCount >= 80)
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, 20);
        break;
        
      case 'sale':
        // 할인 상품
        filtered = products
          .filter(p => p.isSale && p.saleRate && p.saleRate > 0)
          .sort((a, b) => (b.saleRate || 0) - (a.saleRate || 0))
          .slice(0, 20);
        break;
        
      case 'new':
        // 신상품
        filtered = products
          .filter(p => p.isNew)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
        break;
    }
    
    setRecommendedProducts(filtered);
  };

  const currentFilter = filterOptions.find(opt => opt.value === filterType)!;

  const getStatistics = () => {
    const totalProducts = products.length;
    const avgRating = products.length > 0 
      ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
      : '0.0';
    const saleProducts = products.filter(p => p.isSale).length;
    const newProducts = products.filter(p => p.isNew).length;
    
    return { totalProducts, avgRating, saleProducts, newProducts };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>추천 상품을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>오류: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="추천" 
        description="헤비몰이 엄선한 특별한 상품들을 만나보세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '추천' }
        ]}
      />
      
      <div className={styles.content}>
        {/* 통계 섹션 */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.totalProducts}</div>
              <div className={styles.statLabel}>전체 상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.avgRating}</div>
              <div className={styles.statLabel}>평균 평점</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.saleProducts}</div>
              <div className={styles.statLabel}>할인 상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{stats.newProducts}</div>
              <div className={styles.statLabel}>신상품</div>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className={styles.filterSection}>
          {filterOptions.map((option) => (
            <button 
              key={option.value}
              className={`${styles.filterButton} ${
                filterType === option.value ? styles.active : styles.inactive
              }`}
              onClick={() => setFilterType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className={styles.filterDescription}>
          <p>{currentFilter.description}</p>
        </div>

        <div className={styles.resultsInfo}>
          <span className={styles.resultCount}>
            총 {recommendedProducts.length}개 추천 상품
          </span>
        </div>

        {/* 상품 그리드 */}
        {recommendedProducts.length === 0 ? (
          <div className={styles.emptyMessage}>
            <p>해당 조건에 맞는 추천 상품이 없습니다.</p>
            <button 
              onClick={() => setFilterType('all')} 
              className={styles.resetButton}
            >
              전체 추천 상품 보기
            </button>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {recommendedProducts.map((product, index) => (
              <Link 
                key={product.id} 
                href={`/categories/${product.category}/products/${product.id}`}
                className={styles.productCard}
              >
                <div className={styles.rankBadge}>
                  {index + 1}
                </div>
                
                <div className={styles.productImage}>
                  {product.mainImage ? (
                    <img 
                      src={product.mainImage} 
                      alt={product.name}
                      className={styles.productImg}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span className={styles.productIcon}>
                        {product.category === 'accessories' && '👜'}
                        {product.category === 'bags' && '🎒'}
                        {product.category === 'bottoms' && '👖'}
                        {product.category === 'shoes' && '👟'}
                        {product.category === 'tops' && '👕'}
                      </span>
                    </div>
                  )}
                  
                  {product.isSale && product.saleRate && (
                    <div className={styles.discountBadge}>
                      {Math.round(product.saleRate)}%
                    </div>
                  )}
                  
                  {product.isNew && (
                    <div className={styles.newBadge}>
                      NEW
                    </div>
                  )}
                  
                  <div className={styles.recommendBadge}>
                    {filterType === 'rating' && '⭐'}
                    {filterType === 'review' && '💬'}
                    {filterType === 'sale' && '🔥'}
                    {filterType === 'new' && '✨'}
                    {filterType === 'all' && '🎯'}
                  </div>
                </div>
                
                <div className={styles.productInfo}>
                  <div className={styles.brandName}>{product.brand}</div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  
                  <div className={styles.statsSection}>
                    <span className={styles.rating}>⭐ {product.rating}</span>
                    <span className={styles.reviewCount}>({product.reviewCount})</span>
                    {filterType === 'sale' && product.saleRate && (
                      <span className={styles.saleInfo}>🔥 {product.saleRate}% 할인</span>
                    )}
                  </div>
                  
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
                  
                  <div className={styles.categoryInfo}>
                    📂 {product.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 더보기 섹션 */}
        <div className={styles.loadMoreSection}>
          <p className={styles.algorithmInfo}>
            🤖 AI 추천 알고리즘이 적용된 개인 맞춤 상품입니다
          </p>
        </div>
      </div>
    </div>
  );
}
