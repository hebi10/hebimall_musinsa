// 로컬 스토리지 기반 사용자 활동 서비스
import { RecentProduct, WishlistItem } from '@/shared/types/userActivity';

const RECENT_PRODUCTS_KEY = 'hebimall_recent_products';
const WISHLIST_KEY = 'hebimall_wishlist';
const MAX_RECENT_PRODUCTS = 20; // 최대 20개까지 저장

export class LocalUserActivityService {
  // 최근 본 상품 추가
  static addRecentProduct(userId: string, productId: string): void {
    try {
      const key = `${RECENT_PRODUCTS_KEY}_${userId}`;
      const existing = this.getRecentProducts(userId);
      
      // 이미 존재하는 상품 제거 (중복 방지)
      const filtered = existing.filter(item => item.productId !== productId);
      
      // 새 항목을 맨 앞에 추가
      const newItem: RecentProduct = {
        id: `recent_${Date.now()}_${productId}`,
        productId,
        userId,
        viewedAt: new Date()
      };
      
      const updated = [newItem, ...filtered].slice(0, MAX_RECENT_PRODUCTS);
      
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('최근 본 상품 추가 실패:', error);
    }
  }

  // 최근 본 상품 조회
  static getRecentProducts(userId: string): RecentProduct[] {
    try {
      const key = `${RECENT_PRODUCTS_KEY}_${userId}`;
      const data = localStorage.getItem(key);
      
      if (!data) return [];
      
      const items = JSON.parse(data) as RecentProduct[];
      
      // Date 객체로 변환
      return items.map(item => ({
        ...item,
        viewedAt: new Date(item.viewedAt)
      }));
    } catch (error) {
      console.error('최근 본 상품 조회 실패:', error);
      return [];
    }
  }

  // 최근 본 상품 삭제
  static removeRecentProduct(userId: string, productId: string): void {
    try {
      const key = `${RECENT_PRODUCTS_KEY}_${userId}`;
      const existing = this.getRecentProducts(userId);
      const updated = existing.filter(item => item.productId !== productId);
      
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('최근 본 상품 삭제 실패:', error);
    }
  }

  // 모든 최근 본 상품 삭제
  static clearRecentProducts(userId: string): void {
    try {
      const key = `${RECENT_PRODUCTS_KEY}_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('최근 본 상품 전체 삭제 실패:', error);
    }
  }

  // 찜하기 추가
  static addToWishlist(userId: string, productId: string): void {
    try {
      const key = `${WISHLIST_KEY}_${userId}`;
      const existing = this.getWishlistItems(userId);
      
      // 이미 찜한 상품인지 확인
      if (existing.some(item => item.productId === productId)) {
        throw new Error('이미 찜한 상품입니다');
      }
      
      const newItem: WishlistItem = {
        id: `wishlist_${Date.now()}_${productId}`,
        productId,
        userId,
        addedAt: new Date()
      };
      
      const updated = [newItem, ...existing];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('찜하기 추가 실패:', error);
      throw error;
    }
  }

  // 찜한 상품 조회
  static getWishlistItems(userId: string): WishlistItem[] {
    try {
      const key = `${WISHLIST_KEY}_${userId}`;
      const data = localStorage.getItem(key);
      
      if (!data) return [];
      
      const items = JSON.parse(data) as WishlistItem[];
      
      // Date 객체로 변환
      return items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }));
    } catch (error) {
      console.error('찜한 상품 조회 실패:', error);
      return [];
    }
  }

  // 찜하기 제거
  static removeFromWishlist(userId: string, productId: string): void {
    try {
      const key = `${WISHLIST_KEY}_${userId}`;
      const existing = this.getWishlistItems(userId);
      const updated = existing.filter(item => item.productId !== productId);
      
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('찜하기 제거 실패:', error);
      throw error;
    }
  }

  // 찜 여부 확인
  static isInWishlist(userId: string, productId: string): boolean {
    try {
      const items = this.getWishlistItems(userId);
      return items.some(item => item.productId === productId);
    } catch (error) {
      console.error('찜 여부 확인 실패:', error);
      return false;
    }
  }

  // 모든 찜한 상품 삭제
  static clearWishlist(userId: string): void {
    try {
      const key = `${WISHLIST_KEY}_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('찜한 상품 전체 삭제 실패:', error);
    }
  }

  // 사용자 데이터 전체 삭제
  static clearUserData(userId: string): void {
    try {
      this.clearRecentProducts(userId);
      this.clearWishlist(userId);
    } catch (error) {
      console.error('사용자 데이터 삭제 실패:', error);
    }
  }

  // 통계 정보 조회
  static getStats(userId: string): {
    recentProductsCount: number;
    wishlistCount: number;
  } {
    try {
      const recentProducts = this.getRecentProducts(userId);
      const wishlistItems = this.getWishlistItems(userId);
      
      return {
        recentProductsCount: recentProducts.length,
        wishlistCount: wishlistItems.length
      };
    } catch (error) {
      console.error('통계 정보 조회 실패:', error);
      return {
        recentProductsCount: 0,
        wishlistCount: 0
      };
    }
  }
}
