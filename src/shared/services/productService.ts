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
  DocumentData
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Product, ProductFilter, ProductSort } from '@/shared/types/product';

export class FirebaseProductService {
  private static COLLECTION_NAME = 'products';

  // 전체 상품 조회
  static async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, this.COLLECTION_NAME);
      const snapshot = await getDocs(productsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      throw new Error('상품 목록을 불러오는데 실패했습니다.');
    }
  }

  // 상품 상세 조회
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const productRef = doc(db, this.COLLECTION_NAME, productId);
      const snapshot = await getDoc(productRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Product;
    } catch (error) {
      console.error('상품 상세 조회 실패:', error);
      throw new Error('상품을 불러오는데 실패했습니다.');
    }
  }

  // 상품 생성
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const productsRef = collection(db, this.COLLECTION_NAME);
      const now = Timestamp.now();
      
      const productData = {
        ...product,
        createdAt: now,
        updatedAt: now,
        status: product.status || 'draft'
      };

      const docRef = await addDoc(productsRef, productData);
      
      return {
        id: docRef.id,
        ...product,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        status: product.status || 'draft'
      };
    } catch (error) {
      console.error('상품 생성 실패:', error);
      throw new Error('상품 생성에 실패했습니다.');
    }
  }

  // 상품 수정
  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      console.log('Firebase 상품 수정 시작:', { productId, updates });
      
      const productRef = doc(db, this.COLLECTION_NAME, productId);
      
      // 기존 상품 데이터 조회
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

      console.log('Firebase에 업데이트할 데이터:', updateData);

      await updateDoc(productRef, updateData);
      
      const updatedProduct = {
        ...existingProduct,
        ...updates,
        updatedAt: new Date()
      };

      console.log('Firebase 상품 수정 완료:', updatedProduct);
      
      return updatedProduct;
    } catch (error) {
      console.error('Firebase 상품 수정 실패:', error);
      throw new Error('상품 수정에 실패했습니다.');
    }
  }

  // 상품 삭제
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, this.COLLECTION_NAME, productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      throw new Error('상품 삭제에 실패했습니다.');
    }
  }

  // 필터링된 상품 조회
  static async getFilteredProducts(filter: ProductFilter): Promise<Product[]> {
    try {
      let productQuery: Query<DocumentData> = collection(db, this.COLLECTION_NAME);

      // 필터 조건 추가
      if (filter.category) {
        productQuery = query(productQuery, where('category', '==', filter.category));
      }
      
      if (filter.brand) {
        productQuery = query(productQuery, where('brand', '==', filter.brand));
      }
      
      if (filter.status) {
        productQuery = query(productQuery, where('status', '==', filter.status));
      }

      // 가격 범위 필터링은 클라이언트에서 처리 (Firestore의 range 쿼리 제한)
      const snapshot = await getDocs(productQuery);
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];

      // 클라이언트 사이드 필터링
      if (filter.minPrice) {
        products = products.filter(p => p.price >= filter.minPrice!);
      }
      
      if (filter.maxPrice) {
        products = products.filter(p => p.price <= filter.maxPrice!);
      }

      if (filter.size) {
        products = products.filter(p => p.sizes.includes(filter.size!));
      }

      if (filter.color) {
        products = products.filter(p => p.colors.includes(filter.color!));
      }

      if (filter.rating) {
        products = products.filter(p => p.rating >= filter.rating!);
      }

      if (filter.isNew !== undefined) {
        products = products.filter(p => p.isNew === filter.isNew);
      }

      if (filter.isSale !== undefined) {
        products = products.filter(p => p.isSale === filter.isSale);
      }

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
      // Firestore의 전문 검색 한계로 인해 전체 상품을 가져와서 클라이언트에서 검색
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
      const categoryQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', targetProduct.category),
        where('status', '==', 'active'),
        limit(limitCount + 1) // 현재 상품 제외를 위해 +1
      );

      const snapshot = await getDocs(categoryQuery);
      const products = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }))
        .filter(p => p.id !== productId) // 현재 상품 제외
        .slice(0, limitCount) as Product[];

      return products;
    } catch (error) {
      console.error('연관 상품 조회 실패:', error);
      return [];
    }
  }

  // 카테고리별 상품 조회
  static async getProductsByCategory(category: string, limitCount?: number): Promise<Product[]> {
    try {
      let productQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        where('status', '==', 'active')
      );

      if (limitCount) {
        productQuery = query(productQuery, limit(limitCount));
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
      throw new Error('카테고리별 상품 조회에 실패했습니다.');
    }
  }

  // 브랜드별 상품 조회
  static async getProductsByBrand(brand: string, limitCount?: number): Promise<Product[]> {
    try {
      let productQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('brand', '==', brand),
        where('status', '==', 'active')
      );

      if (limitCount) {
        productQuery = query(productQuery, limit(limitCount));
      }

      const snapshot = await getDocs(productQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('브랜드별 상품 조회 실패:', error);
      throw new Error('브랜드별 상품 조회에 실패했습니다.');
    }
  }

  // 신상품 조회
  static async getNewProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const productQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('isNew', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(productQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('신상품 조회 실패:', error);
      return [];
    }
  }

  // 세일 상품 조회
  static async getSaleProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const productQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('isSale', '==', true),
        where('status', '==', 'active'),
        limit(limitCount)
      );

      const snapshot = await getDocs(productQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('세일 상품 조회 실패:', error);
      return [];
    }
  }

  // 베스트셀러 조회
  static async getBestSellerProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const productQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'active'),
        orderBy('reviewCount', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(productQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('베스트셀러 조회 실패:', error);
      return [];
    }
  }

  // 추천 상품 조회 (평점 기준)
  static async getRecommendedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const productQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'active'),
        where('rating', '>=', 4.0),
        orderBy('rating', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(productQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
    } catch (error) {
      console.error('추천 상품 조회 실패:', error);
      return [];
    }
  }

  // 카테고리 목록 조회
  static async getCategories(): Promise<string[]> {
    try {
      const products = await this.getAllProducts();
      const categories = [...new Set(products.map(p => p.category))];
      return categories.sort();
    } catch (error) {
      console.error('카테고리 목록 조회 실패:', error);
      return [];
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

  // 유틸리티 함수들
  static getPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) return { min: 0, max: 0 };
    
    const prices = products.map(p => p.price);
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
