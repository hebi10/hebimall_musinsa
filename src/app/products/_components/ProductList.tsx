'use client';

import { useState, useEffect } from 'react';
import { useProduct } from '@/context/productProvider';
import { ProductFilter, ProductSort } from '@/shared/types/product';
import ProductCard from './ProductCard';
import styles from './ProductList.module.css';

export default function ProductList() {
  const {
    filteredProducts,
    categories,
    loading,
    error,
    searchProducts,
    filterProducts,
    sortProducts,
    clearFilters,
    currentFilter,
    currentSort,
    searchQuery,
    calculateAverageRating,
  } = useProduct();

  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<ProductSort>(currentSort);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      searchProducts(localSearchTerm);
    } else {
      clearFilters();
    }
  };

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    const filter: ProductFilter = {
      ...currentFilter,
      category: category || undefined
    };
    await filterProducts(filter);
  };

  const handleSort = async (sort: ProductSort) => {
    setSelectedSort(sort);
    await sortProducts(sort);
  };

  const handlePriceFilter = async () => {
    const filter: ProductFilter = {
      ...currentFilter,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    };
    await filterProducts(filter);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setLocalSearchTerm('');
    setPriceRange({ min: 0, max: 1000000 });
    clearFilters();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>상품을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>상품을 불러오는데 실패했습니다: {error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 통계 정보 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{filteredProducts.length}</div>
          <div className={styles.statLabel}>전체 상품</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {filteredProducts.filter(p => p.isNew).length}
          </div>
          <div className={styles.statLabel}>신상품</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {filteredProducts.filter(p => p.isSale).length}
          </div>
          <div className={styles.statLabel}>세일 상품</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {calculateAverageRating(filteredProducts)}
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
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.searchInput}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            검색
          </button>
        </div>

        <div className={styles.filters}>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={`${selectedSort.field}-${selectedSort.order}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [any, 'asc' | 'desc'];
              handleSort({ field, order });
            }}
            className={styles.sortSelect}
          >
            <option value="createdAt-desc">최신순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
            <option value="rating-desc">평점순</option>
            <option value="name-asc">이름순</option>
          </select>

          <button onClick={handleClearFilters} className={styles.clearButton}>
            필터 초기화
          </button>
        </div>
      </div>

      {/* 가격 범위 필터 */}
      <div className={styles.priceFilter}>
        <label>가격 범위:</label>
        <input
          type="number"
          placeholder="최소 가격"
          value={priceRange.min}
          onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
          className={styles.priceInput}
        />
        <span>~</span>
        <input
          type="number"
          placeholder="최대 가격"
          value={priceRange.max}
          onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
          className={styles.priceInput}
        />
        <button onClick={handlePriceFilter} className={styles.applyButton}>
          적용
        </button>
      </div>

      {/* 상품 목록 */}
      <div className={styles.productGrid}>
        {displayedProducts.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            brand={product.brand}
            price={product.price}
            originalPrice={product.originalPrice}
            isNew={product.isNew}
            isSale={product.isSale}
            saleRate={product.saleRate}
            rating={product.rating}
            reviewCount={product.reviewCount}
            image={product.mainImage || product.images[0]} // 대표 이미지 우선 사용
            stock={product.stock}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <p>검색 조건에 맞는 상품이 없습니다.</p>
          <button onClick={handleClearFilters} className={styles.clearButton}>
            필터 초기화
          </button>
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
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <button
                key={pageNumber}
                className={`${styles.pageButton} ${currentPage === pageNumber ? styles.active : ''}`}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          
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
