'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../clothing/page.module.css';

export default function ShoesPage() {
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const subCategories = [
    { id: 'all', name: '전체' },
    { id: 'sneakers', name: '운동화/스니커즈' },
    { id: 'dress', name: '구두' },
    { id: 'boots', name: '부츠' },
    { id: 'sandals', name: '샌들/슬리퍼' },
    { id: 'loafers', name: '로퍼' },
    { id: 'hiking', name: '등산화' }
  ];

  const sortOptions = [
    { value: 'popular', label: '인기순' },
    { value: 'newest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
    { value: 'review', label: '리뷰 많은순' }
  ];

  const products = [
    {
      id: 1,
      name: '클래식 화이트 스니커즈',
      price: 89000,
      originalPrice: 110000,
      discount: 19,
      rating: 4.6,
      reviewCount: 234,
      image: '/products/sneakers1.jpg',
      brand: 'SPORT',
      category: 'sneakers'
    },
    {
      id: 2,
      name: '정장용 옥스포드 구두',
      price: 129000,
      originalPrice: null,
      discount: 0,
      rating: 4.4,
      reviewCount: 67,
      image: '/products/dress1.jpg',
      brand: 'FORMAL',
      category: 'dress'
    },
    {
      id: 3,
      name: '첼시 부츠',
      price: 159000,
      originalPrice: 189000,
      discount: 16,
      rating: 4.8,
      reviewCount: 89,
      image: '/products/boots1.jpg',
      brand: 'CLASSIC',
      category: 'boots'
    },
    {
      id: 4,
      name: '여름 샌들',
      price: 45000,
      originalPrice: 59000,
      discount: 24,
      rating: 4.2,
      reviewCount: 156,
      image: '/products/sandals1.jpg',
      brand: 'SUMMER',
      category: 'sandals'
    }
  ];

  const filteredProducts = selectedSubCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedSubCategory);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>홈</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <Link href="/categories" className={styles.breadcrumbLink}>카테고리</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <span className={styles.breadcrumbCurrent}>신발</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>신발</h1>
        <p className={styles.subtitle}>편안하고 스타일리시한 신발로 완벽한 발걸음을</p>
      </div>

      <div className={styles.filterSection}>
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

      <div className={styles.resultsInfo}>
        <span className={styles.resultCount}>총 {filteredProducts.length}개 상품</span>
      </div>

      <div className={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <div className={styles.imagePlaceholder}>
                <span className={styles.productIcon}>👟</span>
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

      <div className={styles.loadMoreSection}>
        <button className={styles.loadMoreButton}>
          더 많은 상품 보기
        </button>
      </div>
    </div>
  );
}
