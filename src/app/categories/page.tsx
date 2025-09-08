'use client';

import Link from 'next/link';
import { useCategories } from '@/context/categoryProvider';
import styles from './page.module.css';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSection}>
          <div className={styles.spinner}></div>
          <span className={styles.loadingText}>카테고리를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorSection}>
          <div className={styles.errorTitle}>오류가 발생했습니다</div>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  // 인기 카테고리 (상위 3개)
  const featuredCategories = categories.slice(0, 3);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>전체 카테고리</h1>
          <p className={styles.heroSubtitle}>
            원하는 카테고리를 선택해서 쇼핑하세요
          </p>
        </div>
      </div>

      <div className={styles.contentSection}>
        {/* Categories Grid */}
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryImage}>
                <span className={styles.categoryIcon}>
                  {category.icon || '📦'}
                </span>
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryDescription}>
                  {category.description}
                </p>
                <div className={styles.categoryAction}>
                  쇼핑하기
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <div className={styles.featuredSection}>
            <div className={styles.featuredHeader}>
              <h2 className={styles.featuredTitle}>인기 카테고리</h2>
              <p className={styles.featuredSubtitle}>
                가장 인기 있는 카테고리를 확인해보세요
              </p>
            </div>
            <div className={styles.featuredGrid}>
              {featuredCategories.map((category, index) => (
                <Link 
                  key={category.id} 
                  href={`/categories/${category.id}`} 
                  className={`${styles.featuredCard} ${styles[`featured${index + 1}`]}`}
                >
                  <div className={styles.featuredCardContent}>
                    <div className={styles.featuredIcon}>
                      {category.icon || '📦'}
                    </div>
                    <h3 className={styles.featuredName}>{category.name}</h3>
                    <p className={styles.featuredDescription}>{category.description}</p>
                    <div className={styles.featuredAction}>
                      지금 쇼핑하기
                      <span className={styles.featuredArrow}>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h3 className={styles.emptyTitle}>카테고리가 없습니다</h3>
            <p className={styles.emptyMessage}>
              아직 등록된 카테고리가 없습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
