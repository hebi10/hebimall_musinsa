"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CategoryBasedProductService } from "@/shared/services/categoryBasedProductService";
import { Product, ProductFilter, ProductSort } from "@/shared/types/product";

interface ProductContextType {
  // 상태
  products: Product[];
  filteredProducts: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  recommendedProducts: Product[];
  newProducts: Product[];
  saleProducts: Product[];
  bestSellerProducts: Product[];
  searchResults: Product[];
  sortedProducts: Product[];
  
  // 필터 및 정렬 상태
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  currentFilter: ProductFilter;
  currentSort: ProductSort;
  
  // UI 상태
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // 액션
  loadProducts: (forceReload?: boolean) => Promise<void>;
  getAllProducts: () => Promise<void>; // admin 페이지에서 사용
  getProductById: (productId: string) => Promise<Product | null>; // 단일 상품 반환
  loadProductById: (productId: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  clearSearch: () => void;
  filterProducts: (filter: ProductFilter) => Promise<void>;
  sortProducts: (sort: ProductSort) => Promise<void>;
  clearFilters: () => void;
  loadRelatedProducts: (productId: string, limit?: number) => Promise<void>;
  loadHomePageData: () => Promise<void>;
  
  // 헬퍼 함수
  calculateDiscountPrice: (price: number, saleRate?: number) => number;
  isInStock: (product: Product) => boolean;
  calculateAverageRating: (products: Product[]) => number;
  
  // 관리자 액션
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}

export function ProductProvider({ children }: { children: ReactNode }) {
  // 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  
  // 필터 및 정렬 상태
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [currentFilter, setCurrentFilter] = useState<ProductFilter>({});
  const [currentSort, setCurrentSort] = useState<ProductSort>({ field: 'createdAt', order: 'desc' });
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // 상품 데이터 정규화 (mainImage가 없으면 첫 번째 이미지로 설정)
  const normalizeProduct = useCallback((product: Product): Product => {
    let mainImage = product.mainImage;
    
    // mainImage가 없거나 images 배열에 없으면 첫 번째 이미지를 사용
    if (!mainImage || !product.images?.includes(mainImage)) {
      mainImage = product.images && product.images.length > 0 ? product.images[0] : undefined;
    }
    
    const normalizedProduct = {
      ...product,
      mainImage,
      images: product.images || [] // images 배열이 없으면 빈 배열
    };
    
    return normalizedProduct;
  }, []);

  // 모든 상품 로드 (10초 디바운스 적용)
  const loadProducts = useCallback(async (forceReload: boolean = false) => {
    const now = Date.now();
    const CACHE_DURATION = 10000; // 10초
    
    // 강제 새로고침이 아니고 캐시 기간 내라면 로딩하지 않음
    if (!forceReload && now - lastFetchTime < CACHE_DURATION) {
      console.log('⏰ 캐시된 데이터 사용 중... 남은 시간:', Math.ceil((CACHE_DURATION - (now - lastFetchTime)) / 1000), '초');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [allProducts, categories, brands] = await Promise.all([
        CategoryBasedProductService.getAllProducts(),
        CategoryBasedProductService.getCategories(),
        CategoryBasedProductService.getBrands()
      ]);
      
      // 상품 정규화
      const normalizedProducts = allProducts.map(normalizeProduct);
      
      setProducts(normalizedProducts);
      setFilteredProducts(normalizedProducts);
      setCategories(categories);
      setBrands(brands);
      
      // 가격 범위 설정
      const range = CategoryBasedProductService.getPriceRange(allProducts);
      setPriceRange(range);
      
      // 마지막 fetch 시간 업데이트
      setLastFetchTime(now);
      console.log('✅ 상품 데이터 로드 완료 - 다음 새로고침까지:', CACHE_DURATION / 1000, '초');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('상품 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [normalizeProduct, lastFetchTime]);

  // 단일 상품 로드
  const loadProductById = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      // 모든 카테고리에서 상품을 찾아야 하므로 getAllProducts에서 필터링
      const allProducts = await CategoryBasedProductService.getAllProducts();
      const product = allProducts.find((p: Product) => p.id === productId);
      
      setCurrentProduct(product ? normalizeProduct(product) : null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('상품 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 단일 상품 조회 (Product 반환)
  const getProductById = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      // 현재 products 배열에서 먼저 찾기
      const existingProduct = products.find(p => p.id === productId);
      if (existingProduct) {
        console.log('✅ products 배열에서 찾음:', existingProduct.name);
        return normalizeProduct(existingProduct);
      }
      
      // 새로운 findProductById 메서드 사용
      const product = await CategoryBasedProductService.findProductById(productId);
      
      if (product) {
        return normalizeProduct(product);
      } else {
        console.log('❌ 상품을 찾을 수 없음');
        return null;
      }

    } catch (err) {
      console.error('상품 조회 실패:', err);
      return null;
    }
  }, [products, normalizeProduct]);

  // 상품 검색
  const searchProducts = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setFilteredProducts(products);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchResults = await CategoryBasedProductService.searchProducts(query);
      setSearchResults(searchResults);
      setFilteredProducts(searchResults);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '검색에 실패했습니다.';
      setError(errorMessage);
      console.error('상품 검색 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // 검색 결과 초기화
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setFilteredProducts(products);
  }, [products]);

  // 상품 필터링
  const filterProducts = useCallback(async (filter: ProductFilter) => {
    try {
      setLoading(true);
      setError(null);

      const filtered = await CategoryBasedProductService.getFilteredProducts(filter);
      setFilteredProducts(filtered);
      setCurrentFilter(filter);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '필터링에 실패했습니다.';
      setError(errorMessage);
      console.error('상품 필터링 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 상품 정렬
  const sortProducts = useCallback(async (sort: ProductSort) => {
    try {
      setLoading(true);
      setError(null);

      const sorted = await CategoryBasedProductService.getSortedProducts(filteredProducts, sort);
      setSortedProducts(sorted);
      setCurrentSort(sort);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '정렬에 실패했습니다.';
      setError(errorMessage);
      console.error('상품 정렬 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [filteredProducts]);

  // 필터 초기화
  const clearFilters = useCallback(() => {
    setCurrentFilter({});
    setFilteredProducts(products);
    setSortedProducts([]);
    setSearchQuery('');
    setSearchResults([]);
  }, [products]);

  // 관련 상품 로드
  const loadRelatedProducts = useCallback(async (productId: string, limit: number = 4) => {
    try {
      setError(null);

      const related = await CategoryBasedProductService.getRelatedProducts(productId, limit);
      setRelatedProducts(related);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '관련 상품을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('관련 상품 조회 실패:', err);
    }
  }, []);

  // 홈페이지 데이터 로드
  const loadHomePageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [recommendedProducts, newProducts, saleProducts, bestSellerProducts, categories, brands] = await Promise.all([
        CategoryBasedProductService.getRecommendedProducts(),
        CategoryBasedProductService.getNewProducts(),
        CategoryBasedProductService.getSaleProducts(),
        CategoryBasedProductService.getBestSellerProducts(),
        CategoryBasedProductService.getCategories(),
        CategoryBasedProductService.getBrands()
      ]);

      setRecommendedProducts(recommendedProducts);
      setNewProducts(newProducts);
      setSaleProducts(saleProducts);
      setBestSellerProducts(bestSellerProducts);
      setCategories(categories);
      setBrands(brands);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '홈페이지 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('홈페이지 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 헬퍼 함수들
  const calculateDiscountPrice = useCallback((price: number, saleRate?: number) => {
    return CategoryBasedProductService.calculateDiscountPrice(price, saleRate);
  }, []);

  const isInStock = useCallback((product: Product) => {
    return CategoryBasedProductService.isInStock(product);
  }, []);

  const calculateAverageRating = useCallback((products: Product[]) => {
    return CategoryBasedProductService.calculateAverageRating(products);
  }, []);

  // 관리자 액션들
  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);

      const newProduct = await CategoryBasedProductService.createProduct(product);
      
      // 상품 목록 업데이트
      setProducts(prev => [...prev, newProduct]);
      setFilteredProducts(prev => [...prev, newProduct]);

      return newProduct;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품 생성에 실패했습니다.';
      setError(errorMessage);
      console.error('상품 생성 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    try {
      setLoading(true);
      setError(null);

      const updatedProduct = await CategoryBasedProductService.updateProduct(productId, updates);

      // 상품 목록 업데이트
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      setFilteredProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      
      // 현재 상품이 업데이트된 상품이면 갱신
      if (currentProduct?.id === productId) {
        setCurrentProduct(updatedProduct);
      }

      return updatedProduct;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('상품 수정 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      await CategoryBasedProductService.deleteProduct(productId);

      // 상품 목록에서 제거
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFilteredProducts(prev => prev.filter(p => p.id !== productId));
      
      // 현재 상품이 삭제된 상품이면 초기화
      if (currentProduct?.id === productId) {
        setCurrentProduct(null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품 삭제에 실패했습니다.';
      setError(errorMessage);
      console.error('상품 삭제 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  // 관리자용 전체 상품 로드 (캐시 무시하고 강제 로드)
  const getAllProducts = useCallback(async () => {
    return loadProducts(true);
  }, [loadProducts]);

  // 초기 데이터 로드 (한번만 실행)
  useEffect(() => {
    loadProducts(true); // 초기 로드는 강제로 실행
  }, []); // 빈 의존성 배열로 한번만 실행

  const value: ProductContextType = {
    // 상태
    products,
    filteredProducts,
    currentProduct,
    relatedProducts,
    recommendedProducts,
    newProducts,
    saleProducts,
    bestSellerProducts,
    searchResults,
    sortedProducts,
    
    // 필터 및 정렬 상태
    categories,
    brands,
    priceRange,
    currentFilter,
    currentSort,
    
    // UI 상태
    loading,
    error,
    searchQuery,
    
    // 액션
    loadProducts,
    getAllProducts,
    getProductById,
    loadProductById,
    searchProducts,
    clearSearch,
    filterProducts,
    sortProducts,
    clearFilters,
    loadRelatedProducts,
    loadHomePageData,
    
    // 헬퍼 함수
    calculateDiscountPrice,
    isInStock,
    calculateAverageRating,
    
    // 관리자 액션
    createProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
