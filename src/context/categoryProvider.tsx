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

  // Fallback 카테고리 데이터 (한국어 이름 보장 및 자연스러운 순서)
  const fallbackCategories: Category[] = [
    {
      id: 'clothing',
      name: '상의',
      description: '트렌디하고 편안한 상의로 완성하는 나만의 스타일',
      icon: '👕',
      color: '#007bff',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shoes',
      name: '신발',
      description: '편안하고 스타일리시한 신발로 완벽한 발걸음을',
      icon: '�',
      color: '#6610f2',
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bags',
      name: '가방',
      description: '실용성과 스타일을 겸비한 가방 컬렉션',
      icon: '🎒',
      color: '#ffc107',
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'accessories',
      name: '액세서리',
      description: '포인트가 되는 액세서리로 스타일 완성',
      icon: '�',
      color: '#28a745',
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 한국어 이름 매핑 (Firebase 데이터가 영어인 경우 대비)
  const koreanNameMap: { [key: string]: string } = {
    'clothing': '의류',
    'shoes': '신발', 
    'bags': '가방',
    'Bags': '가방',
    'accessories': '액세서리',
    'pants': '하의',
    'bottoms': '하의',
    'top': '상의',
    'tops': '상의',
    'bag': '가방',
    'accessory': '액세서리'
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Firebase에서 카테고리 목록을 가져오고, 각 카테고리에 상품이 있는지 확인
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryList = snapshot.docs.map(doc => {
        const data = doc.data();
        const rawName = data.name || '';
        
        // 한국어 이름 변환 (영어 이름인 경우 한국어로 매핑)
        const koreanName = koreanNameMap[rawName.toLowerCase()] || 
                          koreanNameMap[doc.id.toLowerCase()] || 
                          rawName;
        
        return {
          id: doc.id,
          name: koreanName,
          description: data.description || '',
          order: data.order || 0,
          isActive: data.isActive ?? true,
          icon: data.icon || '',
          color: data.color || '#000000',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Category;
      }).filter(category => category.id && category.name); // id와 name이 있는 카테고리만 필터링
      
      if (categoryList && categoryList.length > 0) {
        // 활성 카테고리만 필터링하고 order로 정렬
        const activeCategories = categoryList
          .filter(category => category.isActive)
          .sort((a, b) => a.order - b.order);
        
        // 상품이 있는 카테고리와 없는 카테고리 모두 표시하되, 상품 수 정보 추가
        const categoriesWithInfo: Category[] = [];
        
        for (const category of activeCategories) {
          try {
            // 해당 카테고리의 products 서브컬렉션 확인
            const productsSnapshot = await getDocs(collection(db, 'categories', category.id, 'products'));
            categoriesWithInfo.push(category);
          } catch (error) {
            // 에러가 있어도 카테고리는 표시
            categoriesWithInfo.push(category);
          }
        }
        
        setCategories(categoriesWithInfo);
        console.log(`🔄 헤더에 표시될 카테고리: ${categoriesWithInfo.length}개`);
      } else {
        // 카테고리 컬렉션이 없는 경우 fallback 카테고리 표시
        console.log('🔄 Firebase 카테고리 없음 - Fallback 사용');
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
