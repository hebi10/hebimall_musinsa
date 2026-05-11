'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

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

  const fallbackCategories: Category[] = [
    {
      id: 'clothing',
      name: 'clothing',
      description: 'clothing category',
      icon: '',
      color: '#007bff',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shoes',
      name: 'shoes',
      description: 'shoes category',
      icon: '',
      color: '#6610f2',
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bags',
      name: 'bags',
      description: 'bags category',
      icon: '',
      color: '#ffc107',
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'accessories',
      name: 'accessories',
      description: 'accessories category',
      icon: '',
      color: '#28a745',
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const koreanNameMap: { [key: string]: string } = {
    clothing: '아우터',
    tops: '상의',
    bottoms: '하의',
    shoes: '신발',
    bags: '가방',
    accessories: '악세서리',
    jewelry: '주얼리',
    outdoor: '아웃도어',
    sports: '스포츠',
    pants: '바지',
    top: '상의',
    bag: '가방',
    accessory: '악세서리',
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryList = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const rawName = data.name || '';
          const koreanName =
            koreanNameMap[rawName.toLowerCase()] || koreanNameMap[doc.id.toLowerCase()] || rawName;

          return {
            id: doc.id,
            name: koreanName || doc.id,
            description: data.description || '',
            order: data.order || 0,
            isActive: data.isActive ?? true,
            icon: data.icon || '',
            color: data.color || '#000000',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Category;
        })
        .filter((category) => category.id && category.name);

      if (categoryList.length > 0) {
        setCategories(categoryList.filter((category) => category.isActive).sort((a, b) => a.order - b.order));
      } else {
        setCategories(fallbackCategories);
      }
    } catch (err) {
      console.error('카테고리 목록 조회 실패:', err);
      setCategories(fallbackCategories);
      setError(err instanceof Error ? err.message : '카테고리 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    refreshCategories,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
