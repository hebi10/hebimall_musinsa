'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/src/types/product';
import Button from '@/src/components/common/Button';
import ProductReviews from '@/src/components/product/ProductReviews';
import styles from './ProductDetail.module.css';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'detail' | 'size' | 'review' | 'qna'>('detail');

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('사이즈와 색상을 선택해주세요.');
      return;
    }
    // 장바구니 추가 로직
    alert('장바구니에 추가되었습니다.');
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert('사이즈와 색상을 선택해주세요.');
      return;
    }
    // 즉시 구매 로직
    alert('주문 페이지로 이동합니다.');
  };

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
            {product.originalPrice && (
              <div className={styles.originalPrice}>
                {product.originalPrice.toLocaleString()}원
              </div>
            )}
            <div className={styles.currentPrice}>
              {product.price.toLocaleString()}원
              {product.saleRate && (
                <span className={styles.saleRate}>{product.saleRate}%</span>
              )}
            </div>
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
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  className={styles.quantityButton}
                  onClick={() => setQuantity(quantity + 1)}
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
            >
              장바구니
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleBuyNow}
              className={styles.buyButton}
            >
              바로구매
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
              <span className={styles.summaryValue}>{product.stock}개</span>
            </div>
          </div>
        </div>
      </div>

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
                           key === 'thigh' ? '허벅지둘레' : key}
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
