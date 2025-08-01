import PageHeader from "../../../components/common/PageHeader";
import ProductCard from "../../../components/common/ProductCard";
import styles from "./page.module.css";

export default function SalePage() {
  const saleProducts = Array.from({ length: 16 }, (_, i) => ({
    id: `sale-${i + 1}`,
    name: `세일 상품 ${i + 1}`,
    brand: '세일브랜드',
    price: 19900 + (i * 8000),
    originalPrice: 39900 + (i * 8000),
    isSale: true,
    rating: 4.3 + (i * 0.02),
    reviewCount: 89 + i * 15,
  }));

  return (
    <div className={styles.container}>
      <PageHeader 
        title="세일" 
        description="최대 70% 할인 특가 상품"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '세일' }
        ]}
      />
      
      <div className={styles.content}>
        {/* 세일 히어로 섹션 */}
        <div className={styles.saleHero}>
          <h2 className={styles.heroTitle}>🔥 특가 세일</h2>
          <p className={styles.heroSubtitle}>지금 놓치면 후회할 할인가!</p>
          <div className={styles.heroDiscount}>최대 70% OFF</div>
          <p className={styles.heroDescription}>무료배송 + 추가 적립 혜택</p>
        </div>

        {/* 통계 섹션 */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>2,847</div>
              <div className={styles.statLabel}>세일 상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>70%</div>
              <div className={styles.statLabel}>최대 할인</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24시간</div>
              <div className={styles.statLabel}>남은 시간</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>무료</div>
              <div className={styles.statLabel}>배송비</div>
            </div>
          </div>
        </div>

        {/* 할인율 필터 */}
        <div className={styles.filterSection}>
          <button className={`${styles.filterButton} ${styles.active}`}>전체</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>30% 이상</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>50% 이상</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>70% 이상</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>마감임박</button>
        </div>

        {/* 세일 상품 그리드 */}
        <div className={styles.productGrid}>
          {saleProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className={styles.loadMoreSection}>
          <button className={styles.loadMoreButton}>
            더 많은 세일 상품 보기 ({saleProducts.length}개 더)
          </button>
        </div>
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
            더 많은 세일 상품 보기
          </button>
        </div>
      </div>
    </div>
  );
}
