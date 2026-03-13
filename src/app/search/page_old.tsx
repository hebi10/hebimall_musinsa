"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import PageHeader from "../_components/PageHeader";
import { ProductService } from "@/shared/services/productService";
import { Product, ProductFilter, ProductSort } from "@/shared/types/product";
import styles from "./page.module.css";

interface SearchState {
  searchQuery: string;
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  currentPage: number;
  totalPages: number;
  sortBy: ProductSort;
  filters: ProductFilter;
}

const ITEMS_PER_PAGE = 20;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [state, setState] = useState<SearchState>({
    searchQuery: '',
    products: [],
    filteredProducts: [],
    loading: false,
    error: null,
    hasSearched: false,
    currentPage: 1,
    totalPages: 1,
    sortBy: { field: 'name', order: 'asc' },
    filters: {}
  });

  // URL 파라미터에서 초기 검색어 가져오기
  useEffect(() => {
    const query = searchParams?.get('q') || '';
    if (query && query !== state.searchQuery) {
      setState(prev => ({ ...prev, searchQuery: query }));
      handleSearch(query);
    }
  }, [searchParams]);

  // 검색 실행
  const handleSearch = useCallback(async (query?: string) => {
    const searchQuery = query || state.searchQuery;
    
    if (!searchQuery.trim()) {
      setState(prev => ({ 
        ...prev, 
        products: [], 
        filteredProducts: [], 
        hasSearched: false,
        error: null 
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await ProductService.searchProducts(searchQuery);
      const filtered = applyFilters(results, state.filters);
      const sorted = await ProductService.getSortedProducts(filtered, state.sortBy);
      
      setState(prev => ({
        ...prev,
        products: results,
        filteredProducts: sorted,
        loading: false,
        hasSearched: true,
        currentPage: 1,
        totalPages: Math.ceil(sorted.length / ITEMS_PER_PAGE)
      }));

      // URL 업데이트
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchQuery);
      window.history.replaceState({}, '', url.toString());

    } catch (error) {
      console.error('검색 실패:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '검색 중 오류가 발생했습니다. 다시 시도해주세요.',
        hasSearched: true
      }));
    }
  }, [state.searchQuery, state.filters, state.sortBy]);

  // 필터 적용
  const applyFilters = useCallback((products: Product[], filters: ProductFilter): Product[] => {
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.rating && product.rating < filters.rating) return false;
      if (filters.isNew !== undefined && product.isNew !== filters.isNew) return false;
      if (filters.isSale !== undefined && product.isSale !== filters.isSale) return false;
      return true;
    });
  }, []);

  // 필터 변경
  const handleFilterChange = useCallback(async (newFilters: Partial<ProductFilter>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    const filtered = applyFilters(state.products, updatedFilters);
    const sorted = await ProductService.getSortedProducts(filtered, state.sortBy);
    
    setState(prev => ({
      ...prev,
      filters: updatedFilters,
      filteredProducts: sorted,
      currentPage: 1,
      totalPages: Math.ceil(sorted.length / ITEMS_PER_PAGE)
    }));
  }, [state.products, state.sortBy, applyFilters]);

  // 정렬 변경
  const handleSortChange = useCallback(async (sortBy: ProductSort) => {
    const sorted = await ProductService.getSortedProducts(state.filteredProducts, sortBy);
    
    setState(prev => ({
      ...prev,
      sortBy,
      filteredProducts: sorted,
      currentPage: 1
    }));
  }, [state.filteredProducts]);

  // 인기 검색어 클릭
  const handlePopularSearchClick = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchQuery: term }));
    handleSearch(term);
  }, [handleSearch]);

  // 페이지네이션
  const getCurrentPageProducts = useCallback((): Product[] => {
    const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return state.filteredProducts.slice(startIndex, endIndex);
  }, [state.filteredProducts, state.currentPage]);

  // 브랜드 목록 추출
  const availableBrands = useCallback((): string[] => {
    const brands = Array.from(new Set(state.products.map(p => p.brand)));
    return brands.sort();
  }, [state.products]);

  // 카테고리 목록 추출
  const availableCategories = useCallback((): Array<{id: string, name: string}> => {
    const categories = Array.from(new Set(state.products.map(p => p.category)));
    const categoryMap: Record<string, string> = {
      'tops': '상의',
      'bottoms': '하의', 
      'shoes': '신발',
      'bags': '가방',
      'accessories': '액세서리',
      'outdoor': '아웃도어',
      'sports': '스포츠'
    };
    
    return categories.map(cat => ({
      id: cat,
      name: categoryMap[cat] || cat
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.products]);

  const popularSearchTerms = [
    '후드티', '청바지', '스니커즈', '맨투맨', 
    '코트', '부츠', '니트', '원피스', 
    '블레이저', '트렌치코트', '가디건', '조거팬츠'
  ];

  const currentPageProducts = getCurrentPageProducts();

  return (
    <div className={styles.container}>
      <PageHeader 
        title="상품 검색"
        description="원하는 상품을 찾아보세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '검색' }
        ]}
      />

      <div className={styles.content}>
        {/* 검색 헤더 */}
        <div className={styles.searchHeader}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="상품명, 브랜드명을 검색해보세요"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button 
              onClick={() => handleSearch()}
              className={styles.searchButton}
              disabled={state.loading}
            >
              {state.loading ? '검색 중...' : '검색'}
            </button>
          </div>
        </div>

        {/* 인기 검색어 */}
        {!state.hasSearched && (
          <div className={styles.popularSearchSection}>
            <h2 className={styles.sectionTitle}>인기 검색어</h2>
            <div className={styles.popularSearchTags}>
              {popularSearchTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularSearchClick(term)}
                  className={styles.popularTag}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        {state.hasSearched && (
          <div className={styles.resultsSection}>
            {/* 결과 헤더 */}
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>
                <h2 className={styles.resultsTitle}>
                  '{state.searchQuery}' 검색 결과
                </h2>
                <p className={styles.resultsCount}>
                  총 {state.filteredProducts.length}개의 상품
                </p>
              </div>

              <div className={styles.controlsWrapper}>
                {/* 정렬 */}
                <select 
                  value={`${state.sortBy.field}-${state.sortBy.order}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    handleSortChange({ 
                      field: field as ProductSort['field'], 
                      order: order as ProductSort['order'] 
                    });
                  }}
                  className={styles.sortSelect}
                >
                  <option value="name-asc">이름순</option>
                  <option value="price-asc">낮은 가격순</option>
                  <option value="price-desc">높은 가격순</option>
                  <option value="rating-desc">평점순</option>
                  <option value="createdAt-desc">최신순</option>
                </select>
              </div>
            </div>

            {/* 필터 */}
            <div className={styles.filtersSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>카테고리:</label>
                <select 
                  value={state.filters.category || ''}
                  onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                  className={styles.filterSelect}
                >
                  <option value="">전체</option>
                  {availableCategories().map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>브랜드:</label>
                <select 
                  value={state.filters.brand || ''}
                  onChange={(e) => handleFilterChange({ brand: e.target.value || undefined })}
                  className={styles.filterSelect}
                >
                  <option value="">전체</option>
                  {availableBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>가격대:</label>
                <select 
                  value={state.filters.maxPrice ? `${state.filters.maxPrice}` : ''}
                  onChange={(e) => {
                    const maxPrice = e.target.value ? parseInt(e.target.value) : undefined;
                    handleFilterChange({ maxPrice });
                  }}
                  className={styles.filterSelect}
                >
                  <option value="">전체</option>
                  <option value="30000">3만원 이하</option>
                  <option value="50000">5만원 이하</option>
                  <option value="100000">10만원 이하</option>
                  <option value="200000">20만원 이하</option>
                </select>
              </div>

              <div className={styles.filterTags}>
                <button 
                  onClick={() => handleFilterChange({ isNew: state.filters.isNew ? undefined : true })}
                  className={`${styles.filterTag} ${state.filters.isNew ? styles.active : ''}`}
                >
                  신상품
                </button>
                <button 
                  onClick={() => handleFilterChange({ isSale: state.filters.isSale ? undefined : true })}
                  className={`${styles.filterTag} ${state.filters.isSale ? styles.active : ''}`}
                >
                  세일상품
                </button>
                <button 
                  onClick={() => handleFilterChange({ rating: state.filters.rating ? undefined : 4 })}
                  className={`${styles.filterTag} ${state.filters.rating ? styles.active : ''}`}
                >
                  평점 4점 이상
                </button>
              </div>
            </div>

            {/* 상품 목록 */}
            {state.loading ? (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>검색 중...</p>
              </div>
            ) : state.error ? (
              <div className={styles.error}>
                <h3>검색 실패</h3>
                <p>{state.error}</p>
                <button 
                  onClick={() => handleSearch()}
                  className={styles.retryButton}
                >
                  다시 시도
                </button>
              </div>
            ) : currentPageProducts.length > 0 ? (
              <>
                <div className={styles.productGrid}>
                  {currentPageProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onClick={(product) => router.push(`/products/${product.id}`)}
                    />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {state.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={state.currentPage === 1}
                      className={styles.pageButton}
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: Math.min(state.totalPages, 5) }, (_, i) => {
                      const pageNum = state.currentPage <= 3 ? i + 1 : state.currentPage - 2 + i;
                      if (pageNum > state.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setState(prev => ({ ...prev, currentPage: pageNum }))}
                          className={`${styles.pageButton} ${pageNum === state.currentPage ? styles.active : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={state.currentPage === state.totalPages}
                      className={styles.pageButton}
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noResults}>
                <h3>검색 결과가 없습니다</h3>
                <p>'{state.searchQuery}'에 대한 상품을 찾을 수 없습니다.</p>
                <div className={styles.searchSuggestions}>
                  <p>다른 검색어를 시도해보세요:</p>
                  <div className={styles.suggestionTags}>
                    {popularSearchTerms.slice(0, 6).map(term => (
                      <button
                        key={term}
                        onClick={() => handlePopularSearchClick(term)}
                        className={styles.suggestionTag}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 검색 전 초기 화면 */}
        {!state.hasSearched && !state.loading && (
          <div className={styles.initialState}>
            <div className={styles.searchTip}>
              <h3>검색 팁</h3>
              <ul className={styles.tipList}>
                <li>상품명이나 브랜드명으로 검색해보세요</li>
                <li>카테고리와 필터를 활용해 원하는 상품을 찾아보세요</li>
                <li>여러 검색어를 조합해서 더 정확한 결과를 얻어보세요</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
