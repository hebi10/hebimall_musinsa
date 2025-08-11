import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  FirestoreError 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  StorageError 
} from 'firebase/storage';
import { db, storage } from '@/shared/libs/firebase/firebase';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '@/shared/types/category';

const CATEGORIES_COLLECTION = 'categories';

export class CategoryService {
  // 모든 카테고리 가져오기
  static async getCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Firebase에서 카테고리 조회 시작...');
      
      // 인덱스 없이도 작동하도록 간단한 쿼리 사용
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        orderBy('order', 'asc')
      );
      
      console.log('📋 Firestore 쿼리 실행 중...');
      const querySnapshot = await getDocs(q);
      console.log('📊 쿼리 결과:', querySnapshot.size, '개 문서');
      
      const categories: Category[] = [];
      
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          console.log('📄 문서 데이터:', doc.id, data);
          
          // isActive가 true인 것만 필터링 (클라이언트 사이드에서)
          if (data.isActive === true) {
            categories.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Category);
          }
        } catch (docError) {
          console.error('❌ 문서 파싱 에러:', doc.id, docError);
        }
      });
      
      console.log('✅ 최종 카테고리 목록:', categories);
      return categories;
    } catch (error) {
      console.error('❌ 카테고리 조회 에러:', error);
      
      if (error instanceof FirestoreError) {
        console.error('Firestore 에러 코드:', error.code);
        console.error('Firestore 에러 메시지:', error.message);
      }
      
      throw new Error('카테고리를 불러오는데 실패했습니다.');
    }
  }

  // 관리자용: 모든 카테고리 가져오기 (비활성 포함)
  static async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Category);
      });
      
      return categories;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw new Error('카테고리를 불러오는데 실패했습니다.');
    }
  }

  // 특정 카테고리 가져오기
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Category;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('카테고리를 불러오는데 실패했습니다.');
    }
  }

  // 카테고리 생성
  static async createCategory(categoryData: CreateCategoryRequest): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        ...categoryData,
        productCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('카테고리 생성에 실패했습니다.');
    }
  }

  // 카테고리 업데이트
  static async updateCategory(categoryData: UpdateCategoryRequest): Promise<void> {
    try {
      const { id, ...updateData } = categoryData;
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('카테고리 업데이트에 실패했습니다.');
    }
  }

  // 카테고리 삭제 (실제로는 비활성화)
  static async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('카테고리 삭제에 실패했습니다.');
    }
  }

  // 이미지 업로드
  static async uploadCategoryImage(file: File, categoryId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${categoryId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `categories/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  }

  // 이미지 삭제
  static async deleteCategoryImage(imageUrl: string): Promise<void> {
    try {
      // URL에서 파일 경로 추출
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // 이미지 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  // 카테고리 순서 업데이트
  static async updateCategoryOrder(categories: { id: string; order: number }[]): Promise<void> {
    try {
      const batch = [];
      
      for (const category of categories) {
        const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
        batch.push(
          updateDoc(docRef, {
            order: category.order,
            updatedAt: Timestamp.now(),
          })
        );
      }
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error updating category order:', error);
      throw new Error('카테고리 순서 업데이트에 실패했습니다.');
    }
  }

  // 슬러그로 카테고리 찾기
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where('slug', '==', slug),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Category;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw new Error('카테고리를 불러오는데 실패했습니다.');
    }
  }
}
