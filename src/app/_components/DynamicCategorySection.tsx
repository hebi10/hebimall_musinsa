'use client';

import Link from "next/link";
import Image from "next/image";
import { useMainPageCategories } from '@/shared/hooks/useCategoryOrder';
import { DEFAULT_CATEGORY_IDS, getDefaultCategoryNames } from '@/shared/utils/categoryUtils';
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

const CATEGORY_IMAGES = [
  '/category/main_category01.png',
  '/category/main_category02.png',
  '/category/main_category03.png',
  '/category/main_category04.png',
];

function getFallbackCategories(maxCategories: number): CategoryCardProps[] {
  const categoryNames = getDefaultCategoryNames();

  return DEFAULT_CATEGORY_IDS.slice(0, maxCategories).map((id, index) => ({
    id,
    name: categoryNames[id] || id,
    slug: id,
    href: `/categories/${id}`,
    icon: '',
    image: CATEGORY_IMAGES[index] || CATEGORY_IMAGES[0],
    count: '',
  }));
}

export default function DynamicCategorySection({ 
  maxCategories = 4, 
  className = '' 
}: DynamicCategorySectionProps) {
  const { data, isLoading: loading, error, refetch } = useMainPageCategories(maxCategories);
  const categories = (data && data.length > 0 ? data : getFallbackCategories(maxCategories)) as CategoryCardProps[];

  if (loading) {
    return (
      <div className={`${styles.categoryGrid} ${className}`}>
        {Array.from({ length: maxCategories }).map((_, index) => (
          <div key={index} className={`${styles.categoryCard} ${styles.loading}`}>
            <div className={styles.categoryImageWrapper}>
              <div className={`${styles.categoryImagePlaceholder} ${styles.loadingShimmer}`}></div>
            </div>
            <div className={styles.categoryInfo}>
              <span className={styles.categoryLabel}>로딩 중...</span>
              <span className={styles.categoryCount}>상품 수 확인 중</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.errorContainer} ${className}`}>
        <p className={styles.errorMessage}>카테고리를 불러오는데 실패했습니다.</p>
        <button 
          onClick={() => refetch()} 
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
            </div>
          </div>
          <div className={styles.categoryInfo}>
            <span className={styles.categoryLabel}>{category.name}</span>
            <span className={styles.categoryCount}>
              {category.count || '상품 준비 중'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
