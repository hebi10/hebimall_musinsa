import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Product, ProductFilter, ProductSort } from '@/shared/types/product';

export class CategoryOnlyProductService {
  // ===========================================
  // 전체 상품 관리 (카테고리별 상품 통합)
  // ===========================================
  
  // 전체 상품 조회 (모든 카테고리에서 통합)
  static async getAllProducts(): Promise<Product[]> {
    try {
      const allProducts: Product[] = [];
      
      // 모든 카테고리 조회
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        
        try {
          // 각 카테고리별 상품 조회 (순차적으로 실행)
          const categoryProductsSnapshot = await getDocs(
            collection(db, 'categories', categoryId, 'products')
          );
          
          categoryProductsSnapshot.docs.forEach(productDoc => {
            const productData = productDoc.data();
            allProducts.push({
              id: productDoc.id,
              ...productData,
              images: productData.images || [], // images 배열이 없으면 빈 배열
              sizes: productData.sizes || [], // sizes 배열이 없으면 빈 배열
              colors: productData.colors || [], // colors 배열이 없으면 빈 배열
              tags: productData.tags || [], // tags 배열이 없으면 빈 배열
              createdAt: productData.createdAt?.toDate() || new Date(),
              updatedAt: productData.updatedAt?.toDate() || new Date()
            } as Product);
          });
          
          // 각 카테고리 조회 사이에 짧은 지연 추가 (Firestore 안정화)
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.warn(`⚠️ 카테고리 ${categoryId} 상품 조회 실패:`, error);
        }
      }
      
      return allProducts;
      
    } catch (error) {
      console.error('전체 상품 조회 실패:', error);
      throw new Error('상품 목록을 불러오는데 실패했습니다.');
    }
  }

  // 상품 생성 (카테고리별 컬렉션에만)
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const now = Timestamp.now();
      
      // 카테고리별 상품 컬렉션에 추가
      const categoryProductsRef = collection(db, 'categories', product.category, 'products');
      const categoryProductRef = doc(categoryProductsRef);
      
      // undefined 값을 제거하는 함수
      const cleanObject = (obj: any) => {
        const cleaned: any = {};
        Object.keys(obj).forEach(key => {
          if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
          }
        });
        return cleaned;
      };
      
      const productData = cleanObject({
        ...product,
        createdAt: now,
        updatedAt: now,
        status: product.status || 'active'
      });

      await setDoc(categoryProductRef, productData);

      console.log(`✅ 상품 생성: ${product.name} → categories/${product.category}/products/${categoryProductRef.id}`);

      return {
        id: categoryProductRef.id,
        ...product,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        status: product.status || 'active'
      };
    } catch (error) {
      console.error('상품 생성 실패:', error);
      throw new Error('상품 생성에 실패했습니다.');
    }
  }

  // 상품 수정 (카테고리별 컬렉션에서)
  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      // 기존 상품 정보 조회
      const existingProduct = await this.getProductById(productId);
      if (!existingProduct) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // createdAt과 id는 업데이트에서 제외
      delete updateData.createdAt;
      delete updateData.id;

      // 카테고리가 변경된 경우
      if (updates.category && updates.category !== existingProduct.category) {
        // 기존 카테고리에서 삭제
        const oldCategoryProductRef = doc(db, 'categories', existingProduct.category, 'products', productId);
        await deleteDoc(oldCategoryProductRef);

        // 새 카테고리에 추가
        const newCategoryProductRef = doc(db, 'categories', updates.category, 'products', productId);
        
        // undefined 값을 제거하는 함수
        const cleanObject = (obj: any) => {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            if (obj[key] !== undefined) {
              cleaned[key] = obj[key];
            }
          });
          return cleaned;
        };
        
        const newProductData = cleanObject({
          ...existingProduct,
          ...updateData
        });
        
        await setDoc(newCategoryProductRef, newProductData);
        
        console.log(`✅ 상품 카테고리 변경: ${existingProduct.category} → ${updates.category}`);
      } else {
        // 같은 카테고리 내에서 업데이트
        const categoryProductRef = doc(db, 'categories', existingProduct.category, 'products', productId);
        await updateDoc(categoryProductRef, updateData);
        
        console.log(`✅ 상품 수정: ${existingProduct.name}`);
      }
      
      return {
        ...existingProduct,
        ...updates,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('상품 수정 실패:', error);
      throw new Error('상품 수정에 실패했습니다.');
    }
  }

  // 상품 삭제 (카테고리별 컬렉션에서)
  static async deleteProduct(productId: string): Promise<void> {
    try {
      // 기존 상품 정보 조회
      const existingProduct = await this.getProductById(productId);
      if (!existingProduct) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      // 카테고리별 상품 컬렉션에서 삭제
      const categoryProductRef = doc(db, 'categories', existingProduct.category, 'products', productId);
      await deleteDoc(categoryProductRef);
      
      console.log(`✅ 상품 삭제: ${existingProduct.name} (categories/${existingProduct.category}/products/)`);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      throw new Error('상품 삭제에 실패했습니다.');
    }
  }

  // 상품 상세 조회 (모든 카테고리에서 검색)
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      // 모든 카테고리에서 상품 검색 (순차적으로 실행)
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id;
        
        try {
          const productRef = doc(db, 'categories', categoryId, 'products', productId);
          const snapshot = await getDoc(productRef);
          
          if (snapshot.exists()) {
            const data = snapshot.data();
            return {
              id: snapshot.id,
              ...data,
              images: data.images || [], // images 배열이 없으면 빈 배열
              sizes: data.sizes || [], // sizes 배열이 없으면 빈 배열
              colors: data.colors || [], // colors 배열이 없으면 빈 배열
              tags: data.tags || [], // tags 배열이 없으면 빈 배열
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as Product;
          }
        } catch (error) {
          // 해당 카테고리에서 찾지 못한 경우 계속 진행
          console.log(`⚠️ ${categoryId}에서 검색 실패, 다음 카테고리로 진행...`);
          continue;
        }
        
        // 각 카테고리 검색 사이에 짧은 지연 추가 (Firestore 내부 상태 안정화)
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log(`❌ 상품을 찾을 수 없음: ${productId}`);
      return null;
    } catch (error) {
      console.error('상품 상세 조회 실패:', error);
      throw new Error('상품을 불러오는데 실패했습니다.');
    }
  }

  // ===========================================
  // 카테고리별 상품 조회 (사용자용)
  // ===========================================
  
  // 카테고리별 상품 조회
  static async getProductsByCategory(categorySlug: string, limitCount?: number): Promise<Product[]> {
    try {
      let productQuery = collection(db, 'categories', categorySlug, 'products');

      if (limitCount) {
        productQuery = query(productQuery, 
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        ) as any;
      }

      const snapshot = await getDocs(productQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('카테고리별 상품 조회 실패:', error);
      // 실패 시 전체 상품에서 카테고리 필터링으로 폴백
      return this.getProductsByCategoryFallback(categorySlug, limitCount);
    }
  }

  // 폴백: 전체 상품에서 카테고리 필터링
  static async getProductsByCategoryFallback(categorySlug: string, limitCount?: number): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      let filteredProducts = allProducts.filter(p => 
        p.category === categorySlug && p.status === 'active'
      );
      
      if (limitCount) {
        filteredProducts = filteredProducts.slice(0, limitCount);
      }
      
      return filteredProducts;
    } catch (error) {
      console.error('폴백 상품 조회도 실패:', error);
      return [];
    }
  }

  // ===========================================
  // 기존 Firebase Product Service 메서드들
  // ===========================================
  
  // 필터링된 상품 조회
  static async getFilteredProducts(filter: ProductFilter): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      let products = allProducts.filter(product => {
        if (filter.category && product.category !== filter.category) return false;
        if (filter.brand && product.brand !== filter.brand) return false;
        if (filter.status && product.status !== filter.status) return false;
        if (filter.minPrice && product.price < filter.minPrice) return false;
        if (filter.maxPrice && product.price > filter.maxPrice) return false;
        if (filter.size && !product.sizes.includes(filter.size)) return false;
        if (filter.color && !product.colors.includes(filter.color)) return false;
        if (filter.rating && product.rating < filter.rating) return false;
        if (filter.isNew !== undefined && product.isNew !== filter.isNew) return false;
        if (filter.isSale !== undefined && product.isSale !== filter.isSale) return false;
        
        return true;
      });

      return products;
    } catch (error) {
      console.error('상품 필터링 실패:', error);
      throw new Error('상품 필터링에 실패했습니다.');
    }
  }

  // 정렬된 상품 조회
  static async getSortedProducts(products: Product[], sort: ProductSort): Promise<Product[]> {
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

    return sorted;
  }

  // 검색
  static async searchProducts(searchQuery: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      const query = searchQuery.toLowerCase();
      return allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    } catch (error) {
      console.error('상품 검색 실패:', error);
      throw new Error('상품 검색에 실패했습니다.');
    }
  }

  // 연관 상품 조회
  static async getRelatedProducts(productId: string, limitCount: number = 4): Promise<Product[]> {
    try {
      const targetProduct = await this.getProductById(productId);
      if (!targetProduct) return [];

      // 같은 카테고리의 상품들 조회
      const categoryProducts = await this.getProductsByCategory(targetProduct.category, limitCount + 1);
      
      return categoryProducts
        .filter(p => p.id !== productId) // 현재 상품 제외
        .slice(0, limitCount);
    } catch (error) {
      console.error('연관 상품 조회 실패:', error);
      return [];
    }
  }

  // 신상품 조회
  static async getNewProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      return allProducts
        .filter(p => p.isNew && p.status === 'active')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('신상품 조회 실패:', error);
      return [];
    }
  }

  // 세일 상품 조회
  static async getSaleProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      return allProducts
        .filter(p => p.isSale && p.status === 'active')
        .slice(0, limitCount);
    } catch (error) {
      console.error('세일 상품 조회 실패:', error);
      return [];
    }
  }

  // 베스트셀러 조회
  static async getBestSellerProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      return allProducts
        .filter(p => p.status === 'active')
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, limitCount);
    } catch (error) {
      console.error('베스트셀러 조회 실패:', error);
      return [];
    }
  }

  // 추천 상품 조회
  static async getRecommendedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      
      return allProducts
        .filter(p => p.status === 'active' && p.rating >= 4.0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limitCount);
    } catch (error) {
      console.error('추천 상품 조회 실패:', error);
      return [];
    }
  }

  // 카테고리 목록 조회
  static async getCategories(): Promise<string[]> {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categories = categoriesSnapshot.docs.map(doc => doc.id);
      return categories.sort();
    } catch (error) {
      console.error('카테고리 목록 조회 실패:', error);
      return ['accessories', 'bags', 'bottoms', 'shoes', 'tops']; // 기본 카테고리
    }
  }

  // 카테고리 정보 조회 (이름 포함)
  static async getCategoriesWithNames(): Promise<{ id: string; name: string }[]> {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      return categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('카테고리 정보 조회 실패:', error);
      return [
        { id: 'accessories', name: '액세서리' },
        { id: 'bags', name: '가방' },
        { id: 'bottoms', name: '하의' },
        { id: 'shoes', name: '신발' },
        { id: 'tops', name: '상의' }
      ];
    }
  }

  // 브랜드 목록 조회
  static async getBrands(): Promise<string[]> {
    try {
      const products = await this.getAllProducts();
      const brands = [...new Set(products.map(p => p.brand))];
      return brands.sort();
    } catch (error) {
      console.error('브랜드 목록 조회 실패:', error);
      return [];
    }
  }

  // 가격 범위 조회
  static getPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  // 재고 확인
  static isInStock(product: Product): boolean {
    return product.stock > 0;
  }

  // 할인 가격 계산
  static calculateDiscountPrice(price: number, saleRate?: number): number {
    if (!saleRate) return price;
    return Math.round(price * (1 - saleRate / 100));
  }

  // 평균 평점 계산
  static calculateAverageRating(products: Product[]): number {
    if (products.length === 0) return 0;
    const total = products.reduce((sum, product) => sum + product.rating, 0);
    return Math.round((total / products.length) * 10) / 10;
  }
}
