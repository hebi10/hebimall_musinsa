'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '@/shared/types/category';
import { CategoryService } from '@/shared/services/categoryService';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback 카테고리 데이터
  const fallbackCategories: Category[] = [
    {
      id: 'clothing',
      name: '의류',
      slug: 'clothing',
      path: '/categories/clothing',
      description: '티셔츠, 셔츠, 후드, 니트 등 다양한 의류',
      icon: '👕',
      productCount: 0,
      isActive: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shoes',
      name: '신발',
      slug: 'shoes',
      path: '/categories/shoes',
      description: '운동화, 구두, 부츠, 샌들 등 모든 신발',
      icon: '👟',
      productCount: 0,
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bags',
      name: '가방',
      slug: 'bags',
      path: '/categories/bags',
      description: '백팩, 토트백, 크로스백, 지갑 등',
      icon: '👜',
      productCount: 0,
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'jewelry',
      name: '시계/주얼리',
      slug: 'jewelry',
      path: '/categories/jewelry',
      description: '시계, 목걸이, 팔찌, 반지 등 액세서리',
      icon: '💎',
      productCount: 0,
      isActive: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'accessories',
      name: '패션소품',
      slug: 'accessories',
      path: '/categories/accessories',
      description: '모자, 벨트, 선글라스, 스카프 등',
      icon: '🧢',
      productCount: 0,
      isActive: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'outdoor',
      name: '아웃도어',
      slug: 'outdoor',
      path: '/categories/outdoor',
      description: '등산복, 캠핑용품, 스포츠웨어 등',
      icon: '🏔️',
      productCount: 0,
      isActive: true,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sports',
      name: '스포츠',
      slug: 'sports',
      path: '/categories/sports',
      description: '운동복, 운동화, 스포츠용품 등',
      icon: '⚽',
      productCount: 0,
      isActive: true,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedCategories = await CategoryService.getCategories();
      
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
      } else {
        console.log('⚠️ Firebase에서 카테고리가 없어서 fallback 사용');
        setCategories(fallbackCategories);
      }
    } catch (err) {
      console.error('❌ 카테고리 불러오기 실패:', err);
      console.log('🔄 Fallback 카테고리 사용');
      
      // Firebase 연결 실패 시 fallback 카테고리 사용
      setCategories(fallbackCategories);
      setError(err instanceof Error ? err.message : '카테고리를 불러오는데 실패했습니다. 기본 카테고리를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    refreshCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
