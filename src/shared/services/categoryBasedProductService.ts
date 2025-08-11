import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  Query,
  DocumentData,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Product, ProductFilter, ProductSort } from '@/shared/types/product';

export class CategoryBasedProductService {
  
  /**
   * 카테고리명을 영어 경로로 변환
   */
  private static getCategoryPath(category: string): string {
    const categoryMap: { [key: string]: string } = {
      '상의': 'tops',
      '하의': 'bottoms', 
      '신발': 'shoes',
      '액세서리': 'accessories',
      '아우터': 'outerwear',
      '스포츠': 'sports',
      '언더웨어': 'underwear',
      '가방': 'bags'
    };
    
    return categoryMap[category] || category.toLowerCase();
  }

  /**
   * 모든 상품 조회 (모든 카테고리에서)
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const allProducts: Product[] = [];
      
      // 모든 카테고리를 조회
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        
        const productsRef = collection(db, 'categories', categoryId, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        for (const productDoc of productsSnapshot.docs) {
          const data = productDoc.data();
          
          const product: Product = {
            id: productDoc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            originalPrice: data.originalPrice,
            brand: data.brand,
            category: data.category,
            images: data.images || [],
            sizes: data.sizes || [],
            colors: data.colors || [],
            stock: data.stock,
            rating: data.rating,
            reviewCount: data.reviewCount,
            isNew: data.isNew,
            isSale: data.isSale,
            saleRate: data.saleRate,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            status: data.status || 'active',
            sku: data.sku,
            details: data.details
          };
          
          allProducts.push(product);
        }
      }
      
      return allProducts;
      
    } catch (error) {
      console.error('모든 상품 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 카테고리의 상품 조회
   */
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const categoryPath = this.getCategoryPath(category);
      const productsRef = collection(db, 'categories', categoryPath, 'products');
      const snapshot = await getDocs(productsRef);
      
