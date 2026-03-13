'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { CategoryOrderService } from '@/shared/services/categoryOrderService';
import styles from '../page.module.css';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon: string;
  image: string;
  count: string;
}

interface DynamicCategorySectionProps {
  maxCategories?: number;
  className?: string;
}

export default function DynamicCategorySection({ 
  maxCategories = 4, 
  className = '' 
}: DynamicCategorySectionProps) {
  const [categories, setCategories] = useState<CategoryCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoryData = await CategoryOrderService.getMainPageCategories(maxCategories);
        setCategories(categoryData);
        setError(null);
      } catch (err) {
        console.error('카테고리 로딩 실패:', err);
        setError('카테고리를 불러오는데 실패했습니다.');
        
        // 에러 시 기본 카테고리 설정
        setCategories([
          { id: 'clothing', name: '의류', slug: 'clothing', href: '/categories/clothing', icon: '', image: '/category/main_category01.png', count: '' },
          { id: 'bags', name: '가방', slug: 'bags', href: '/categories/bags', icon: '', image: '/category/main_category02.png', count: '' },
          { id: 'accessories', name: '액세서리', slug: 'accessories', href: '/categories/accessories', icon: '', image: '/category/main_category03.png', count: '' },
          { id: 'outdoor', name: '스포츠', slug: 'outdoor', href: '/categories/sports', icon: '', image: '/category/main_category04.png', count: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [maxCategories]);

  if (loading) {
    return (
      <div className={`${styles.categoryGrid} ${className}`}>
        {Array.from({ length: maxCategories }).map((_, index) => (
          <div key={index} className={`${styles.categoryCard} ${styles.loading}`}>
            <div className={styles.categoryImageWrapper}>
              <div className={`${styles.categoryImagePlaceholder} ${styles.loadingShimmer}`}>
                <span className={styles.categoryIcon}></span>
              </div>
            </div>
            <div className={styles.categoryInfo}>
              <span className={styles.categoryLabel}>로딩 중...</span>
              <span className={styles.categoryCount}>-</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.errorContainer} ${className}`}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.categoryGrid} ${className}`}>
      {categories.map((category) => (
        <Link 
          key={category.id} 
          href={category.href} 
          className={styles.categoryCard}
        >
          <div className={styles.categoryImageWrapper}>
            <div className={styles.categoryImagePlaceholder}>
              <Image
                src={category.image}
                alt={category.name}
                fill
                style={{ objectFit: 'cover' }}
                className={styles.categoryImage}
              />
              <div className={styles.categoryOverlay}>
                <span className={styles.categoryIcon}>{category.icon}</span>
              </div>
            </div>
          </div>
          <div className={styles.categoryInfo}>
            <span className={styles.categoryLabel}>{category.name}</span>
            <span className={styles.categoryCount}>{category.count}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// 카테고리별 배경 클래스 반환
function getCategoryBgClass(categoryName: string): string {
  const bgClassMap: Record<string, string> = {
    '의류': styles.clothingBg,
    '상의': styles.clothingBg,
    '하의': styles.clothingBg,
    '가방': styles.bagsBg,
    '액세서리': styles.accessoriesBg,
    '아웃도어': styles.outdoorBg,
    '스포츠': styles.sportsBg,
    '신발': styles.shoesBg,
    '주얼리': styles.jewelryBg
  };
  
  return bgClassMap[categoryName] || styles.defaultBg;
}
