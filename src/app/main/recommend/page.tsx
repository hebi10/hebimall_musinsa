import PageHeader from "../../../components/common/PageHeader";
import ProductCard from "../../../components/common/ProductCard";
import styles from "./page.module.css";

export default function RecommendPage() {
  // 임시 데이터
  const recommendedProducts = Array.from({ length: 12 }, (_, i) => ({
    id: `rec-${i + 1}`,
    name: `추천 상품 ${i + 1}`,
    brand: '브랜드명',
    price: 29900 + (i * 10000),
    originalPrice: i % 2 === 0 ? 39900 + (i * 10000) : undefined,
    isNew: i < 3,
    isSale: i % 2 === 0,
    rating: 4.5,
    reviewCount: 128 + i * 20,
  }));

  return (
    <div className={styles.container}>
      <PageHeader 
        title="추천" 
        description="당신을 위한 맞춤 상품"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '추천' }
        ]}
      />
      
      <div className={styles.content}>
        {/* 통계 섹션 */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>1,234</div>
              <div className={styles.statLabel}>추천 상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>만족도</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4.8</div>
              <div className={styles.statLabel}>평균 평점</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24시간</div>
              <div className={styles.statLabel}>업데이트</div>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className={styles.filterSection}>
          <button className={`${styles.filterButton} ${styles.active}`}>전체</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>상의</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>하의</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>신발</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>액세서리</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>아우터</button>
        </div>

        {/* 상품 그리드 */}
        <div className={styles.productGrid}>
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className={styles.loadMoreSection}>
          <button className={styles.loadMoreButton}>
            더 많은 상품 보기 ({recommendedProducts.length}개 더)
          </button>
        </div>
      </div>
    </div>
  );
}
