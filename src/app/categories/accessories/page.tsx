'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../clothing/page.module.css';

export default function AccessoriesPage() {
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const subCategories = [
    { id: 'all', name: '전체' },
    { id: 'hat', name: '모자' },
    { id: 'belt', name: '벨트' },
    { id: 'sunglasses', name: '선글라스' },
    { id: 'scarf', name: '스카프' },
    { id: 'gloves', name: '장갑' }
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
      name: '베이직 캡모자',
      price: 29000,
      originalPrice: 35000,
      discount: 17,
      rating: 4.3,
      reviewCount: 156,
      image: '/products/cap1.jpg',
      brand: 'BASIC',
      category: 'hat'
    },
    {
      id: 2,
      name: '레더 벨트',
      price: 65000,
      originalPrice: null,
      discount: 0,
      rating: 4.5,
      reviewCount: 89,
      image: '/products/belt1.jpg',
      brand: 'LEATHER',
      category: 'belt'
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
        <span className={styles.breadcrumbCurrent}>패션소품</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>패션소품</h1>
        <p className={styles.subtitle}>스타일을 완성하는 디테일한 패션 아이템</p>
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
                <span className={styles.productIcon}>🧢</span>
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
