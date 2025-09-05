'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { CategoryOnlyProductService } from '@/shared/services/hybridProductService';
import { Product } from '@/shared/types/product';
import styles from './page.module.css';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function DynamicCategoryPage({ params }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState<string>('');

  // params 비동기 처리
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setCategory(resolvedParams.category);
    };
    loadParams();
  }, [params]);

  const sortOptions = [
    { value: 'popular', label: '인기순' },
    { value: 'newest', label: '최신순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' },
    { value: 'review', label: '리뷰 많은순' }
  ];

  // 카테고리명 매핑 - Firebase에서 가져오기
  const [categoryData, setCategoryData] = useState<{name: string, description: string} | null>(null);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!category) return;
      
      try {
        // Firebase에서 카테고리 정보 가져오기
        const categoryDoc = await getDocs(collection(db, 'categories'));
        const foundCategory = categoryDoc.docs.find(doc => doc.id === category);
        
        if (foundCategory) {
          const data = foundCategory.data();
          setCategoryData({
            name: data.name,
            description: data.description
          });
        } else {
          // 기본값 설정
          const defaultNames: Record<string, {name: string, description: string}> = {
            'clothing': {name: '의류', description: '트렌디하고 편안한 의류로 완성하는 나만의 스타일'},
            'accessories': {name: '액세서리', description: '포인트가 되는 액세서리로 스타일 완성'},
            'bags': {name: '가방', description: '실용성과 스타일을 겸비한 가방 컬렉션'},
            'bottoms': {name: '하의', description: '편안하고 스타일리시한 하의 컬렉션'},
            'shoes': {name: '신발', description: '편안하고 스타일리시한 신발로 완벽한 발걸음을'},
            'tops': {name: '상의', description: '다양한 스타일의 상의로 완성하는 코디'}
          };
          setCategoryData(defaultNames[category] || {name: category, description: '다양한 상품을 만나보세요'});
        }
      } catch (error) {
        console.error('카테고리 데이터 로드 실패:', error);
        setCategoryData({name: category, description: '다양한 상품을 만나보세요'});
      }
    };

    loadCategoryData();
  }, [category]);

  useEffect(() => {
    const loadProducts = async () => {
      // category가 설정되지 않았으면 대기
      if (!category) return;
      
      try {
        setLoading(true);
        setError(null);

        // 카테고리별 상품 조회 (중첩 컬렉션에서)
        const categoryProducts = await CategoryOnlyProductService.getProductsByCategory(category);
        
        // 정렬 적용
        const sortedProducts = await sortProducts(categoryProducts, sortBy);
        setProducts(sortedProducts);

      } catch (err) {
        console.error('카테고리 상품 로드 실패:', err);
        setError('상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, sortBy]);

  const sortProducts = async (productList: Product[], sortOption: string): Promise<Product[]> => {
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

  const handleSortChange = async (newSortBy: string) => {
    setSortBy(newSortBy);
    const sortedProducts = await sortProducts(products, newSortBy);
    setProducts(sortedProducts);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>
          <div className={styles.loadingSpinner}></div>
          <p>상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const categoryDisplayName = categoryData?.name || category;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>홈</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <Link href="/categories" className={styles.breadcrumbLink}>카테고리</Link>
        <span className={styles.breadcrumbSeparator}>{'>'}</span>
        <span className={styles.breadcrumbCurrent}>{categoryDisplayName}</span>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{categoryDisplayName}</h1>
        <p className={styles.subtitle}>
          {categoryData?.description || '다양한 상품을 만나보세요'}
        </p>
      </div>

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

      <div className={styles.resultsInfo}>
        <span className={styles.resultCount}>총 {products.length}개 상품</span>
        <span className={styles.categoryPath}>
          📁 categories/{category}/products/
        </span>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>해당 카테고리에 상품이 없습니다.</p>
          <Link href="/categories" className={styles.backButton}>
            다른 카테고리 보기
          </Link>
        </div>
      ) : (
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
                      {category === 'accessories' && '�'}
                      {category === 'bags' && '🎒'}
                      {category === 'bottoms' && '�'}
                      {category === 'shoes' && '👟'}
                      {category === 'tops' && '👕'}
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
                  <span className={styles.rating}>⭐ {product.rating}</span>
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
      )}

      <div className={styles.loadMoreSection}>
        <p className={styles.loadInfo}>
          ✅ 하이브리드 구조로 업데이트됨
        </p>
        <p className={styles.loadInfo}>
          🔄 categories/{category}/products/ 에서 로드됨
        </p>
      </div>
    </div>
  );
}
