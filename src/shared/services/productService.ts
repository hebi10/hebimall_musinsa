import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Product, ProductFilter, ProductSort } from '@/shared/types/product';

type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export class ProductService {
  private static readonly PRODUCTS_COLLECTION = 'products';
  private static readonly CATEGORIES_COLLECTION = 'categories';
  private static readonly LEGACY_SUBCOLLECTION = 'products';

  private static normalizeDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
    }

    return new Date();
  }

  private static normalizeCategoryId(
    data: { category?: string; categoryId?: string },
    fallbackCategoryId?: string
  ): string {
    return data.categoryId || data.category || fallbackCategoryId || '';
  }

  private static normalizeProduct(
    id: string,
    data: Record<string, any>,
    fallbackCategoryId?: string
  ): Product {
    const categoryId = this.normalizeCategoryId(data, fallbackCategoryId);

    return {
      id,
      name: data.name || '',
      description: data.description || '',
      price: data.price || 0,
      originalPrice: data.originalPrice,
      brand: data.brand || '',
      category: data.category || categoryId,
      categoryId,
      images: Array.isArray(data.images) ? data.images : [],
      mainImage: data.mainImage,
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      colors: Array.isArray(data.colors) ? data.colors : [],
      stock: data.stock || 0,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      isNew: Boolean(data.isNew),
      isSale: Boolean(data.isSale),
      saleRate: data.saleRate,
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: this.normalizeDate(data.createdAt),
      updatedAt: this.normalizeDate(data.updatedAt),
      status: data.status || 'active',
      sku: data.sku,
      details: data.details || {
        material: '',
        origin: '',
        manufacturer: '',
        precautions: '',
        sizes: {},
      },
    };
  }

  private static cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key as keyof T] = value as T[keyof T];
      }
    });

    return cleaned;
  }

  private static mergeProducts(primary: Product[], secondary: Product[]): Product[] {
    const merged = new Map<string, Product>();

    secondary.forEach((product) => {
      merged.set(product.id, product);
    });

    primary.forEach((product) => {
      merged.set(product.id, product);
    });

    return Array.from(merged.values());
  }

  private static async getTopLevelProducts(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, this.PRODUCTS_COLLECTION));
    return snapshot.docs.map((productDoc) => this.normalizeProduct(productDoc.id, productDoc.data()));
  }

  private static async getLegacyProducts(): Promise<Product[]> {
    const categoriesSnapshot = await getDocs(collection(db, this.CATEGORIES_COLLECTION));
    const products: Product[] = [];

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const categoryProductsSnapshot = await getDocs(
        collection(db, this.CATEGORIES_COLLECTION, categoryId, this.LEGACY_SUBCOLLECTION)
      );

      categoryProductsSnapshot.docs.forEach((productDoc) => {
        products.push(this.normalizeProduct(productDoc.id, productDoc.data(), categoryId));
      });
    }

    return products;
  }

  private static async getTopLevelProductById(productId: string): Promise<Product | null> {
    const snapshot = await getDoc(doc(db, this.PRODUCTS_COLLECTION, productId));
    if (!snapshot.exists()) {
      return null;
    }

    return this.normalizeProduct(snapshot.id, snapshot.data());
  }

  private static async getLegacyProductById(productId: string): Promise<Product | null> {
    const categoriesSnapshot = await getDocs(collection(db, this.CATEGORIES_COLLECTION));

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const snapshot = await getDoc(
        doc(db, this.CATEGORIES_COLLECTION, categoryId, this.LEGACY_SUBCOLLECTION, productId)
      );

      if (snapshot.exists()) {
        return this.normalizeProduct(snapshot.id, snapshot.data(), categoryId);
      }
    }

    return null;
  }

  private static async getLegacyProductRef(productId: string, categoryId?: string) {
    if (categoryId) {
      const exactRef = doc(
        db,
        this.CATEGORIES_COLLECTION,
        categoryId,
        this.LEGACY_SUBCOLLECTION,
        productId
      );
      const exactSnapshot = await getDoc(exactRef);

      if (exactSnapshot.exists()) {
        return exactRef;
      }
    }

    const categoriesSnapshot = await getDocs(collection(db, this.CATEGORIES_COLLECTION));

    for (const categoryDoc of categoriesSnapshot.docs) {
      const candidateRef = doc(
        db,
        this.CATEGORIES_COLLECTION,
        categoryDoc.id,
        this.LEGACY_SUBCOLLECTION,
        productId
      );
      const candidateSnapshot = await getDoc(candidateRef);

      if (candidateSnapshot.exists()) {
        return candidateRef;
      }
    }

    return categoryId
      ? doc(db, this.CATEGORIES_COLLECTION, categoryId, this.LEGACY_SUBCOLLECTION, productId)
      : null;
  }

  private static sortByCreatedAtDesc(products: Product[]): Product[] {
    return [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getAllProducts(): Promise<Product[]> {
    try {
      const [topLevelProducts, legacyProducts] = await Promise.all([
        this.getTopLevelProducts(),
        this.getLegacyProducts(),
      ]);

      if (topLevelProducts.length === 0) {
        return legacyProducts;
      }

      return this.sortByCreatedAtDesc(this.mergeProducts(topLevelProducts, legacyProducts));
    } catch (error) {
      console.error('Failed to load products:', error);
      throw new Error('상품 목록을 불러오지 못했습니다.');
    }
  }

  static async createProduct(product: ProductPayload): Promise<Product> {
    try {
      const categoryId = this.normalizeCategoryId(product);
      if (!categoryId) {
        throw new Error('category or categoryId is required.');
      }

      const now = Timestamp.now();
      const productRef = doc(collection(db, this.PRODUCTS_COLLECTION));
      const legacyRef = doc(
        db,
        this.CATEGORIES_COLLECTION,
        categoryId,
        this.LEGACY_SUBCOLLECTION,
        productRef.id
      );

      const productData = this.cleanObject({
        ...product,
        category: categoryId,
        categoryId,
        createdAt: now,
        updatedAt: now,
        status: product.status || 'active',
      });

      const batch = writeBatch(db);
      batch.set(productRef, productData);
      batch.set(legacyRef, productData);
      await batch.commit();

      return this.normalizeProduct(productRef.id, productData, categoryId);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw new Error('상품 생성에 실패했습니다.');
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const existingProduct = await this.getProductById(productId);
      if (!existingProduct) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const previousCategoryId = existingProduct.categoryId || existingProduct.category;
      const nextCategoryId = this.normalizeCategoryId(updates, previousCategoryId);
      const now = Timestamp.now();

      const mergedProduct = this.cleanObject({
        ...existingProduct,
        ...updates,
        category: nextCategoryId,
        categoryId: nextCategoryId,
        updatedAt: now,
      });

      delete (mergedProduct as Partial<Product>).id;
      delete (mergedProduct as Partial<Product>).createdAt;

      const batch = writeBatch(db);
      batch.set(doc(db, this.PRODUCTS_COLLECTION, productId), mergedProduct, { merge: true });

      if (previousCategoryId && previousCategoryId !== nextCategoryId) {
        batch.delete(
          doc(db, this.CATEGORIES_COLLECTION, previousCategoryId, this.LEGACY_SUBCOLLECTION, productId)
        );
      }

      batch.set(
        doc(db, this.CATEGORIES_COLLECTION, nextCategoryId, this.LEGACY_SUBCOLLECTION, productId),
        mergedProduct,
        { merge: true }
      );

      await batch.commit();
      return this.normalizeProduct(productId, mergedProduct, nextCategoryId);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new Error('상품 수정에 실패했습니다.');
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      const existingProduct = await this.getProductById(productId);
      if (!existingProduct) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      const categoryId = existingProduct.categoryId || existingProduct.category;
      const batch = writeBatch(db);
      batch.delete(doc(db, this.PRODUCTS_COLLECTION, productId));

      if (categoryId) {
        batch.delete(doc(db, this.CATEGORIES_COLLECTION, categoryId, this.LEGACY_SUBCOLLECTION, productId));
      } else {
        const legacyRef = await this.getLegacyProductRef(productId);
        if (legacyRef) {
          batch.delete(legacyRef);
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw new Error('상품 삭제에 실패했습니다.');
    }
  }

  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const topLevelProduct = await this.getTopLevelProductById(productId);
      if (topLevelProduct) {
        return topLevelProduct;
      }

      return await this.getLegacyProductById(productId);
    } catch (error) {
      console.error('Failed to load product detail:', error);
      throw new Error('상품 정보를 불러오지 못했습니다.');
    }
  }

  static async getProductsByCategory(categorySlug: string, limitCount?: number): Promise<Product[]> {
    try {
      const topLevelRef = collection(db, this.PRODUCTS_COLLECTION);
      const topLevelByCategoryId = await getDocs(query(topLevelRef, where('categoryId', '==', categorySlug)));
      const topLevelByCategory = await getDocs(query(topLevelRef, where('category', '==', categorySlug)));

      const topLevelProducts = this.mergeProducts(
        topLevelByCategoryId.docs.map((productDoc) => this.normalizeProduct(productDoc.id, productDoc.data())),
        topLevelByCategory.docs.map((productDoc) => this.normalizeProduct(productDoc.id, productDoc.data()))
      );

      let products = topLevelProducts;
      if (products.length === 0) {
        return this.getProductsByCategoryFallback(categorySlug, limitCount);
      }

      const legacyProducts = await this.getProductsByCategoryFallback(categorySlug);
      products = this.mergeProducts(products, legacyProducts);
      products = products.filter((product) => product.status === 'active');
      products = this.sortByCreatedAtDesc(products);

      if (limitCount) {
        return products.slice(0, limitCount);
      }

      return products;
    } catch (error) {
      console.error('Failed to load category products:', error);
      return this.getProductsByCategoryFallback(categorySlug, limitCount);
    }
  }

  static async getProductsByCategoryFallback(categorySlug: string, limitCount?: number): Promise<Product[]> {
    try {
      const categoryProductsRef = collection(
        db,
        this.CATEGORIES_COLLECTION,
        categorySlug,
        this.LEGACY_SUBCOLLECTION
      );

      const snapshot = await getDocs(categoryProductsRef);
      let products = snapshot.docs
        .map((productDoc) => this.normalizeProduct(productDoc.id, productDoc.data(), categorySlug))
        .filter((product) => product.status === 'active');

      products = this.sortByCreatedAtDesc(products);
      if (limitCount) {
        return products.slice(0, limitCount);
      }

      return products;
    } catch (error) {
      console.error('Fallback category product load failed:', error);
      return [];
    }
  }

  static async getFilteredProducts(filter: ProductFilter): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();

      return allProducts.filter((product) => {
        const categoryId = product.categoryId || product.category;

        if (filter.category && categoryId !== filter.category && product.category !== filter.category) return false;
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
    } catch (error) {
      console.error('Failed to filter products:', error);
      throw new Error('상품 필터링에 실패했습니다.');
    }
  }

  static async getSortedProducts(products: Product[], sort: ProductSort): Promise<Product[]> {
    return [...products].sort((a, b) => {
      switch (sort.field) {
        case 'price':
          return sort.order === 'asc' ? a.price - b.price : b.price - a.price;
        case 'rating':
          return sort.order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        case 'createdAt':
          return sort.order === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime();
        case 'name':
          return sort.order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  static async searchProducts(searchQuery: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      const normalizedQuery = searchQuery.toLowerCase();

      return allProducts.filter((product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    } catch (error) {
      console.error('Failed to search products:', error);
      throw new Error('상품 검색에 실패했습니다.');
    }
  }

  static async getRelatedProducts(productId: string, limitCount: number = 4): Promise<Product[]> {
    try {
      const targetProduct = await this.getProductById(productId);
      if (!targetProduct) {
        return [];
      }

      const categoryId = targetProduct.categoryId || targetProduct.category;
      const categoryProducts = await this.getProductsByCategory(categoryId, limitCount + 1);
      return categoryProducts.filter((product) => product.id !== productId).slice(0, limitCount);
    } catch (error) {
      console.error('Failed to load related products:', error);
      return [];
    }
  }

  static async getNewProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .filter((product) => product.isNew && product.status === 'active')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('Failed to load new products:', error);
      return [];
    }
  }

  static async getSaleProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .filter((product) => product.isSale && product.status === 'active')
        .slice(0, limitCount);
    } catch (error) {
      console.error('Failed to load sale products:', error);
      return [];
    }
  }

  static async getBestSellerProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .filter((product) => product.status === 'active')
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Failed to load best seller products:', error);
      return [];
    }
  }

  static async getRecommendedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts
        .filter((product) => product.status === 'active' && product.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Failed to load recommended products:', error);
      return [];
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const categoriesSnapshot = await getDocs(collection(db, this.CATEGORIES_COLLECTION));
      return categoriesSnapshot.docs.map((categoryDoc) => categoryDoc.id).sort();
    } catch (error) {
      console.error('Failed to load categories:', error);
      return ['accessories', 'bags', 'bottoms', 'shoes', 'tops'];
    }
  }

  static async getCategoriesWithNames(): Promise<{ id: string; name: string }[]> {
    try {
      const categoriesSnapshot = await getDocs(collection(db, this.CATEGORIES_COLLECTION));
      return categoriesSnapshot.docs
        .map((categoryDoc) => ({
          id: categoryDoc.id,
          name: categoryDoc.data().name || categoryDoc.id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Failed to load category names:', error);
      return [
        { id: 'accessories', name: '악세서리' },
        { id: 'bags', name: '가방' },
        { id: 'bottoms', name: '하의' },
        { id: 'shoes', name: '신발' },
        { id: 'tops', name: '상의' },
      ];
    }
  }

  static async getBrands(): Promise<string[]> {
    try {
      const products = await this.getAllProducts();
      return [...new Set(products.map((product) => product.brand))].sort();
    } catch (error) {
      console.error('Failed to load brands:', error);
      return [];
    }
  }

  static getPriceRange(products: Product[]): { min: number; max: number } {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = products.map((product) => product.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  static isInStock(product: Product): boolean {
    return product.stock > 0;
  }

  static calculateDiscountPrice(price: number, saleRate?: number): number {
    if (!saleRate) {
      return price;
    }

    return Math.round(price * (1 - saleRate / 100));
  }

  static calculateAverageRating(products: Product[]): number {
    if (products.length === 0) {
      return 0;
    }

    const total = products.reduce((sum, product) => sum + product.rating, 0);
    return Math.round((total / products.length) * 10) / 10;
  }
}
