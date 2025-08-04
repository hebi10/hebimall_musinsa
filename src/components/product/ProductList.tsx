'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/src/types/product';
import { mockProducts } from '@/src/mocks/products';
import ProductCard from '@/src/components/common/ProductCard';
import Button from '@/src/components/common/Button';
import styles from './ProductList.module.css';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price-low' | 'price-high' | 'rating'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 12;

  useEffect(() => {
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

    // 정렬
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, categoryFilter, sortBy, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className={styles.container}>
      {/* 통계 정보 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{products.length}</div>
          <div className={styles.statLabel}>전체 상품</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{products.filter(p => p.isNew).length}</div>
          <div className={styles.statLabel}>신상품</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{products.filter(p => p.isSale).length}</div>
          <div className={styles.statLabel}>세일 상품</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {(products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)}
          </div>
          <div className={styles.statLabel}>평균 평점</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="상품명, 브랜드로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">전체 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'price-low' | 'price-high' | 'rating')}
            className={styles.sortSelect}
          >
            <option value="latest">최신순</option>
            <option value="price-low">가격 낮은순</option>
            <option value="price-high">가격 높은순</option>
            <option value="rating">평점순</option>
          </select>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className={styles.categoryTabs}>
        <button
          className={`${styles.categoryTab} ${categoryFilter === 'all' ? styles.active : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          전체
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.categoryTab} ${categoryFilter === category ? styles.active : ''}`}
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      <div className={styles.productGrid}>
        {displayedProducts.map(product => (
          <Link key={product.id} href={`/products/${product.id}`} className={styles.productLink}>
            <ProductCard
              id={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              originalPrice={product.originalPrice}
              isNew={product.isNew}
              isSale={product.isSale}
              rating={product.rating}
              reviewCount={product.reviewCount}
              image={product.images[0]}
            />
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <p>검색 조건에 맞는 상품이 없습니다.</p>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {/* 결과 정보 */}
      <div className={styles.resultInfo}>
        <span>
          전체 {filteredProducts.length}개 상품 중 {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)}개 표시
        </span>
      </div>
    </div>
  );
}
