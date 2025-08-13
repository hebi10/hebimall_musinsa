'use client';

import React, { useEffect, useState } from 'react';
import { useUserActivity } from '@/context/userActivityProvider';
import { useProduct } from '@/context/productProvider';
import { useAuth } from '@/context/authProvider';
import { Product } from '@/shared/types/product';
import Link from 'next/link';
import styles from './RecentProducts.module.css';

export default function RecentProducts() {
  const { 
    recentProducts, 
    loading, 
    error,
    loadRecentProducts 
  } = useUserActivity();
  
  const { getProductById } = useProduct();
  const { user } = useAuth();
  
  const [productsData, setProductsData] = useState<{ [key: string]: Product }>({});

  useEffect(() => {
    if (user?.uid) {
      loadRecentProducts(user.uid);
    }
  }, [user, loadRecentProducts]);

  // 상품 정보 로드
  useEffect(() => {
    const loadProductsData = async () => {
      const productDataMap: { [key: string]: Product } = {};
      
      for (const recentProduct of recentProducts) {
        try {
          const product = await getProductById(recentProduct.productId);
          if (product) {
            productDataMap[recentProduct.productId] = product;
          }
        } catch (error) {
          console.error(`상품 ${recentProduct.productId} 정보 로드 실패:`, error);
        }
      }
      
      setProductsData(productDataMap);
    };

    if (recentProducts.length > 0) {
      loadProductsData();
    }
  }, [recentProducts, getProductById]);

  if (!user) {
    return (
      <div className={styles.notLoggedIn}>
        <p>로그인이 필요한 서비스입니다.</p>
        <Link href="/auth/login" className={styles.loginLink}>
          로그인하기
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>최근 본 상품</h2>
        <span className={styles.count}>{recentProducts.length}개</span>
      </div>

      {loading ? (
        <div className={styles.loading}>최근 본 상품을 불러오는 중...</div>
      ) : recentProducts.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👀</div>
          <p>최근 본 상품이 없습니다.</p>
          <Link href="/categories" className={styles.shopLink}>
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {recentProducts.map((recentProduct) => {
            const product = productsData[recentProduct.productId];
            
            if (!product) {
              return (
                <div key={recentProduct.id} className={styles.productCard}>
                  <div className={styles.productImageSkeleton}></div>
                  <div className={styles.productInfoSkeleton}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                  </div>
                </div>
              );
            }
            
            return (
              <div key={recentProduct.id} className={styles.productCard}>
                <Link href={`/products/${product.id}`} className={styles.productLink}>
                  <div className={styles.productImage}>
                    <img 
                      src={product.mainImage || product.images[0]} 
                      alt={product.name}
                    />
                    <div className={styles.viewedTime}>
                      {recentProduct.viewedAt.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productBrand}>{product.brand}</p>
                    
                    <div className={styles.priceInfo}>
                      {product.saleRate && product.saleRate > 0 ? (
                        <>
                          <span className={styles.saleRate}>{product.saleRate}%</span>
                          <span className={styles.salePrice}>
                            {product.price.toLocaleString()}원
                          </span>
                          {product.originalPrice && (
                            <span className={styles.originalPrice}>
                              {product.originalPrice.toLocaleString()}원
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={styles.price}>
                          {product.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
