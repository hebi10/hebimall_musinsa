'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductService } from '@/shared/services/productService';
import { Product } from '@/shared/types/product';
import { getCategoryName } from '@/shared/utils/categoryUtils';
import styles from './ProductDetail.module.css';

interface ProductDetailPageProps {
  params: Promise<{
    category: string;
    productId: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [categoryDisplayName, setCategoryDisplayName] = useState<string>('');

  // params 비동기 처리
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      let categoryParam = resolvedParams.category;
      
      // clothing을 tops로 리다이렉트
      if (categoryParam === 'clothing') {
        categoryParam = 'tops';
        // URL도 변경
        window.history.replaceState(null, '', `/categories/tops/products/${resolvedParams.productId}`);
      }
      
      setCategory(categoryParam);
      setProductId(resolvedParams.productId);

      // 카테고리 표시 이름 가져오기
      try {
        const displayName = await getCategoryName(categoryParam);
        setCategoryDisplayName(displayName);
      } catch (error) {
        console.error('카테고리 이름 가져오기 실패:', error);
        setCategoryDisplayName(categoryParam);
      }
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    const loadProductData = async () => {
      // category와 productId가 설정되지 않았으면 대기
      if (!category || !productId) return;
      
      try {
        setLoading(true);
        setError(null);

        // 1. 상품 상세 정보 로드
        const productData = await ProductService.getProductById(productId);
        
        if (!productData) {
          setError('상품을 찾을 수 없습니다.');
          return;
        }

        // 카테고리 일치 확인
        if (productData.category !== category) {
          setError('잘못된 카테고리 경로입니다.');
          return;
        }

        setProduct(productData);
        
        // 기본값 설정
        if (productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        // 2. 관련 상품 로드
        const related = await ProductService.getRelatedProducts(productId, 4);
        setRelatedProducts(related);

      } catch (err) {
        console.error('상품 상세 정보 로드 실패:', err);
        setError('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [category, productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes.length > 0 && !selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    if (product.colors.length > 0 && !selectedColor) {
      alert('색상을 선택해주세요.');
      return;
    }

    // 장바구니 추가 로직
    console.log('장바구니 추가:', {
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity
    });

    alert('장바구니에 추가되었습니다!');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>
          <div className={styles.loadingSpinner}></div>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>{error || '상품을 찾을 수 없습니다.'}</p>
          <Link href={`/categories/${category}`} className={styles.backButton}>
            카테고리로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const discountPrice = product.originalPrice && product.originalPrice > product.price 
    ? product.originalPrice - product.price 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>홈</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <Link href="/categories" className={styles.breadcrumbLink}>카테고리</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <Link href={`/categories/${category}`} className={styles.breadcrumbLink}>
          {categoryDisplayName || category}
        </Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      <div className={styles.productDetail}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {product.mainImage ? (
              <img 
                src={product.mainImage} 
                alt={product.name}
                className={styles.productImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}></div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((image, index) => (
                <div key={index} className={styles.thumbnail}>
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.productHeader}>
            <div className={styles.brand}>{product.brand}</div>
            <h1 className={styles.productName}>{product.name}</h1>
            
            <div className={styles.badges}>
              {product.isNew && <span className={styles.newBadge}>NEW</span>}
              {product.isSale && <span className={styles.saleBadge}>SALE</span>}
            </div>
          </div>

          <div className={styles.rating}>
            <span className={styles.stars}>⭐ {product.rating}</span>
            <span className={styles.reviewCount}>({product.reviewCount}개 리뷰)</span>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.currentPrice}>
              {product.price.toLocaleString()}원
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className={styles.originalPrice}>
                {product.originalPrice.toLocaleString()}원
                <span className={styles.discount}>
                  ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% 할인)
                </span>
              </div>
            )}
          </div>

          <div className={styles.options}>
            {product.sizes.length > 0 && (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>사이즈</label>
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className={styles.optionSelect}
                >
                  <option value="">사이즈 선택</option>
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>색상</label>
                <select 
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={styles.optionSelect}
                >
                  <option value="">색상 선택</option>
                  {product.colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>수량</label>
              <div className={styles.quantityControl}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className={styles.stockInfo}>
            {product.stock > 0 ? (
              <span className={styles.inStock}>재고 {product.stock}개</span>
            ) : (
              <span className={styles.outOfStock}>품절</span>
            )}
          </div>

          <div className={styles.actions}>
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`${styles.addToCartButton} ${product.stock === 0 ? styles.disabled : ''}`}
            >
              장바구니 담기
            </button>
            <button 
              disabled={product.stock === 0}
              className={`${styles.buyNowButton} ${product.stock === 0 ? styles.disabled : ''}`}
            >
              바로 구매
            </button>
          </div>
        </div>
      </div>

      <div className={styles.productDescription}>
        <h2>상품 설명</h2>
        <p>{product.description}</p>
        
        {product.details && (
          <div className={styles.productDetails}>
            <h3>상품 정보</h3>
            <ul>
              <li><strong>소재:</strong> {product.details.material}</li>
              <li><strong>원산지:</strong> {product.details.origin}</li>
              <li><strong>제조업체:</strong> {product.details.manufacturer}</li>
              <li><strong>주의사항:</strong> {product.details.precautions}</li>
            </ul>
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className={styles.relatedProducts}>
          <h2>관련 상품</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((relatedProduct) => (
              <Link 
                key={relatedProduct.id}
                href={`/categories/${relatedProduct.category}/products/${relatedProduct.id}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImage}>
                  {relatedProduct.mainImage ? (
                    <img src={relatedProduct.mainImage} alt={relatedProduct.name} />
                  ) : (
                    <div className={styles.relatedPlaceholder}></div>
                  )}
                </div>
                <div className={styles.relatedInfo}>
                  <div className={styles.relatedName}>{relatedProduct.name}</div>
                  <div className={styles.relatedPrice}>
                    {relatedProduct.price.toLocaleString()}원
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
