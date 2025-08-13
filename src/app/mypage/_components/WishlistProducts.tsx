'use client';

import React, { useEffect, useState } from 'react';
import { useUserActivity } from '@/context/userActivityProvider';
import { useProduct } from '@/context/productProvider';
import { useAuth } from '@/context/authProvider';
import { Product } from '@/shared/types/product';
import { WishlistItem } from '@/shared/types/userActivity';
import Link from 'next/link';
import styles from './WishlistProducts.module.css';

export default function WishlistProducts() {
  const { 
    wishlistItems, 
    loading, 
    error,
    loadWishlistItems,
    removeFromWishlist 
  } = useUserActivity();
  
  const { getProductById } = useProduct();
  const { user } = useAuth();
  
  const [productsData, setProductsData] = useState<{ [key: string]: Product }>({});
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadWishlistItems(user.uid);
    }
  }, [user, loadWishlistItems]);

  // 상품 정보 로드
  useEffect(() => {
    const loadProductsData = async () => {
      const productDataMap: { [key: string]: Product } = {};
      
      for (const wishlistItem of wishlistItems) {
        try {
          const product = await getProductById(wishlistItem.productId);
          if (product) {
            productDataMap[wishlistItem.productId] = product;
          }
        } catch (error) {
          console.error(`상품 ${wishlistItem.productId} 정보 로드 실패:`, error);
        }
      }
      
      setProductsData(productDataMap);
    };

    if (wishlistItems.length > 0) {
      loadProductsData();
    }
  }, [wishlistItems, getProductById]);

  const handleRemoveFromWishlist = async (wishlistId: string, productId: string) => {
    if (!user?.uid) return;
    
    setRemoving(wishlistId);
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('찜 목록에서 제거 실패:', error);
    }
    setRemoving(null);
  };

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
        <h2>찜한 상품</h2>
        <span className={styles.count}>{wishlistItems.length}개</span>
      </div>

      {loading ? (
        <div className={styles.loading}>찜한 상품을 불러오는 중...</div>
      ) : wishlistItems.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>❤️</div>
          <p>찜한 상품이 없습니다.</p>
          <Link href="/categories" className={styles.shopLink}>
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {wishlistItems.map((wishlistItem: WishlistItem) => {
            const product = productsData[wishlistItem.productId];
            
            if (!product) {
              return (
                <div key={wishlistItem.id} className={styles.productCard}>
                  <div className={styles.productImageSkeleton}></div>
                  <div className={styles.productInfoSkeleton}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                  </div>
                </div>
              );
            }
            
            return (
              <div key={wishlistItem.id} className={styles.productCard}>
                <div className={styles.removeButton}>
                  <button
                    onClick={() => handleRemoveFromWishlist(wishlistItem.id, wishlistItem.productId)}
                    disabled={removing === wishlistItem.id}
                    className={styles.removeBtn}
                  >
                    {removing === wishlistItem.id ? '삭제중...' : '❌'}
                  </button>
                </div>
                
                <Link href={`/products/${product.id}`} className={styles.productLink}>
                  <div className={styles.productImage}>
                    <img 
                      src={product.mainImage || product.images[0]} 
                      alt={product.name}
                    />
                    <div className={styles.addedTime}>
                      {wishlistItem.addedAt.toLocaleDateString()}
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
                    
                    <div className={styles.productStats}>
                      <span className={styles.rating}>⭐ {product.rating.toFixed(1)}</span>
                      <span className={styles.reviews}>리뷰 {product.reviewCount}개</span>
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
