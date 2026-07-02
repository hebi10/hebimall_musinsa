'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/app/products/_components/ProductCard';
import { useProducts } from '@/shared/hooks/useProducts';
import { Product } from '@/shared/types/product';
import styles from './CategoryProductTabs.module.css';

interface CategoryOption {
  id: string;
  label: string;
  products: Product[];
}

const CATEGORY_LABELS: Record<string, string> = {
  accessories: '액세서리',
  bags: '가방',
  bottoms: '하의',
  clothing: '의류',
  outdoor: '아웃도어',
  shoes: '신발',
  sports: '스포츠',
  tops: '상의',
};

function getCategoryId(product: Product) {
  return product.categoryId || product.category || 'etc';
}

function getCategoryLabel(categoryId: string) {
  return CATEGORY_LABELS[categoryId] || categoryId;
}

export default function CategoryProductTabs() {
  const { data: products = [], isLoading: loading } = useProducts();
  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const activeProducts = products.filter((product) => product.status === 'active');
    const grouped = activeProducts.reduce<Map<string, Product[]>>((acc, product) => {
      const categoryId = getCategoryId(product);
      const group = acc.get(categoryId) || [];
      group.push(product);
      acc.set(categoryId, group);
      return acc;
    }, new Map());

    return Array.from(grouped.entries())
      .map(([id, groupProducts]) => ({
        id,
        label: getCategoryLabel(id),
        products: [...groupProducts]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 4),
      }))
      .filter((category) => category.products.length > 0)
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 6);
  }, [products]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = categoryOptions.find((category) => category.id === selectedCategoryId) || categoryOptions[0];

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>카테고리별 상품</h2>
          <p className={styles.subtitle}>상품을 불러오는 중입니다.</p>
        </div>
      </section>
    );
  }

  if (!selectedCategory) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>카테고리별 상품</h2>
          <p className={styles.subtitle}>원하는 분류의 상품을 빠르게 확인하세요</p>
        </div>
        <Link href={`/categories/${selectedCategory.id}`} className={styles.viewAllLink}>
          전체보기
        </Link>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="카테고리별 상품">
        {categoryOptions.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={category.id === selectedCategory.id}
            className={`${styles.tab} ${category.id === selectedCategory.id ? styles.activeTab : ''}`}
            onClick={() => setSelectedCategoryId(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {selectedCategory.products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            brand={product.brand}
            price={product.price}
            originalPrice={product.originalPrice}
            isNew={product.isNew}
            isSale={product.isSale}
            saleRate={product.saleRate}
            rating={product.rating}
            reviewCount={product.reviewCount}
            image={product.mainImage || product.images[0]}
            stock={product.stock}
          />
        ))}
      </div>
    </section>
  );
}
