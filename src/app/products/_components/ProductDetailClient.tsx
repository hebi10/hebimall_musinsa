'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/shared/types/product';
import { useProduct } from '@/context/productProvider';
import { useAuth } from '@/context/authProvider';
import { useUserActivity } from '@/context/userActivityProvider';
import { useAddToCart } from '@/shared/hooks/useCart';
import { useProductImageCache } from '@/shared/hooks/useImageCache';
import { getProductReviewStats } from '@/shared/utils/syncProductReviews';
import Button from '@/app/_components/Button';
import ProductCard from './ProductCard';
import ProductReviews from './ProductReviews';
import styles from './ProductDetail.module.css';

// 색상명을 CSS 색상값으로 변환하는 함수
const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    '검정': '#000000',
    '검은색': '#000000',
    '블랙': '#000000',
    'black': '#000000',
    '흰색': '#ffffff',
    '화이트': '#ffffff',
    'white': '#ffffff',
    '빨간색': '#dc3545',
    '빨강': '#dc3545',
    '레드': '#dc3545',
    'red': '#dc3545',
    '파란색': '#007bff',
    '파랑': '#007bff',
    '블루': '#007bff',
    'blue': '#007bff',
    '초록색': '#28a745',
    '초록': '#28a745',
    '그린': '#28a745',
    'green': '#28a745',
    '노란색': '#ffc107',
    '노랑': '#ffc107',
    '옐로우': '#ffc107',
    'yellow': '#ffc107',
    '보라색': '#6f42c1',
    '보라': '#6f42c1',
    '퍼플': '#6f42c1',
    'purple': '#6f42c1',
    '분홍색': '#e83e8c',
    '분홍': '#e83e8c',
    '핑크': '#e83e8c',
    'pink': '#e83e8c',
    '주황색': '#fd7e14',
    '주황': '#fd7e14',
    '오렌지': '#fd7e14',
    'orange': '#fd7e14',
    '회색': '#6c757d',
    '그레이': '#6c757d',
    'gray': '#6c757d',
    'grey': '#6c757d',
    '네이비': '#1a1a2e',
    'navy': '#1a1a2e',
    '베이지': '#f5f5dc',
    'beige': '#f5f5dc',
    '갈색': '#8b4513',
    '브라운': '#8b4513',
    'brown': '#8b4513'
  };
  
  return colorMap[colorName.toLowerCase()] || '#cccccc';
};

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { addRecentProduct, addToWishlist, removeFromWishlist, isInWishlist } = useUserActivity();
  const { 
    relatedProducts, 
    getProductById, 
    loadRelatedProducts,
    calculateDiscountPrice, 
    isInStock,
    loading 
  } = useProduct();

  const addToCartMutation = useAddToCart();

  // 상품 이미지 캐싱
  const { data: cachedImages, isLoading: imagesLoading } = useProductImageCache(product, !!product);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  // 이미지 오류 처리 함수
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    console.error('이미지 로드 실패:', product.images[index]);
  };

  // 대표 이미지 우선 표시를 위한 이미지 배열 재정렬
  const reorderedImages = (() => {
    // images 배열이 없으면 빈 배열 반환
    if (!product.images || !Array.isArray(product.images)) {
      return [];
    }
    
    if (product.mainImage && product.images.includes(product.mainImage)) {
      // 대표 이미지를 첫 번째로 이동
      const mainImageIndex = product.images.indexOf(product.mainImage);
      const images = [...product.images];
      const [mainImage] = images.splice(mainImageIndex, 1);
      return [mainImage, ...images];
    }
    return product.images;
  })();

  // 유효한 이미지들만 필터링 (재정렬된 배열 기준)
  const validImages = reorderedImages.filter((_, index) => !imageErrors[index]);
  const currentImageSrc = validImages[selectedImageIndex] || reorderedImages[0] || '/placeholder-image.svg';

  // 컴포넌트 마운트 시 대표 이미지가 첫 번째로 보이도록 설정
  useEffect(() => {
    setSelectedImageIndex(0); // 대표 이미지를 첫 번째로 재정렬했으므로 0번 인덱스
  }, [product.id]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'size' | 'review' | 'qna'>('detail');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [actualReviewStats, setActualReviewStats] = useState<{ reviewCount: number; rating: number } | null>(null);

  // 찜 상태 확인
  const isWishlisted = user?.uid ? isInWishlist(product.id) : false;

  // 컴포넌트 마운트 시 상품 정보와 연관 상품 로드
  useEffect(() => {
    if (product.id) {
      // 관련 상품 로드
      loadRelatedProducts(product.id, 4);
      
      // 최근 본 상품에 추가 (로그인한 사용자만)
      if (user?.uid) {
        addRecentProduct(product.id);
      }

      // 실제 리뷰 통계 가져오기
      const fetchReviewStats = async () => {
        try {
          const stats = await getProductReviewStats(product.id);
          setActualReviewStats(stats);
        } catch (error) {
          console.error('리뷰 통계 조회 실패:', error);
        }
      };

      fetchReviewStats();
    }
  }, [product.id, loadRelatedProducts, addRecentProduct, user?.uid]);

  const handleAddToCart = async () => {
    // 로그인 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    // 옵션 선택 확인 (사이즈나 색상이 있는 경우에만)
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;
    
    if (hasSizes && !selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
    
    if (hasColors && !selectedColor) {
      alert('색상을 선택해주세요.');
      return;
    }

    // 재고 확인
    if (!inStock || quantity > product.stock) {
      alert('재고가 부족합니다.');
      return;
    }

    setIsAddingToCart(true);

    try {
      await addToCartMutation.mutateAsync({
        userId: user.uid,
        product,
        request: {
          productId: product.id,
          size: selectedSize || '', // 사이즈가 없으면 빈 문자열
          color: selectedColor || '', // 색상이 없으면 빈 문자열
          quantity
        }
      });

      alert('장바구니에 추가되었습니다.');
      
      // 장바구니 페이지로 이동할지 물어보기
      const goToCart = confirm('장바구니로 이동하시겠습니까?');
      if (goToCart) {
        router.push('/orders/cart');
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    // 로그인 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    // 옵션 선택 확인 (사이즈나 색상이 있는 경우에만)
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;
    
    if (hasSizes && !selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
    
    if (hasColors && !selectedColor) {
      alert('색상을 선택해주세요.');
      return;
    }

    // 재고 확인
    if (!inStock || quantity > product.stock) {
      alert('재고가 부족합니다.');
      return;
    }

    // 주문 데이터 생성
    const orderData = {
      items: [{
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        brand: product.brand,
        size: selectedSize || '', // 사이즈가 없으면 빈 문자열
        color: selectedColor || '', // 색상이 없으면 빈 문자열
        quantity,
        price: displayPrice,
        discountAmount: product.saleRate ? 
          Math.floor(product.price * (product.saleRate / 100)) : 0
      }],
      subtotal: displayPrice * quantity,
      couponDiscount: 0,
      deliveryFee: displayPrice * quantity >= 50000 ? 0 : 3000, // 5만원 이상 무료배송
      finalAmount: (displayPrice * quantity) + (displayPrice * quantity >= 50000 ? 0 : 3000),
      selectedCoupon: '',
      deliveryOption: 'standard'
    };

    // 세션 스토리지에 주문 데이터 저장
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    
    // 주문서 작성 페이지로 이동
    router.push('/orders/checkout');
  };

  // 찜하기 토글
  const handleWishlistToggle = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    setIsWishlistLoading(true);
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        alert('찜 목록에서 제거되었습니다.');
      } else {
        await addToWishlist(product.id);
        alert('찜 목록에 추가되었습니다.');
      }
    } catch (error) {
      console.error('찜하기 토글 실패:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('찜하기 처리에 실패했습니다.');
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const displayPrice = product.saleRate ? 
    calculateDiscountPrice(product.price, product.saleRate) : 
    product.price;

  const inStock = isInStock(product);

  // 실제 리뷰 데이터가 있으면 우선 사용, 없으면 기본값 사용
  const displayRating = actualReviewStats?.rating || product.rating || 0;
  const displayReviewCount = actualReviewStats?.reviewCount ?? product.reviewCount ?? 0;

  return (
    <div className={styles.container}>
      {/* 상품 이미지 및 기본 정보 */}
      <div className={styles.productInfo}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {product.images && product.images.length > 0 ? (
              <img
                src={currentImageSrc}
                alt={product.name}
                className={styles.productImage}
                onError={() => handleImageError(selectedImageIndex)}
              />
            ) : (
              <div className={styles.noImage}>
                <span>이미지가 없습니다</span>
              </div>
            )}
          </div>
          <div className={styles.thumbnails}>
            {reorderedImages && reorderedImages.map((image, index) => (
              !imageErrors[index] && (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.active : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`} 
                    className={styles.thumbnailImage}
                    onError={() => handleImageError(index)}
                  />
                </button>
              )
            ))}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.brand}>{product.brand}</div>
          <h1 className={styles.productName}>{product.name}</h1>
          
          <div className={styles.rating}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < Math.floor(displayRating) ? styles.filled : styles.empty}>
                  ★
                </span>
              ))}
            </div>
            <span className={styles.ratingText}>
              {displayRating} ({displayReviewCount}개 리뷰)
            </span>
          </div>

          <div className={styles.tags}>
            {(product.tags || []).map((tag, index) => (
              <span key={index} className={styles.tag}>{tag}</span>
            ))}
          </div>

          <div className={styles.priceSection}>
            {product.originalPrice && product.originalPrice > displayPrice && (
              <div className={styles.originalPrice}>
                {product.originalPrice.toLocaleString()}원
              </div>
            )}
            <div className={styles.currentPrice}>
              {displayPrice.toLocaleString()}원
              {product.saleRate && (
                <span className={styles.saleRate}>{product.saleRate}%</span>
              )}
            </div>
          </div>

          {/* 재고 상태 */}
          <div className={styles.stockInfo}>
            {inStock ? (
              <span className={styles.inStock}>재고 있음 ({product.stock}개)</span>
            ) : (
              <span className={styles.outOfStock}>품절</span>
            )}
          </div>

          {/* 옵션 선택 */}
          <div className={styles.options}>
            {/* 사이즈 선택 - 사이즈가 있을 때만 표시 */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>사이즈</label>
                <div className={styles.sizeOptions}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeButton} ${selectedSize === size ? styles.selected : ''}`}
                      onClick={() => setSelectedSize(size)}
                      disabled={!inStock}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 색상 선택 - 색상이 있을 때만 표시 */}
            {product.colors && product.colors.length > 0 && (
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>색상</label>
                <div className={styles.colorOptions}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`${styles.colorButton} ${selectedColor === color ? styles.selected : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      disabled={!inStock}
                      style={{ backgroundColor: getColorValue(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>수량</label>
              <div className={styles.quantitySelector}>
                <button
                  className={styles.quantityButton}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!inStock}
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  className={styles.quantityButton}
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={!inStock}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 구매 버튼 */}
          <div className={styles.actions}>
            <button
              className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`}
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              title={isWishlisted ? '찜 해제' : '찜하기'}
            >
              {isWishlisted ? '찜 해제' : '찜하기'}
            </button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleAddToCart}
              className={styles.cartButton}
              disabled={!inStock || isAddingToCart}
            >
              {isAddingToCart ? '추가 중...' : '장바구니'}
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleBuyNow}
              className={styles.buyButton}
              disabled={!inStock}
            >
              {inStock ? '바로구매' : '품절'}
            </Button>
          </div>

          {/* 상품 정보 요약 */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>배송</span>
              <span className={styles.summaryValue}>무료배송</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>반품</span>
              <span className={styles.summaryValue}>무료반품 (7일)</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>재고</span>
              <span className={styles.summaryValue}>
                {inStock ? `${product.stock}개` : '품절'}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>SKU</span>
              <span className={styles.summaryValue}>{product.sku}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 연관 상품 */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedProducts}>
          <h2 className={styles.sectionTitle}>관련 상품</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(relatedProduct => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                name={relatedProduct.name}
                brand={relatedProduct.brand}
                price={relatedProduct.price}
                originalPrice={relatedProduct.originalPrice}
                isNew={relatedProduct.isNew}
                isSale={relatedProduct.isSale}
                saleRate={relatedProduct.saleRate}
                rating={relatedProduct.rating}
                reviewCount={relatedProduct.reviewCount}
                image={relatedProduct.mainImage || relatedProduct.images[0]} // 대표 이미지 우선 사용
                stock={relatedProduct.stock}
              />
            ))}
          </div>
        </div>
      )}

      {/* 상세 정보 탭 */}
      <div className={styles.detailTabs}>
        <div className={styles.tabHeaders}>
          <button
            className={`${styles.tabHeader} ${activeTab === 'detail' ? styles.active : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            상품상세
          </button>
          <button
            className={`${styles.tabHeader} ${activeTab === 'size' ? styles.active : ''}`}
            onClick={() => setActiveTab('size')}
          >
            사이즈 가이드
          </button>
          <button
            className={`${styles.tabHeader} ${activeTab === 'review' ? styles.active : ''}`}
            onClick={() => setActiveTab('review')}
          >
            리뷰 ({displayReviewCount})
          </button>
          <button
            className={`${styles.tabHeader} ${activeTab === 'qna' ? styles.active : ''}`}
            onClick={() => setActiveTab('qna')}
          >
            Q&A
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'detail' && (
            <div className={styles.detailContent}>
              <h3>상품 정보</h3>
              <p>{product.description}</p>
              
              <div className={styles.productDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>소재</span>
                  <span className={styles.detailValue}>{product.details?.material || '정보 없음'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>원산지</span>
                  <span className={styles.detailValue}>{product.details?.origin || '정보 없음'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>제조사</span>
                  <span className={styles.detailValue}>{product.details?.manufacturer || '정보 없음'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>취급주의사항</span>
                  <span className={styles.detailValue}>{product.details?.precautions || '정보 없음'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'size' && (
            <div className={styles.sizeGuide}>
              <h3>사이즈 가이드</h3>
              <div className={styles.sizeTable}>
                <table>
                  <thead>
                    <tr>
                      <th>사이즈</th>
                      {Object.values(product.details.sizes)[0] && Object.keys(Object.values(product.details.sizes)[0]).map(key => (
                        <th key={key}>
                          {key === 'chest' ? '가슴둘레' :
                           key === 'length' ? '총장' :
                           key === 'shoulder' ? '어깨너비' :
                           key === 'waist' ? '허리둘레' :
                           key === 'thigh' ? '허벅지둘레' :
                           key === 'width' ? '너비' :
                           key === 'height' ? '높이' : key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(product.details.sizes).map(([size, measurements]) => (
                      <tr key={size}>
                        <td>{size}</td>
                        {Object.entries(measurements).map(([key, value]) => (
                          <td key={key}>{value ? `${value}cm` : '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <ProductReviews productId={product.id} />
          )}

          {activeTab === 'qna' && (
            <div className={styles.qnaContent}>
              <h3>상품 Q&A</h3>
              <p>아직 등록된 문의가 없습니다.</p>
              <Button variant="primary">문의하기</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
