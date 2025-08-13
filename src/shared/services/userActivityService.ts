import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { RecentProduct, WishlistItem } from '@/shared/types/userActivity';

export class UserActivityService {
  // 최근 본 상품 추가
  static async addRecentProduct(userId: string, productId: string): Promise<void> {
    try {
      // 기존에 있는지 확인하고 있으면 업데이트
      const recentCollection = collection(db, 'userRecentProducts');
      const existingQuery = query(
        recentCollection,
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // 기존 기록이 있으면 시간만 업데이트
        const existingDoc = existingSnapshot.docs[0];
        await setDoc(doc(db, 'userRecentProducts', existingDoc.id), {
          userId,
          productId,
          viewedAt: Timestamp.now()
        });
      } else {
        // 새로 추가
        await addDoc(recentCollection, {
          userId,
          productId,
          viewedAt: Timestamp.now()
        });
      }
      
      // 20개 이상이면 오래된 것 삭제
      await this.cleanupRecentProducts(userId);
      
    } catch (error) {
      console.error('최근 본 상품 추가 실패:', error);
    }
  }

  // 최근 본 상품 목록 조회
  static async getRecentProducts(userId: string): Promise<RecentProduct[]> {
    try {
      const recentCollection = collection(db, 'userRecentProducts');
      const recentQuery = query(
        recentCollection,
        where('userId', '==', userId),
        orderBy('viewedAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(recentQuery);
      
      const recentProducts: RecentProduct[] = snapshot.docs.map(doc => ({
        id: doc.id,
        productId: doc.data().productId,
        userId: doc.data().userId,
        viewedAt: doc.data().viewedAt.toDate()
      }));
      
      return recentProducts;
      
    } catch (error) {
      console.error('최근 본 상품 조회 실패:', error);
      return [];
    }
  }

  // 오래된 최근 본 상품 정리
  private static async cleanupRecentProducts(userId: string): Promise<void> {
    try {
      const recentCollection = collection(db, 'userRecentProducts');
      const allQuery = query(
        recentCollection,
        where('userId', '==', userId),
        orderBy('viewedAt', 'desc')
      );
      
      const snapshot = await getDocs(allQuery);
      
      if (snapshot.docs.length > 20) {
        // 20개 이후의 문서들 삭제
        const docsToDelete = snapshot.docs.slice(20);
        for (const docToDelete of docsToDelete) {
          await deleteDoc(doc(db, 'userRecentProducts', docToDelete.id));
        }
      }
      
    } catch (error) {
      console.error('최근 본 상품 정리 실패:', error);
    }
  }

  // 찜하기 추가
  static async addToWishlist(userId: string, productId: string): Promise<void> {
    try {
      // 이미 찜한 상품인지 확인
      if (await this.isInWishlist(userId, productId)) {
        throw new Error('이미 찜한 상품입니다.');
      }
      
      const wishlistCollection = collection(db, 'userWishlist');
      await addDoc(wishlistCollection, {
        userId,
        productId,
        addedAt: Timestamp.now()
      });
      
    } catch (error) {
      console.error('찜하기 추가 실패:', error);
      throw error;
    }
  }

  // 찜하기 제거
  static async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const wishlistCollection = collection(db, 'userWishlist');
      const wishlistQuery = query(
        wishlistCollection,
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      
      const snapshot = await getDocs(wishlistQuery);
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }
      
    } catch (error) {
      console.error('찜하기 제거 실패:', error);
      throw error;
    }
  }

  // 찜 여부 확인
  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistCollection = collection(db, 'userWishlist');
      const wishlistQuery = query(
        wishlistCollection,
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      
      const snapshot = await getDocs(wishlistQuery);
      return !snapshot.empty;
      
    } catch (error) {
      console.error('찜 여부 확인 실패:', error);
      return false;
    }
  }

  // 찜한 상품 목록 조회
  static async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    try {
      const wishlistCollection = collection(db, 'userWishlist');
      const wishlistQuery = query(
        wishlistCollection,
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );
      
      const snapshot = await getDocs(wishlistQuery);
      
      const wishlistItems: WishlistItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        productId: doc.data().productId,
        userId: doc.data().userId,
        addedAt: doc.data().addedAt.toDate()
      }));
      
      return wishlistItems;
      
    } catch (error) {
      console.error('찜한 상품 조회 실패:', error);
      return [];
    }
  }
}
