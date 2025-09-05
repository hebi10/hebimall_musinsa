'use client';

import Link from 'next/link';
import { useCategories } from '@/context/categoryProvider';
import styles from './page.module.css';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>카테고리를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // 인기 카테고리 (상위 3개)
  const featuredCategories = categories.slice(0, 3);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>전체 카테고리</h1>
        <p className={styles.subtitle}>원하는 카테고리를 선택해서 쇼핑하세요</p>
      </div>

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className={styles.categoryCard}
          >
            <div className={styles.categoryImage}>
              <div className={styles.imagePlaceholder}>
                <span className={styles.categoryIcon}>
                  {category.icon || '📦'}
                </span>
              </div>
            </div>
            <div className={styles.categoryContent}>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <p className={styles.categoryDescription}>{category.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {featuredCategories.length > 0 && (
        <div className={styles.featuredSection}>
          <h2 className={styles.featuredTitle}>인기 카테고리</h2>
          <div className={styles.featuredGrid}>
            {featuredCategories.map((category, index) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.id}`} 
                className={`${styles.featuredCard} ${styles[`featured${index + 1}`]}`}
              >
                <div className={styles.featuredContent}>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
