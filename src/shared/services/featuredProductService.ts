import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Product } from '@/shared/types/product';
import { ProductService } from './productService';

export interface FeaturedProductConfig {
  id: string;
  productIds: string[];
  title: string;
  subtitle: string;
  description: string;
  isActive: boolean;
  maxCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FEATURED_PRODUCTS_COLLECTION = 'featuredProducts';

export class FeaturedProductService {
  // 기본 추천 상품 설정
  private static defaultConfig: Omit<FeaturedProductConfig, 'id' | 'createdAt' | 'updatedAt'> = {
    productIds: [],
    title: '이번 주 추천 상품',
    subtitle: 'MD가 직접 선별한 특별한 상품들',
    description: '전문 MD가 엄선한 이번 주 추천 상품을 만나보세요',
    isActive: true,
    maxCount: 4
  };

  /**
   * 추천 상품 설정 가져오기
   */
  static async getFeaturedProductConfig(configId: string = 'mainPageFeatured'): Promise<FeaturedProductConfig | null> {
    try {
      const docRef = doc(db, FEATURED_PRODUCTS_COLLECTION, configId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          productIds: data.productIds || [],
          title: data.title || this.defaultConfig.title,
          subtitle: data.subtitle || this.defaultConfig.subtitle,
          description: data.description || this.defaultConfig.description,
          isActive: data.isActive ?? this.defaultConfig.isActive,
          maxCount: data.maxCount || this.defaultConfig.maxCount,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      // 설정이 없으면 기본값 반환
      return this.createDefaultConfig();
    } catch (error) {
      console.error('추천 상품 설정 조회 실패:', error);
      return this.createDefaultConfig();
    }
  }

  /**
   * 기본 추천 상품 설정 생성
   */
  private static createDefaultConfig(): FeaturedProductConfig {
    return {
      id: 'mainPageFeatured',
      ...this.defaultConfig,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 추천 상품 설정 업데이트
   */
  static async updateFeaturedProductConfig(
    productIds: string[],
    configId: string = 'mainPageFeatured',
    options?: {
      title?: string;
      subtitle?: string;
      description?: string;
      maxCount?: number;
      isActive?: boolean;
    }
  ): Promise<void> {
    try {
      const configData = {
        productIds,
        title: options?.title || this.defaultConfig.title,
        subtitle: options?.subtitle || this.defaultConfig.subtitle,
        description: options?.description || this.defaultConfig.description,
        maxCount: options?.maxCount || this.defaultConfig.maxCount,
        isActive: options?.isActive ?? this.defaultConfig.isActive,
        updatedAt: Timestamp.now(),
      };

      const docRef = doc(db, FEATURED_PRODUCTS_COLLECTION, configId);
      const existingDoc = await getDoc(docRef);

      if (existingDoc.exists()) {
        await updateDoc(docRef, configData);
      } else {
        await setDoc(docRef, {
          ...configData,
          createdAt: Timestamp.now(),
        });
      }

      console.log('✅ 추천 상품 설정 업데이트 완료:', productIds);
    } catch (error) {
      console.error('추천 상품 설정 업데이트 실패:', error);
      throw new Error('추천 상품 설정 업데이트에 실패했습니다.');
    }
  }

  /**
   * 설정된 추천 상품들 가져오기 (실제 상품 데이터 포함)
   */
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const config = await this.getFeaturedProductConfig();
      if (!config || !config.isActive || config.productIds.length === 0) {
        console.log('🔍 추천 상품 설정이 없거나 비활성화됨');
        return [];
      }

      console.log('📋 추천 상품 ID 목록:', config.productIds);

      // ProductService를 사용하여 효율적으로 상품 조회
      const products: Product[] = [];
      
      for (const productId of config.productIds.slice(0, config.maxCount)) {
        try {
          const product = await ProductService.getProductById(productId);
          if (product) {
            products.push(product);
            console.log(`✅ 추천 상품 로드: ${product.name} (${product.id})`);
          } else {
            console.warn(`⚠️ 추천 상품을 찾을 수 없음: ${productId}`);
          }
        } catch (error) {
          console.error(`❌ 상품 ${productId} 조회 실패:`, error);
        }
      }

      console.log(`🎯 총 ${products.length}개 추천 상품 로드 완료`);
      return products;
    } catch (error) {
      console.error('추천 상품 조회 실패:', error);
      return [];
    }
  }

  /**
   * 모든 추천 상품 설정 목록 조회
   */
  static async getAllFeaturedProductConfigs(): Promise<FeaturedProductConfig[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, FEATURED_PRODUCTS_COLLECTION), orderBy('updatedAt', 'desc'))
      );
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productIds: data.productIds || [],
          title: data.title || this.defaultConfig.title,
          subtitle: data.subtitle || this.defaultConfig.subtitle,
          description: data.description || this.defaultConfig.description,
          isActive: data.isActive ?? this.defaultConfig.isActive,
          maxCount: data.maxCount || this.defaultConfig.maxCount,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error('추천 상품 설정 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 추천 상품 설정 삭제
   */
  static async deleteFeaturedProductConfig(configId: string): Promise<void> {
    try {
      const docRef = doc(db, FEATURED_PRODUCTS_COLLECTION, configId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ 추천 상품 설정 비활성화 완료:', configId);
    } catch (error) {
      console.error('추천 상품 설정 삭제 실패:', error);
      throw new Error('추천 상품 설정 삭제에 실패했습니다.');
    }
  }
}
