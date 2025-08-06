import PageHeader from "@/shared/components/PageHeader";
import ProductCard from "@/shared/components/ProductCard";
import styles from "./page.module.css";
import { mockProducts } from "@/mocks/products";

export default function RecommendPage() {
  const recommendedProducts = mockProducts;

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
