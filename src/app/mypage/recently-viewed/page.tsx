'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface ViewedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  viewedAt: string;
  category: string;
}

export default function RecentlyViewedPage() {
  const [sortBy, setSortBy] = useState<string>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const sortOptions = [
    { value: 'recent', label: '최근 본 순' },
    { value: 'price-low', label: '낮은 가격순' },
    { value: 'price-high', label: '높은 가격순' },
    { value: 'name', label: '상품명순' }
  ];

  const categoryOptions = ['전체', '상의', '하의', '신발', '액세서리'];

  const viewedProducts: ViewedProduct[] = [
    {
      id: 'P001',
      name: '오버핏 후드 스웨트셔츠',
      brand: 'MUSINSA STANDARD',
      price: 49000,
      originalPrice: 69000,
      image: '/api/placeholder/200/250',
      viewedAt: '2024.12.01 14:30',
      category: '상의'
    },
    {
      id: 'P002',
      name: '와이드 데님 팬츠',
      brand: 'THISISNEVERTHAT',
      price: 124500,
      image: '/api/placeholder/200/250',
      viewedAt: '2024.12.01 13:45',
      category: '하의'
    },
    {
      id: 'P003',
      name: '베이직 크루넥 니트',
      brand: 'UNIQLO',
      price: 53000,
      originalPrice: 79000,
      image: '/api/placeholder/200/250',
      viewedAt: '2024.11.30 16:20',
      category: '상의'
    },
    {
      id: 'P004',
      name: '캐주얼 스니커즈',
      brand: 'NIKE',
      price: 159000,
      image: '/api/placeholder/200/250',
      viewedAt: '2024.11.29 11:15',
      category: '신발'
    }
  ];

  const filteredAndSortedProducts = viewedProducts
    .filter(product => selectedCategory === '전체' || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>최근 본 상품</h2>
        <p className={styles.pageDesc}>최근에 확인한 상품들을 다시 살펴보세요.</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👀</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>24</div>
            <div className={styles.statLabel}>전체 조회상품</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>5</div>
            <div className={styles.statLabel}>장바구니 담은 상품</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💜</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>찜한 상품</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📱</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>오늘</div>
            <div className={styles.statLabel}>마지막 조회</div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>카테고리</label>
          <div className={styles.filterButtons}>
            {categoryOptions.map((category) => (
              <button
                key={category}
                className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.sortGroup}>
          <label className={styles.filterLabel}>정렬</label>
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>상품 목록</h3>
          <div className={styles.resultCount}>총 {filteredAndSortedProducts.length}개</div>
        </div>

        {filteredAndSortedProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {filteredAndSortedProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImageContainer}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className={styles.productImage}
                  />
                  <div className={styles.productActions}>
                    <button className={styles.actionButton} title="찜하기">
                      💜
                    </button>
                    <button className={styles.actionButton} title="장바구니">
                      🛒
                    </button>
                    <button className={styles.actionButton} title="삭제">
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className={styles.productInfo}>
                  <div className={styles.productBrand}>{product.brand}</div>
                  <h4 className={styles.productName}>{product.name}</h4>
                  
                  <div className={styles.productPricing}>
                    {product.originalPrice && (
                      <span className={styles.originalPrice}>
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                    <span className={styles.currentPrice}>
                      {product.price.toLocaleString()}원
                    </span>
                    {product.originalPrice && (
                      <span className={styles.discountRate}>
                        {Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.viewedInfo}>
                    <span className={styles.categoryTag}>{product.category}</span>
                    <span className={styles.viewedAt}>{product.viewedAt}</span>
                  </div>
                </div>

                <div className={styles.productFooter}>
                  <Link href={`/product/${product.id}`} className={styles.viewButton}>
                    다시보기
                  </Link>
                  <button className={styles.cartButton}>
                    장바구니
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👀</div>
            <div className={styles.emptyTitle}>최근 본 상품이 없습니다</div>
            <div className={styles.emptyDesc}>상품을 둘러보고 관심있는 아이템을 확인해보세요.</div>
            <Link href="/" className={styles.shopButton}>
              쇼핑하러 가기
            </Link>
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {filteredAndSortedProducts.length > 0 && (
        <div className={styles.clearSection}>
          <button className={styles.clearAllButton}>
            전체 기록 삭제
          </button>
        </div>
      )}
    </div>
  );
}
