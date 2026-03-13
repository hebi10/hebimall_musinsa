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

export default function SearchClient() {
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

  // URL 파라미터에서 검색어 가져오기
  useEffect(() => {
    const query = searchParams.get('q') || '';
    if (query && query !== state.searchQuery) {
      setState(prev => ({ ...prev, searchQuery: query }));
      handleSearch(query);
    }
  }, [searchParams]);

  // 검색 실행
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ 
        ...prev, 
        hasSearched: false,
        products: [],
        filteredProducts: [],
        error: null
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 모든 상품 가져오기 - 정적 메서드 사용
      const allProducts = await ProductService.getAllProducts();
      
      // 검색어로 필터링
      const searchResults = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      setState(prev => ({
        ...prev,
        products: searchResults,
        filteredProducts: searchResults,
        hasSearched: true,
        loading: false,
        currentPage: 1,
        totalPages: Math.ceil(searchResults.length / ITEMS_PER_PAGE)
      }));

    } catch (error) {
      console.error('검색 오류:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '검색 중 오류가 발생했습니다.',
        hasSearched: true
      }));
    }
  }, []);

  // 필터 적용
  const applyFilters = useCallback(() => {
    let filtered = [...state.products];

    // 카테고리 필터
    if (state.filters.category) {
      filtered = filtered.filter((product: Product) => 
        product.category.toLowerCase() === state.filters.category?.toLowerCase()
      );
    }

    // 브랜드 필터
    if (state.filters.brand) {
      filtered = filtered.filter((product: Product) => 
        product.brand.toLowerCase() === state.filters.brand?.toLowerCase()
      );
    }

    // 가격 필터
    if (state.filters.minPrice !== undefined) {
      filtered = filtered.filter((product: Product) => product.price >= state.filters.minPrice!);
    }
    if (state.filters.maxPrice !== undefined) {
      filtered = filtered.filter((product: Product) => product.price <= state.filters.maxPrice!);
    }

    // 평점 필터
    if (state.filters.rating) {
      filtered = filtered.filter((product: Product) => product.rating >= state.filters.rating!);
    }

    // 신상품 필터
    if (state.filters.isNew) {
      filtered = filtered.filter((product: Product) => product.isNew);
    }

    // 세일 상품 필터
    if (state.filters.isSale) {
      filtered = filtered.filter((product: Product) => product.isSale);
    }

    setState(prev => ({
      ...prev,
      filteredProducts: filtered,
      currentPage: 1,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    }));
  }, [state.products, state.filters]);

  // 정렬 적용
  const applySorting = useCallback(() => {
    const sorted = [...state.filteredProducts].sort((a, b) => {
      const { field, order } = state.sortBy;
      
      let aValue: any = a[field];
      let bValue: any = b[field];

      if (field === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    setState(prev => ({ ...prev, filteredProducts: sorted }));
  }, [state.filteredProducts, state.sortBy]);

  // 필터 변경시 적용
  useEffect(() => {
    if (state.products.length > 0) {
      applyFilters();
    }
  }, [state.filters, applyFilters]);

  // 정렬 변경시 적용
  useEffect(() => {
    if (state.filteredProducts.length > 0) {
      applySorting();
    }
  }, [state.sortBy, applySorting]);

  // 검색어 입력 핸들러
  const handleSearchInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    
    if (query.trim()) {
      // URL 업데이트
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // 인기 검색어 클릭
  const handlePopularSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // 필터 변경
  const handleFilterChange = (filterType: keyof ProductFilter, value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  // 정렬 변경
  const handleSortChange = (field: ProductSort['field'], order: ProductSort['order']) => {
    setState(prev => ({
      ...prev,
      sortBy: { field, order }
    }));
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 현재 페이지의 상품들
  const currentProducts = state.filteredProducts.slice(
    (state.currentPage - 1) * ITEMS_PER_PAGE,
    state.currentPage * ITEMS_PER_PAGE
  );

  // 고유한 카테고리와 브랜드 목록
  const uniqueCategories = [...new Set(state.products.map(p => p.category))];
  const uniqueBrands = [...new Set(state.products.map(p => p.brand))];

  // 인기 검색어
  const popularSearches = ['후드티', '청바지', '스니커즈', '맨투맨', '원피스', '가디건'];

  return (
    <div className={styles.container}>
      <PageHeader 
        title="상품 검색"
      />
      
      <div className={styles.content}>
        {/* 검색 헤더 */}
        <div className={styles.searchHeader}>
          <form onSubmit={handleSearchInput} className={styles.searchInputWrapper}>
            <input
              type="text"
              name="search"
              placeholder="상품명, 브랜드명으로 검색하세요"
              defaultValue={state.searchQuery}
              className={styles.searchInput}
            />
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={state.loading}
            >
              {state.loading ? '검색 중...' : '검색'}
            </button>
          </form>
        </div>

        {/* 초기 상태: 검색 안내 및 인기 검색어 */}
        {!state.hasSearched && (
          <div className={styles.initialState}>
            <div className={styles.searchTip}>
              <div className={styles.searchTipIcon}></div>
              <h3>상품을 검색해보세요</h3>
              <ul className={styles.tipList}>
                <li>상품명이나 브랜드명으로 검색할 수 있습니다</li>
                <li>필터를 사용해서 원하는 조건으로 상품을 찾아보세요</li>
                <li>아래 인기 검색어를 클릭해서 바로 검색할 수 있습니다</li>
              </ul>
            </div>

            <div className={styles.popularSearchSection}>
              <h3 className={styles.sectionTitle}>인기 검색어</h3>
              <div className={styles.popularSearchTags}>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    className={styles.popularTag}
                    onClick={() => handlePopularSearch(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        {state.hasSearched && (
          <div className={styles.resultsSection}>
            {/* 검색 결과 헤더 */}
            <div className={styles.resultsHeader}>
              <div className={styles.resultsInfo}>
                <h2 className={styles.resultsTitle}>
                  '{state.searchQuery}' 검색 결과
                </h2>
                <p className={styles.resultsCount}>
                  총 {state.filteredProducts.length.toLocaleString()}개의 상품
                </p>
              </div>
              
              <div className={styles.controlsWrapper}>
                <select
                  className={styles.sortSelect}
                  value={`${state.sortBy.field}-${state.sortBy.order}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-') as [ProductSort['field'], ProductSort['order']];
                    handleSortChange(field, order);
                  }}
                >
                  <option value="name-asc">이름순 (가나다순)</option>
                  <option value="name-desc">이름순 (다나가순)</option>
                  <option value="price-asc">가격순 (낮은가격)</option>
                  <option value="price-desc">가격순 (높은가격)</option>
                  <option value="rating-desc">평점순 (높은평점)</option>
                  <option value="createdAt-desc">최신순</option>
                  <option value="createdAt-asc">오래된순</option>
                </select>
              </div>
            </div>

            {/* 필터 섹션 */}
            {(uniqueCategories.length > 1 || uniqueBrands.length > 1) && (
              <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>카테고리:</label>
                  <select
                    className={styles.filterSelect}
                    value={state.filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  >
                    <option value="">전체</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>브랜드:</label>
                  <select
                    className={styles.filterSelect}
                    value={state.filters.brand || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                  >
                    <option value="">전체</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>평점:</label>
                  <select
                    className={styles.filterSelect}
                    value={state.filters.rating || ''}
                    onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">전체</option>
                    <option value="4">4점 이상</option>
                    <option value="3">3점 이상</option>
                    <option value="2">2점 이상</option>
                  </select>
                </div>

                {/* 필터 태그 */}
                <div className={styles.filterTags}>
                  <button
                    className={`${styles.filterTag} ${state.filters.isNew ? styles.active : ''}`}
                    onClick={() => handleFilterChange('isNew', !state.filters.isNew)}
                  >
                    신상품
                  </button>
                  <button
                    className={`${styles.filterTag} ${state.filters.isSale ? styles.active : ''}`}
                    onClick={() => handleFilterChange('isSale', !state.filters.isSale)}
                  >
                    할인상품
                  </button>
                </div>
              </div>
            )}

            {/* 로딩 상태 */}
            {state.loading && (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>검색 중입니다...</p>
              </div>
            )}

            {/* 에러 상태 */}
            {state.error && (
              <div className={styles.error}>
                <div className={styles.errorIcon}></div>
                <h3>검색 오류</h3>
                <p>{state.error}</p>
                <button 
                  className={styles.retryButton}
                  onClick={() => handleSearch(state.searchQuery)}
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* 검색 결과 없음 */}
            {!state.loading && !state.error && state.filteredProducts.length === 0 && (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}></div>
                <h3>검색 결과가 없습니다</h3>
                <p>'{state.searchQuery}'에 대한 검색 결과를 찾을 수 없습니다.</p>
                
                <div className={styles.searchSuggestions}>
                  <p>다른 검색어로 시도해보세요:</p>
                  <div className={styles.suggestionTags}>
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        className={styles.suggestionTag}
                        onClick={() => handlePopularSearch(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 상품 그리드 */}
            {!state.loading && !state.error && currentProducts.length > 0 && (
              <>
                <div className={styles.productGrid}>
                  {currentProducts.map((product) => (
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
                      className={styles.pageButton}
                      onClick={() => handlePageChange(state.currentPage - 1)}
                      disabled={state.currentPage === 1}
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          className={`${styles.pageButton} ${state.currentPage === pageNumber ? styles.active : ''}`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      className={styles.pageButton}
                      onClick={() => handlePageChange(state.currentPage + 1)}
                      disabled={state.currentPage === state.totalPages}
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}