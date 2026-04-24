'use client';

import Link from 'next/link';
import { useProduct } from '@/context/productProvider';
import ProductCard from '@/app/products/_components/ProductCard';
import styles from './ProductSection.module.css';

type ProductSectionVariant = 'default' | 'ranking' | 'sale' | 'scroll';
type ProductSectionHeaderStyle = 'minimal' | 'bordered' | 'display';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  type: 'recommended' | 'new' | 'sale' | 'bestseller';
  showViewAllButton?: boolean;
  maxItems?: number;
  variant?: ProductSectionVariant;
  headerStyle?: ProductSectionHeaderStyle;
  viewAllLink?: string;
  viewAllLabel?: string;
  className?: string;
}

export default function ProductSection({
  title,
  subtitle,
  description,
  eyebrow,
  type,
  showViewAllButton = true,
  maxItems = 8,
  variant = 'default',
  headerStyle = 'minimal',
  viewAllLink = '/recommend',
  viewAllLabel = '전체 보기',
  className = '',
}: ProductSectionProps) {
  const {
    recommendedProducts,
    newProducts,
    saleProducts,
    bestSellerProducts,
    loading,
  } = useProduct();

  const getProducts = () => {
    switch (type) {
      case 'recommended':
        return recommendedProducts;
      case 'new':
        return newProducts;
      case 'sale':
        return saleProducts;
      case 'bestseller':
        return bestSellerProducts;
      default:
        return [];
    }
  };

  const products = getProducts().slice(0, maxItems);

  const sectionClassName = [styles.section, className].filter(Boolean).join(' ');
  const headerClassName = [
    styles.header,
    headerStyle === 'bordered'
      ? styles.headerBordered
      : headerStyle === 'display'
        ? styles.headerDisplay
        : styles.headerMinimal,
  ]
    .filter(Boolean)
    .join(' ');

  const gridClassName =
    variant === 'ranking'
      ? styles.rankingGrid
      : variant === 'sale'
        ? styles.saleGrid
        : variant === 'scroll'
          ? styles.scrollGrid
          : styles.productGrid;

  const linkClassName =
    headerStyle === 'display' ? styles.viewAllButton : styles.viewAllLink;

  const headerContent = (
    <div className={headerClassName}>
      <div className={styles.headerCopy}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {(description || showViewAllButton) && (
        <div className={styles.headerSide}>
          {description && <p className={styles.description}>{description}</p>}
          {showViewAllButton && (
            <Link href={viewAllLink} className={linkClassName}>
              {viewAllLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <section className={sectionClassName}>
        {headerContent}
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>상품을 불러오는 중입니다...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName}>
      {headerContent}

      <div className={gridClassName}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className={[
              variant === 'ranking' ? styles.rankingItem : '',
              variant === 'scroll' ? styles.scrollItem : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {variant === 'ranking' && (
              <span className={styles.rankNumber}>{index + 1}</span>
            )}
            <ProductCard
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
          </div>
        ))}
      </div>
    </section>
  );
}
