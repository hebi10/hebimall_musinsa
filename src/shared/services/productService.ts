import { Product, ProductFilter, ProductSort } from '@/shared/types/product';
import { mockProducts, mockCategories, mockBrands } from '@/mocks/products';

export class ProductService {
  // 전체 상품 조회
  static async getAllProducts(): Promise<Product[]> {
    // 실제 환경에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 100);
    });
  }

  // 상품 상세 조회
  static async getProductById(productId: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === productId);
        resolve(product || null);
      }, 100);
    });
  }

  // 필터링된 상품 조회
  static async getFilteredProducts(filter: ProductFilter): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = mockProducts.filter(product => {
          if (filter.category && product.category !== filter.category) return false;
          if (filter.brand && product.brand !== filter.brand) return false;
          if (filter.minPrice && product.price < filter.minPrice) return false;
          if (filter.maxPrice && product.price > filter.maxPrice) return false;
          if (filter.size && !product.sizes.includes(filter.size)) return false;
          if (filter.color && !product.colors.includes(filter.color)) return false;
          if (filter.rating && product.rating < filter.rating) return false;
          if (filter.isNew !== undefined && product.isNew !== filter.isNew) return false;
          if (filter.isSale !== undefined && product.isSale !== filter.isSale) return false;
          
          return true;
        });

        resolve(filtered);
      }, 100);
    });
  }

  // 정렬된 상품 조회
  static async getSortedProducts(products: Product[], sort: ProductSort): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sorted = [...products].sort((a, b) => {
          switch (sort.field) {
            case 'price':
              return sort.order === 'asc' ? a.price - b.price : b.price - a.price;
            case 'rating':
              return sort.order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            case 'createdAt':
              const aDate = new Date(a.createdAt).getTime();
              const bDate = new Date(b.createdAt).getTime();
              return sort.order === 'asc' ? aDate - bDate : bDate - aDate;
            case 'name':
              return sort.order === 'asc' ? 
                a.name.localeCompare(b.name) : 
                b.name.localeCompare(a.name);
            default:
              return 0;
          }
        });

        resolve(sorted);
      }, 50);
    });
  }

  // 검색
  static async searchProducts(query: string): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const searched = mockProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        resolve(searched);
      }, 100);
    });
  }

  // 연관 상품 조회 (같은 카테고리, 같은 브랜드 등)
  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetProduct = mockProducts.find(p => p.id === productId);
        if (!targetProduct) {
          resolve([]);
          return;
        }

        const related = mockProducts
          .filter(p => 
            p.id !== productId && 
            (p.category === targetProduct.category || p.brand === targetProduct.brand)
          )
          .slice(0, limit);

        resolve(related);
      }, 100);
    });
  }

  // 추천 상품 조회
  static async getRecommendedProducts(limit: number = 8): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recommended = mockProducts
          .filter(p => p.rating >= 4.0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit);

        resolve(recommended);
      }, 100);
    });
  }

  // 신상품 조회
  static async getNewProducts(limit: number = 8): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProducts = mockProducts
          .filter(p => p.isNew)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);

        resolve(newProducts);
      }, 100);
    });
  }

  // 세일 상품 조회
  static async getSaleProducts(limit: number = 8): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const saleProducts = mockProducts
          .filter(p => p.isSale)
          .sort((a, b) => (b.saleRate || 0) - (a.saleRate || 0))
          .slice(0, limit);

        resolve(saleProducts);
      }, 100);
    });
  }

  // 베스트셀러 조회
  static async getBestSellerProducts(limit: number = 8): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bestSellers = mockProducts
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, limit);

        resolve(bestSellers);
      }, 100);
    });
  }

  // 카테고리 목록 조회
  static async getCategories() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCategories), 50);
    });
  }

  // 브랜드 목록 조회
  static async getBrands() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBrands), 50);
    });
  }

  // 가격 범위 계산
  static getPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) return { min: 0, max: 0 };
    
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  // 할인가 계산
  static calculateDiscountPrice(price: number, saleRate?: number): number {
    if (!saleRate) return price;
    return Math.floor(price * (1 - saleRate / 100));
  }

  // 재고 확인
  static isInStock(product: Product): boolean {
    return product.stock > 0;
  }

  // 평점 평균 계산
  static calculateAverageRating(products: Product[]): number {
    if (products.length === 0) return 0;
    
    const totalRating = products.reduce((sum, product) => sum + product.rating, 0);
    return Math.round((totalRating / products.length) * 10) / 10;
  }

  // CRUD 메서드들
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    // 실제 환경에서는 API 호출
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: product.status || 'draft'
    };

    // Mock: 로컬 스토리지나 상태 관리를 통해 저장
    // 실제로는 API 서버에 POST 요청
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(newProduct), 500);
    });
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    // 실제 환경에서는 API 호출
    const products = await this.getAllProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    const updatedProduct: Product = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };

    // Mock: 실제로는 API 서버에 PUT/PATCH 요청
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(updatedProduct), 500);
    });
  }

  static async deleteProduct(productId: string): Promise<void> {
    // 실제 환경에서는 API 호출
    
    // Mock: 실제로는 API 서버에 DELETE 요청
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }

  // 상품 상태별 개수 조회
  static getProductStatsByStatus(products: Product[]): Record<string, number> {
    return products.reduce((acc, product) => {
      const status = product.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // 재고 부족 상품 조회
  static getLowStockProducts(products: Product[], threshold: number = 10): Product[] {
    return products.filter(product => product.stock <= threshold);
  }

  // 카테고리별 상품 개수 조회
  static getProductCountsByCategory(products: Product[]): Record<string, number> {
    return products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
