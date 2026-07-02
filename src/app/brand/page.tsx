'use client';

import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/app/_components/PageHeader';
import { useBrandSummaries } from '@/shared/hooks/useProducts';
import styles from './page.module.css';

export default function BrandPage() {
  const { data: brands = [], isLoading: loading, error } = useBrandSummaries();

  return (
    <div className={styles.container}>
      <PageHeader
        title="브랜드"
        description="STYNA에 등록된 브랜드별 상품을 확인하세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '브랜드' },
        ]}
      />

      <section className={styles.content}>
        {loading ? (
          <div className={styles.stateBox}>브랜드를 불러오는 중입니다.</div>
        ) : error ? (
          <div className={styles.stateBox}>브랜드 목록을 불러오지 못했습니다.</div>
        ) : brands.length === 0 ? (
          <div className={styles.stateBox}>등록된 브랜드가 없습니다.</div>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={`/search?q=${encodeURIComponent(brand.name)}`}
                className={styles.brandCard}
              >
                <div className={styles.imageFrame}>
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={`${brand.name} 대표 상품`}
                      className={styles.brandImage}
                      fill
                      sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 25vw"
                    />
                  ) : (
                    <span className={styles.imageFallback}>STYNA</span>
                  )}
                </div>
                <div className={styles.brandInfo}>
                  <h2 className={styles.brandName}>{brand.name}</h2>
                  <p className={styles.productCount}>{brand.productCount.toLocaleString()}개 상품</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
