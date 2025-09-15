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
import { Category } from '@/shared/types/category';

export interface CategoryOrderConfig {
  id: string;
  order: string[];
  mappedOrder: string[];
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORY_ORDER_COLLECTION = 'categoryOrder';

export class CategoryOrderService {
  // 기본 카테고리 순서 설정
  private static defaultCategoryOrder = [
    '상의',
    '하의', 
    '신발',
    '스포츠',
    '아웃도어',
    '가방',
    '주얼리',
    '액세서리'
  ];

  // 카테고리 ID와 이름 매핑
  private static categoryMapping: Record<string, string> = {
    'clothing': '상의',
    'bottoms': '하의',
    'shoes': '신발',
    'sports': '스포츠',
    'outdoor': '아웃도어',
    'bags': '가방',
    'jewelry': '주얼리',
    'accessories': '액세서리'
  };

  // 역매핑 생성 (이름 -> ID)
  private static get nameToIdMapping(): Record<string, string> {
    const mapping: Record<string, string> = {};
    Object.entries(this.categoryMapping).forEach(([id, name]) => {
      mapping[name] = id;
    });
    return mapping;
  }

  /**
   * 카테고리 순서 설정 가져오기
   */
  static async getCategoryOrderConfig(configId: string = 'mainPageOrder'): Promise<CategoryOrderConfig | null> {
    try {
      const docRef = doc(db, CATEGORY_ORDER_COLLECTION, configId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          order: data.order || this.defaultCategoryOrder,
          mappedOrder: data.mappedOrder || this.defaultCategoryOrder.map(name => this.nameToIdMapping[name]).filter(Boolean),
          description: data.description || '카테고리 순서 설정',
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      // 설정이 없으면 기본값 반환
      return this.createDefaultOrderConfig();
    } catch (error) {
      console.error('카테고리 순서 설정 조회 실패:', error);
      return this.createDefaultOrderConfig();
    }
  }

  /**
   * 기본 카테고리 순서 설정 생성
   */
  private static createDefaultOrderConfig(): CategoryOrderConfig {
    return {
      id: 'mainPageOrder',
      order: this.defaultCategoryOrder,
      mappedOrder: this.defaultCategoryOrder.map(name => this.nameToIdMapping[name]).filter(Boolean),
      description: '기본 카테고리 순서',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 카테고리 순서 설정 업데이트
   */
  static async updateCategoryOrder(
    newOrder: string[], 
    configId: string = 'mainPageOrder',
    description?: string
  ): Promise<void> {
    try {
      console.log('🔄 카테고리 순서 업데이트 시작:', { newOrder, configId, description });
      
      const mappedOrder = newOrder.map(name => this.nameToIdMapping[name]).filter(Boolean);
      console.log('📝 매핑된 순서:', mappedOrder);
      
      const orderData = {
        order: newOrder,
        mappedOrder,
        description: description || '카테고리 순서 설정',
        isActive: true,
        updatedAt: Timestamp.now(),
      };

      console.log('💾 저장할 데이터:', orderData);

      const docRef = doc(db, CATEGORY_ORDER_COLLECTION, configId);
      console.log('📍 문서 참조:', docRef.path);
      
      const existingDoc = await getDoc(docRef);
      console.log('📄 기존 문서 존재:', existingDoc.exists());

      if (existingDoc.exists()) {
        console.log('🔄 기존 문서 업데이트 중...');
        await updateDoc(docRef, orderData);
        console.log('✅ 문서 업데이트 완료');
      } else {
        console.log('🆕 새 문서 생성 중...');
        await setDoc(docRef, {
          ...orderData,
          createdAt: Timestamp.now(),
        });
        console.log('✅ 새 문서 생성 완료');
      }

      console.log('✅ 카테고리 순서 업데이트 완료:', newOrder);
    } catch (error) {
      console.error('❌ 카테고리 순서 업데이트 실패:', error);
      console.error('오류 상세:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`카테고리 순서 업데이트에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 설정된 순서에 따라 카테고리 정렬
   */
  static async getSortedCategories(): Promise<{ id: string; name: string; order: number }[]> {
    try {
      // 카테고리 순서 설정 가져오기
      const orderConfig = await this.getCategoryOrderConfig();
      if (!orderConfig) {
        throw new Error('카테고리 순서 설정을 찾을 수 없습니다.');
      }

      // Firebase에서 모든 카테고리 가져오기
      const categoriesQuery = query(
        collection(db, 'categories'),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(categoriesQuery);
      const allCategories: { id: string; name: string }[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive === true) {
          allCategories.push({
            id: doc.id,
            name: this.categoryMapping[doc.id] || data.name || doc.id
          });
        }
      });

      // 설정된 순서에 따라 정렬
      const sortedCategories: { id: string; name: string; order: number }[] = [];
      
      orderConfig.order.forEach((categoryName, index) => {
        const categoryId = this.nameToIdMapping[categoryName];
        const category = allCategories.find(cat => cat.id === categoryId);
        
        if (category) {
          sortedCategories.push({
            id: category.id,
            name: categoryName,
            order: index
          });
        }
      });

      // 설정에 없는 카테고리들은 마지막에 추가
      allCategories.forEach(category => {
        if (!sortedCategories.find(sorted => sorted.id === category.id)) {
          sortedCategories.push({
            id: category.id,
            name: category.name,
            order: sortedCategories.length
          });
        }
      });

      return sortedCategories;
    } catch (error) {
      console.error('정렬된 카테고리 조회 실패:', error);
      
      // 에러 시 기본 카테고리 반환
      return this.defaultCategoryOrder.map((name, index) => ({
        id: this.nameToIdMapping[name] || name.toLowerCase(),
        name,
        order: index
      })).filter(cat => cat.id);
    }
  }

  /**
   * 메인 페이지용 카테고리 데이터 (최대 개수 제한)
   */
  static async getMainPageCategories(maxCount: number = 4): Promise<{ 
    id: string; 
    name: string; 
    slug: string; 
    href: string;
    icon: string;
    count: string;
  }[]> {
    try {
      const sortedCategories = await this.getSortedCategories();
      
      // 카테고리별 아이콘과 상품 수 설정 (실제로는 Firebase에서 가져와야 함)
      const categoryIcons: Record<string, string> = {
        '상의': '👕',
        '하의': '👖', 
        '신발': '👟',
        '스포츠': '⚽',
        '아웃도어': '🏃',
        '가방': '👜',
        '주얼리': '💎',
        '액세서리': '👑'
      };

      const categoryCounts: Record<string, string> = {
        '상의': '2,450+ 상품',
        '하의': '1,200+ 상품', 
        '신발': '980+ 상품',
        '스포츠': '650+ 상품',
        '아웃도어': '430+ 상품',
        '가방': '890+ 상품',
        '주얼리': '320+ 상품',
        '액세서리': '1,100+ 상품'
      };

      return sortedCategories.slice(0, maxCount).map(category => ({
        id: category.id,
        name: category.name,
        slug: category.id,
        href: `/categories/${category.id}`,
        icon: categoryIcons[category.name] || '📦',
        count: categoryCounts[category.name] || '100+ 상품'
      }));
    } catch (error) {
      console.error('메인 페이지 카테고리 조회 실패:', error);
      
      // 에러 시 기본 카테고리 반환
      return [
        { id: 'clothing', name: '의류', slug: 'clothing', href: '/categories/clothing', icon: '👕', count: '2,450+ 상품' },
        { id: 'bags', name: '가방', slug: 'bags', href: '/categories/bags', icon: '👜', count: '890+ 상품' },
        { id: 'accessories', name: '액세서리', slug: 'accessories', href: '/categories/accessories', icon: '💎', count: '1,200+ 상품' },
        { id: 'outdoor', name: '아웃도어', slug: 'outdoor', href: '/categories/outdoor', icon: '🏃', count: '650+ 상품' }
      ];
    }
  }
}
