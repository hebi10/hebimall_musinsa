'use client';

import { useState, useEffect } from 'react';
import { FeaturedProductService } from '@/shared/services/featuredProductService';
import { Product } from '@/shared/types/product';
import ProductCard from '@/app/products/_components/ProductCard';
import Link from 'next/link';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title: '이번 주 추천 상품',
    subtitle: 'MD가 직접 선별한 특별한 상품들',
    isActive: true
  });

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      console.log('추천 상품 로딩 시작...');
      
      const [products, configData] = await Promise.all([
        FeaturedProductService.getFeaturedProducts(),
        FeaturedProductService.getFeaturedProductConfig()
      ]);

      console.log('로드된 추천 상품:', products);
      console.log('설정 데이터:', configData);

      setFeaturedProducts(products);
      
      if (configData) {
        setConfig({
          title: configData.title,
          subtitle: configData.subtitle,
          isActive: configData.isActive
        });
      }
    } catch (error) {
      console.error('추천 상품 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 설정이 비활성화되어 있으면 렌더링하지 않음
  if (!config.isActive) {
    return null;
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{config.title}</h2>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>추천 상품을 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    console.log('⚠️ 추천 상품이 없습니다. 관리자 페이지에서 상품을 설정해주세요.');
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <span className={styles.badge}>FEATURED</span>
              <h2 className={styles.title}>{config.title}</h2>
              <p className={styles.subtitle}>관리자가 아직 상품을 설정하지 않았습니다</p>
            </div>
          </div>
          
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>추천 상품이 없습니다</h3>
            <p className={styles.emptyDescription}>
              관리자 페이지에서 추천 상품을 설정해주세요.
            </p>
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f4f5f7', borderRadius: '4px', fontSize: '0.85rem', color: '#6b778c' }}>
              <strong>해결 방법:</strong><br/>
              1. <a href="/admin/featured-products" style={{ color: '#2b6cb0' }}>/admin/featured-products</a> 페이지 방문<br/>
              2. &quot;자동 선택 (높은 평점 순)&quot; 버튼 클릭<br/>
              3. &quot;설정 저장&quot; 버튼 클릭<br/>
              4. 이 페이지로 돌아와서 새로고침
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '0.75rem', 
                padding: '0.5rem 1.25rem', 
                background: '#2b6cb0', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.badge}>FEATURED</span>
            <h2 className={styles.title}>{config.title}</h2>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>
          <Link href="/recommend" className={styles.viewAllButton}>
            더 많은 추천 상품 보기
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
        
        <div className={styles.productGrid}>
          {featuredProducts.map((product, index) => (
            <div key={product.id} className={styles.productWrapper}>
              <div className={styles.rankBadge}>
                <span className={styles.rankNumber}>{index + 1}</span>
              </div>
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

        {/* 추가 정보 섹션 */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>MD</div>
            <div className={styles.infoContent}>
              <h4 className={styles.infoTitle}>MD 추천</h4>
              <p className={styles.infoDescription}>전문 MD가 직접 큐레이션한 상품</p>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>배송</div>
            <div className={styles.infoContent}>
              <h4 className={styles.infoTitle}>빠른 배송</h4>
              <p className={styles.infoDescription}>당일 발송으로 빠르게 받아보세요</p>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>추천</div>
            <div className={styles.infoContent}>
              <h4 className={styles.infoTitle}>맞춤 추천</h4>
              <p className={styles.infoDescription}>개인별 맞춤 상품을 추천해드려요</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
