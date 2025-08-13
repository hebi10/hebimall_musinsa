"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { LocalUserActivityService } from "@/shared/services/localUserActivityService";
import { RecentProduct, WishlistItem } from "@/shared/types/userActivity";
import { useAuth } from "./authProvider";

interface UserActivityContextType {
  // 상태
  recentProducts: RecentProduct[];
  wishlistItems: WishlistItem[];
  
  // UI 상태
  loading: boolean;
  error: string | null;
  
  // 액션
  addRecentProduct: (productId: string) => Promise<void>;
  loadRecentProducts: (userId: string) => void;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  loadWishlistItems: (userId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearUserActivity: () => void;
}

const UserActivityContext = createContext<UserActivityContextType | undefined>(undefined);

export function useUserActivity() {
  const context = useContext(UserActivityContext);
  if (context === undefined) {
    throw new Error('useUserActivity must be used within a UserActivityProvider');
  }
  return context;
}

export function UserActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // 상태
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  
  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 변경시 데이터 로드
  useEffect(() => {
    if (user?.uid) {
      loadRecentProducts(user.uid);
      loadWishlistItems(user.uid);
    } else {
      setRecentProducts([]);
      setWishlistItems([]);
    }
  }, [user?.uid]);

  // 최근 본 상품 추가
  const addRecentProduct = useCallback(async (productId: string) => {
    if (!user?.uid) return;
    
    try {
      LocalUserActivityService.addRecentProduct(user.uid, productId);
      
      // 로컬 상태 업데이트
      loadRecentProducts(user.uid);
      
    } catch (err) {
      console.error('최근 본 상품 추가 실패:', err);
    }
  }, [user?.uid]);

  // 최근 본 상품 로드
  const loadRecentProducts = useCallback((userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const products = LocalUserActivityService.getRecentProducts(userId);
      setRecentProducts(products);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '최근 본 상품을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('최근 본 상품 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 찜하기 추가
  const addToWishlist = useCallback(async (productId: string) => {
    if (!user?.uid) return;
    
    try {
      setError(null);
      
      LocalUserActivityService.addToWishlist(user.uid, productId);
      
      // 로컬 상태 업데이트
      loadWishlistItems(user.uid);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '찜하기에 실패했습니다.';
      setError(errorMessage);
      console.error('찜하기 추가 실패:', err);
      throw err;
    }
  }, [user?.uid]);

  // 찜하기 제거
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user?.uid) return;
    
    try {
      setError(null);
      
      LocalUserActivityService.removeFromWishlist(user.uid, productId);
      
      // 로컬 상태 업데이트
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '찜하기 제거에 실패했습니다.';
      setError(errorMessage);
      console.error('찜하기 제거 실패:', err);
      throw err;
    }
  }, [user?.uid]);

  // 찜한 상품 로드
  const loadWishlistItems = useCallback((userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const items = LocalUserActivityService.getWishlistItems(userId);
      setWishlistItems(items);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '찜한 상품을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('찜한 상품 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 찜 여부 확인
  const isInWishlist = useCallback((productId: string): boolean => {
    if (!user?.uid) return false;
    return LocalUserActivityService.isInWishlist(user.uid, productId);
  }, [user?.uid, wishlistItems]);

  // 사용자 활동 데이터 초기화
  const clearUserActivity = useCallback(() => {
    if (!user?.uid) return;
    
    LocalUserActivityService.clearUserData(user.uid);
    setRecentProducts([]);
    setWishlistItems([]);
    setError(null);
  }, [user?.uid]);

  const value: UserActivityContextType = {
    // 상태
    recentProducts,
    wishlistItems,
    
    // UI 상태
    loading,
    error,
    
    // 액션
    addRecentProduct,
    loadRecentProducts,
    addToWishlist,
    removeFromWishlist,
    loadWishlistItems,
    isInWishlist,
    clearUserActivity,
  };

  return (
    <UserActivityContext.Provider value={value}>
      {children}
    </UserActivityContext.Provider>
  );
}
