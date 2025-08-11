'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../clothing/page.module.css';

export default function BagsPage() {
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const subCategories = [
    { id: 'all', name: '전체' },
    { id: 'backpack', name: '백팩' },
    { id: 'tote', name: '토트백' },
    { id: 'crossbody', name: '크로스백' },
    { id: 'clutch', name: '클러치' },
    { id: 'wallet', name: '지갑' },
    { id: 'travel', name: '여행가방' }
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
      name: '미니멀 백팩',
      price: 79000,
      originalPrice: 95000,
      discount: 17,
      rating: 4.5,
      reviewCount: 145,
      image: '/products/backpack1.jpg',
      brand: 'MINIMAL',
      category: 'backpack'
    },
    {
      id: 2,
      name: '레더 토트백',
      price: 129000,
      originalPrice: null,
      discount: 0,
      rating: 4.7,
      reviewCount: 89,
      image: '/products/tote1.jpg',
      brand: 'LEATHER',
      category: 'tote'
    },
    {
      id: 3,
      name: '크로스백',
      price: 65000,
      originalPrice: 79000,
      discount: 18,
      rating: 4.3,
      reviewCount: 234,
      image: '/products/crossbag1.jpg',
      brand: 'STREET',
      category: 'crossbody'
    },
    {
      id: 4,
      name: '프리미엄 지갑',
      price: 89000,
      originalPrice: 110000,
      discount: 19,
      rating: 4.8,
      reviewCount: 67,
      image: '/products/wallet1.jpg',
      brand: 'PREMIUM',
      category: 'wallet'
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
        <span className={styles.breadcrumbCurrent}>가방</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>가방</h1>
        <p className={styles.subtitle}>실용적이고 세련된 가방으로 스타일 완성</p>
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
                <span className={styles.productIcon}>👜</span>
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
