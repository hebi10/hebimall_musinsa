'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/shared/types/product';
import { useProduct } from '@/context/productProvider';
import { useAuth } from '@/context/authProvider';
import { useAddToCart } from '@/shared/hooks/useCart';
import Button from '@/app/_components/Button';
import ProductCard from './ProductCard';
// import ProductReviews from '@/features/product/components/ProductReviews';
import styles from './ProductDetail.module.css';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    relatedProducts, 
    getProductById, 
    loadRelatedProducts,
    calculateDiscountPrice, 
    isInStock,
    loading 
  } = useProduct();

  const addToCartMutation = useAddToCart();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'size' | 'review' | 'qna'>('detail');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 컴포넌트 마운트 시 상품 정보와 연관 상품 로드
  useEffect(() => {
    if (product.id) {
      // 관련 상품 로드
      loadRelatedProducts(product.id, 4);
    }
  }, [product.id, loadRelatedProducts]);

  const handleAddToCart = async () => {
    // 로그인 확인
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }

    // 옵션 선택 확인
    if (!selectedSize || !selectedColor) {
      alert('사이즈와 색상을 선택해주세요.');
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
          size: selectedSize,
          color: selectedColor,
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

    // 옵션 선택 확인
    if (!selectedSize || !selectedColor) {
      alert('사이즈와 색상을 선택해주세요.');
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
        size: selectedSize,
        color: selectedColor,
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

  const displayPrice = product.saleRate ? 
    calculateDiscountPrice(product.price, product.saleRate) : 
    product.price;

  const inStock = isInStock(product);

  return (
    <div className={styles.container}>
      {/* 상품 이미지 및 기본 정보 */}
      <div className={styles.productInfo}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              width={500}
              height={600}
              priority
            />
          </div>
          <div className={styles.thumbnails}>
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.active : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image src={image} alt={`${product.name} ${index + 1}`} width={80} height={80} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.brand}>{product.brand}</div>
          <h1 className={styles.productName}>{product.name}</h1>
          
          <div className={styles.rating}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? styles.filled : styles.empty}>
                  ★
                </span>
              ))}
            </div>
            <span className={styles.ratingText}>
              {product.rating} ({product.reviewCount}개 리뷰)
            </span>
          </div>

          <div className={styles.tags}>
            {product.tags.map((tag, index) => (
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
              <span className={styles.inStock}>✓ 재고 있음 ({product.stock}개)</span>
            ) : (
              <span className={styles.outOfStock}>✗ 품절</span>
            )}
          </div>

          {/* 옵션 선택 */}
          <div className={styles.options}>
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

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>색상</label>
              <div className={styles.colorOptions}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`${styles.colorButton} ${selectedColor === color ? styles.selected : ''} ${styles[color]}`}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    disabled={!inStock}
                  />
                ))}
              </div>
            </div>

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
                image={relatedProduct.images[0]}
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
            리뷰 ({product.reviewCount})
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
                  <span className={styles.detailValue}>{product.details.material}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>원산지</span>
                  <span className={styles.detailValue}>{product.details.origin}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>제조사</span>
                  <span className={styles.detailValue}>{product.details.manufacturer}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>취급주의사항</span>
                  <span className={styles.detailValue}>{product.details.precautions}</span>
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
            <div className={styles.reviewsContent}>
              <h3>상품 리뷰</h3>
              <div className={styles.reviewSummary}>
                <div className={styles.ratingOverview}>
                  <span className={styles.avgRating}>{product.rating}</span>
                  <div className={styles.stars}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? styles.filled : styles.empty}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className={styles.reviewCount}>총 {product.reviewCount}개 리뷰</span>
                </div>
              </div>
              <p>리뷰 컴포넌트는 추후 구현 예정입니다.</p>
            </div>
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
