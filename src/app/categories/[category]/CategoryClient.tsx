'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types/product';
import styles from './page.module.css';

interface CategoryClientProps {
  products: Product[];
  category: string;
  categoryData: {
    name: string;
    description: string;
  };
}

export default function CategoryClient({ products: initialProducts, category, categoryData }: CategoryClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [sortBy, setSortBy] = useState('popular');

  const sortOptions = [
    { value: 'popular', label: '인기순' },
    { value: 'newest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
    { value: 'review', label: '리뷰 많은순' }
  ];

  const sortProducts = (productList: Product[], sortOption: string): Product[] => {
    const sorted = [...productList];
    
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'review':
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.reviewCount * b.rating) - (a.reviewCount * a.rating));
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const sortedProducts = sortProducts(products, newSortBy);
    setProducts(sortedProducts);
  };

  return (
    <>
      <div className={styles.filterSection}>
        <div className={styles.sortSection}>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/categories/${category}/products/${product.id}`}
            className={styles.productCard}
          >
            <div className={styles.productImage}>
              {product.mainImage ? (
                <img 
                  src={product.mainImage} 
                  alt={product.name}
                  className={styles.productImg}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className={styles.productIcon}>
                  </span>
                </div>
              )}
              {product.isSale && product.saleRate && (
                <div className={styles.discountBadge}>
                  {product.saleRate}%
                </div>
              )}
              {product.isNew && (
                <div className={styles.newBadge}>
                  NEW
                </div>
              )}
            </div>
            <div className={styles.productInfo}>
              <div className={styles.brandName}>{product.brand}</div>
              <h3 className={styles.productName}>{product.name}</h3>
              <div className={styles.priceSection}>
                <span className={styles.currentPrice}>
                  {product.price.toLocaleString()}원
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className={styles.originalPrice}>
                    {product.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <div className={styles.ratingSection}>
                <span className={styles.rating}>{product.rating}</span>
                <span className={styles.reviewCount}>({product.reviewCount})</span>
              </div>
              <div className={styles.stockInfo}>
                {product.stock > 0 ? (
                  <span className={styles.inStock}>재고 있음</span>
                ) : (
                  <span className={styles.outOfStock}>품절</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
