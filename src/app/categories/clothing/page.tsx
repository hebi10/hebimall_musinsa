'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ClothingPage() {
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const subCategories = [
    { id: 'all', name: '전체' },
    { id: 'tshirt', name: '티셔츠' },
    { id: 'shirt', name: '셔츠' },
    { id: 'hoodie', name: '후드/스웨트셔츠' },
    { id: 'knit', name: '니트/스웨터' },
    { id: 'pants', name: '바지' },
    { id: 'jacket', name: '재킷/아우터' },
    { id: 'dress', name: '원피스/스커트' }
  ];

  const sortOptions = [
    { value: 'popular', label: '인기순' },
    { value: 'newest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
    { value: 'review', label: '리뷰 많은순' }
  ];

  // 더미 상품 데이터
  const products = [
    {
      id: 1,
      name: '베이직 코튼 티셔츠',
      price: 29000,
      originalPrice: 35000,
      discount: 17,
      rating: 4.5,
      reviewCount: 128,
      image: '/products/tshirt1.jpg',
      brand: 'HEBIMALL',
      category: 'tshirt'
    },
    {
      id: 2,
      name: '오버핏 후드 스웨트셔츠',
      price: 65000,
      originalPrice: 79000,
      discount: 18,
      rating: 4.8,
      reviewCount: 89,
      image: '/products/hoodie1.jpg',
      brand: 'STREET WEAR',
      category: 'hoodie'
    },
    {
      id: 3,
      name: '슬림핏 정장 셔츠',
      price: 45000,
      originalPrice: null,
      discount: 0,
      rating: 4.3,
      reviewCount: 67,
      image: '/products/shirt1.jpg',
      brand: 'FORMAL',
      category: 'shirt'
    },
    {
      id: 4,
      name: '캐시미어 블렌드 니트',
      price: 89000,
      originalPrice: 120000,
      discount: 26,
      rating: 4.7,
      reviewCount: 45,
      image: '/products/knit1.jpg',
      brand: 'LUXURY',
      category: 'knit'
    },
    {
      id: 5,
      name: '스키니핏 청바지',
      price: 55000,
      originalPrice: 69000,
      discount: 20,
      rating: 4.4,
      reviewCount: 156,
      image: '/products/jeans1.jpg',
      brand: 'DENIM CO',
      category: 'pants'
    },
    {
      id: 6,
      name: '레더 라이더 재킷',
      price: 159000,
      originalPrice: 199000,
      discount: 20,
      rating: 4.9,
      reviewCount: 23,
      image: '/products/jacket1.jpg',
      brand: 'LEATHER',
      category: 'jacket'
    }
  ];

  const filteredProducts = selectedSubCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedSubCategory);

  return (
    <div className={styles.container}>
      {/* 브레드크럼 */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>홈</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <Link href="/categories" className={styles.breadcrumbLink}>카테고리</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <span className={styles.breadcrumbCurrent}>의류</span>
      </div>

      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>의류</h1>
        <p className={styles.subtitle}>스타일리시한 의류로 나만의 패션을 완성하세요</p>
      </div>

      {/* 필터 및 정렬 */}
      <div className={styles.filterSection}>
        {/* 서브 카테고리 */}
        <div className={styles.subCategories}>
          {subCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              className={`${styles.subCategoryButton} ${
                selectedSubCategory === subCategory.id ? styles.active : ''
              }`}
              onClick={() => setSelectedSubCategory(subCategory.id)}
            >
              {subCategory.name}
            </button>
          ))}
        </div>

        {/* 정렬 옵션 */}
        <div className={styles.sortSection}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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

      {/* 상품 결과 */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultCount}>총 {filteredProducts.length}개 상품</span>
      </div>

      {/* 상품 그리드 */}
      <div className={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <div className={styles.imagePlaceholder}>
                <span className={styles.productIcon}>👕</span>
              </div>
              {product.discount > 0 && (
                <div className={styles.discountBadge}>
                  {product.discount}%
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
                {product.originalPrice && (
                  <span className={styles.originalPrice}>
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <div className={styles.ratingSection}>
                <span className={styles.rating}>⭐ {product.rating}</span>
                <span className={styles.reviewCount}>({product.reviewCount})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className={styles.loadMoreSection}>
        <button className={styles.loadMoreButton}>
          더 많은 상품 보기
        </button>
      </div>
    </div>
  );
}