      const products: Product[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const product: Product = {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          brand: data.brand,
          category: data.category,
          images: data.images || [],
          sizes: data.sizes || [],
          colors: data.colors || [],
          stock: data.stock,
          rating: data.rating,
          reviewCount: data.reviewCount,
          isNew: data.isNew,
          isSale: data.isSale,
          saleRate: data.saleRate,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          status: data.status || 'active',
          sku: data.sku,
          details: data.details
        };
        products.push(product);
      });
      
      console.log(`✅ 카테고리 "${category}" 상품 ${products.length}개 조회 완료`);
      return products;
      
    } catch (error) {
      console.error(`카테고리 "${category}" 상품 조회 실패:`, error);
      throw error;
    }
  }

  /**
   * 단일 상품 조회
   */
  static async getProductById(productId: string, category: string): Promise<Product | null> {
    try {
      console.log(`🔍 상품 조회: ${productId} (카테고리: ${category})`);
      
      const categoryPath = this.getCategoryPath(category);
      const productRef = doc(db, 'categories', categoryPath, 'products', productId);
      const snapshot = await getDoc(productRef);
      
      if (!snapshot.exists()) {
        console.log(`❌ 상품을 찾을 수 없습니다: ${productId}`);
        return null;
      }
      
      const data = snapshot.data();
      const product: Product = {
        id: snapshot.id,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        brand: data.brand,
        category: data.category,
        images: data.images || [],
        sizes: data.sizes || [],
        colors: data.colors || [],
        stock: data.stock,
        rating: data.rating,
        reviewCount: data.reviewCount,
        isNew: data.isNew,
        isSale: data.isSale,
        saleRate: data.saleRate,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        status: data.status || 'active',
        sku: data.sku,
        details: data.details
      };
      
      return product;
      
    } catch (error) {
      console.error(`상품 조회 실패: ${productId}`, error);
      throw error;
    }
  }

  /**
   * 카테고리 없이 상품 ID로 검색 (모든 카테고리에서 검색)
   */
  static async findProductById(productId: string): Promise<Product | null> {
    try {
      console.log(`🔍 전체 카테고리에서 상품 검색: ${productId}`);
      
      // 모든 카테고리를 조회
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      console.log(`📂 검색할 카테고리 수: ${categoriesSnapshot.size}`);
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        console.log(`🔍 ${categoryId} 카테고리에서 검색 중...`);
        
        try {
          const productRef = doc(db, 'categories', categoryId, 'products', productId);
          const snapshot = await getDoc(productRef);
          
          if (snapshot.exists()) {
            console.log(`✅ ${categoryId} 카테고리에서 상품 발견!`);
            const data = snapshot.data();
            const product: Product = {
              id: snapshot.id,
              name: data.name,
              description: data.description,
              price: data.price,
              originalPrice: data.originalPrice,
              brand: data.brand,
              category: data.category,
              images: data.images || [],
              sizes: data.sizes || [],
              colors: data.colors || [],
              stock: data.stock,
              rating: data.rating,
              reviewCount: data.reviewCount,
              isNew: data.isNew,
              isSale: data.isSale,
              saleRate: data.saleRate,
              tags: data.tags || [],
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              status: data.status || 'active',
              sku: data.sku,
              details: data.details
            };
            
            console.log(`✅ 상품 찾음: ${product.name} (카테고리: ${categoryId})`);
            return product;
          } else {
            console.log(`❌ ${categoryId} 카테고리에 상품 없음`);
          }
        } catch (err) {
          // 특정 카테고리에서 오류가 발생해도 계속 검색
          console.log(`⚠️ 카테고리 ${categoryId}에서 검색 중 오류:`, err);
        }
      }
      
      console.log(`❌ 모든 카테고리 검색 완료 - 상품을 찾을 수 없습니다: ${productId}`);
      return null;
      
    } catch (error) {
      console.error(`상품 검색 실패: ${productId}`, error);
      throw error;
    }
  }

  /**
   * 상품 생성
   */
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      console.log(`🆕 상품 생성: ${product.name} (카테고리: ${product.category})`);
      
      const categoryPath = this.getCategoryPath(product.category);
      const productsRef = collection(db, 'categories', categoryPath, 'products');
      
      // Firestore는 undefined 값을 허용하지 않으므로 안전하게 처리
      const cleanProductData: { [key: string]: any } = {};
      
      Object.entries(product).forEach(([key, value]) => {
        if (value !== undefined) {
          // 빈 문자열이나 0인 경우에도 유효한 값으로 처리
          if (value === '' || value === 0 || value === false || value !== null) {
            cleanProductData[key] = value;
          } else if (value !== null) {
            cleanProductData[key] = value;
          }
        }
        // undefined인 경우는 필드 자체를 포함하지 않음
      });
      
      const now = Timestamp.now();
      const productData = {
        ...cleanProductData,
        createdAt: now,
        updatedAt: now
      };
      
      console.log('📤 Firestore 생성 데이터:', productData);
      
      const docRef = await addDoc(productsRef, productData);
      
      const newProduct: Product = {
        ...product,
        id: docRef.id,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
      
      console.log(`✅ 상품 생성 완료: ${newProduct.name} (ID: ${newProduct.id})`);
      return newProduct;
      
    } catch (error) {
      console.error('상품 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 상품 수정
   */
  static async updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    try {
      console.log(`📝 상품 수정: ${productId}`);
      
      // 먼저 상품을 찾아서 카테고리를 확인
      const allProducts = await this.getAllProducts();
      const existingProduct = allProducts.find(p => p.id === productId);
      
      if (!existingProduct) {
        throw new Error(`상품을 찾을 수 없습니다: ${productId}`);
      }
      
      const categoryPath = this.getCategoryPath(existingProduct.category);
      const productRef = doc(db, 'categories', categoryPath, 'products', productId);
      
      // Firestore는 undefined 값을 허용하지 않으므로 안전하게 처리
      const cleanUpdates: { [key: string]: any } = {};
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          // 빈 문자열이나 0인 경우에도 유효한 값으로 처리
          if (value === '' || value === 0 || value === false || value !== null) {
            cleanUpdates[key] = value;
          } else if (value !== null) {
            cleanUpdates[key] = value;
          }
        } else {
          // undefined인 경우 필드를 삭제하도록 표시
          if (key === 'originalPrice' || key === 'sku' || key === 'saleRate') {
            cleanUpdates[key] = deleteField();
          }
        }
      });
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      };
      
      console.log('📤 Firestore 업데이트 데이터:', updateData);
      
      await updateDoc(productRef, updateData);
      
      const updatedProduct: Product = {
        ...existingProduct,
        ...updates,
        updatedAt: new Date()
      };
      
      console.log(`✅ 상품 수정 완료: ${updatedProduct.name}`);
      return updatedProduct;
      
    } catch (error) {
      console.error(`상품 수정 실패: ${productId}`, error);
      throw error;
    }
  }

  /**
   * 상품 삭제
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      console.log(`🗑️ 상품 삭제: ${productId}`);
      
      // 먼저 상품을 찾아서 카테고리를 확인
      const allProducts = await this.getAllProducts();
      const existingProduct = allProducts.find(p => p.id === productId);
      
      if (!existingProduct) {
        throw new Error(`상품을 찾을 수 없습니다: ${productId}`);
      }
      
      const categoryPath = this.getCategoryPath(existingProduct.category);
      const productRef = doc(db, 'categories', categoryPath, 'products', productId);
      
      await deleteDoc(productRef);
      
      console.log(`✅ 상품 삭제 완료: ${productId}`);
      
    } catch (error) {
      console.error(`상품 삭제 실패: ${productId}`, error);
      throw error;
    }
  }

  /**
   * 검색
   */
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      const searchTerm = query.toLowerCase();
      
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('상품 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 필터링
   */
  static async getFilteredProducts(filter: ProductFilter): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      return allProducts.filter(product => {
        // 카테고리 필터
        if (filter.category && product.category !== filter.category) {
          return false;
        }
        
        // 브랜드 필터
        if (filter.brand && product.brand !== filter.brand) {
          return false;
        }
        
        // 가격 범위 필터
        if (filter.minPrice !== undefined && product.price < filter.minPrice) {
          return false;
        }
        if (filter.maxPrice !== undefined && product.price > filter.maxPrice) {
          return false;
        }
        
        // 크기 필터
        if (filter.size && !product.sizes.includes(filter.size)) {
          return false;
        }
        
        // 색상 필터
        if (filter.color && !product.colors.includes(filter.color)) {
          return false;
        }
        
        // 평점 필터
        if (filter.rating !== undefined && product.rating < filter.rating) {
          return false;
        }
        
        // 신상품 필터
        if (filter.isNew !== undefined && product.isNew !== filter.isNew) {
          return false;
        }
        
        // 할인 상품 필터
        if (filter.isSale !== undefined && product.isSale !== filter.isSale) {
          return false;
        }
        
        // 상태 필터
        if (filter.status && product.status !== filter.status) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('상품 필터링 실패:', error);
      throw error;
    }
  }

  /**
   * 정렬
   */
  static async getSortedProducts(products: Product[], sort: ProductSort): Promise<Product[]> {
    try {
      const sortedProducts = [...products];
      
      return sortedProducts.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch (sort.field) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }
        
        if (sort.order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    } catch (error) {
      console.error('상품 정렬 실패:', error);
      throw error;
    }
  }

  /**
   * 관련 상품
   */
  static async getRelatedProducts(productId: string, limitCount: number = 4): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      const targetProduct = allProducts.find(p => p.id === productId);
      
      if (!targetProduct) {
        return [];
      }
      
      // 같은 카테고리의 다른 상품들을 찾고 무작위로 선택
      const relatedProducts = allProducts
        .filter(product => 
          product.id !== productId && 
          product.category === targetProduct.category
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, limitCount);
        
      return relatedProducts;
    } catch (error) {
      console.error('관련 상품 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 카테고리 목록
   */
  static async getCategories(): Promise<string[]> {
    try {
      const allProducts = await this.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.category))];
      return categories.sort();
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 브랜드 목록
   */
  static async getBrands(): Promise<string[]> {
    try {
      const allProducts = await this.getAllProducts();
      const brands = [...new Set(allProducts.map(product => product.brand))];
      return brands.sort();
    } catch (error) {
      console.error('브랜드 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 추천 상품 (높은 평점 순)
   */
  static async getRecommendedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limitCount);
    } catch (error) {
      console.error('추천 상품 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 신상품 (최신 순)
   */
  static async getNewProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('신상품 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 할인 상품
   */
  static async getSaleProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .filter(product => product.isSale && product.saleRate && product.saleRate > 0)
        .sort((a, b) => (b.saleRate || 0) - (a.saleRate || 0))
        .slice(0, limitCount);
    } catch (error) {
      console.error('할인 상품 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 베스트셀러 (임시로 높은 평점 상품으로 구현)
   */
  static async getBestSellerProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .filter(product => product.rating >= 4.0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limitCount);
    } catch (error) {
      console.error('베스트셀러 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 가격 범위 계산
   */
  static getPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }
    
    const prices = products.map(product => product.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  static calculateDiscountPrice(price: number, saleRate?: number): number {
    if (!saleRate) return price;
    return Math.floor(price * (1 - saleRate / 100));
  }

  static isInStock(product: Product): boolean {
    return product.stock > 0;
  }

  static calculateAverageRating(products: Product[]): number {
    if (products.length === 0) return 0;
    
    const totalRating = products.reduce((sum, product) => sum + product.rating, 0);
    return Math.round((totalRating / products.length) * 10) / 10;
  }

  static getProductStatsByStatus(products: Product[]): Record<string, number> {
    return products.reduce((acc, product) => {
      const status = product.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  static getLowStockProducts(products: Product[], threshold: number = 10): Product[] {
    return products.filter(product => product.stock <= threshold);
  }
}

export default CategoryBasedProductService;
