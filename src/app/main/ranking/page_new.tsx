import PageHeader from "../../../components/common/PageHeader";
import styles from "./page.module.css";

export default function RankingPage() {
  const rankingProducts = Array.from({ length: 15 }, (_, i) => ({
    id: `rank-${i + 1}`,
    name: `인기 상품 ${i + 1}위`,
    brand: '인기브랜드',
    price: 59900 - (i * 3000),
    originalPrice: i < 5 ? 79900 - (i * 3000) : undefined,
    isNew: i < 2,
    isSale: i < 5,
    rating: 4.9 - (i * 0.05),
    reviewCount: 1000 - (i * 50),
    rank: i + 1,
    change: i < 3 ? 'up' : i < 8 ? 'down' : 'same',
    changeValue: i < 3 ? Math.floor(Math.random() * 3) + 1 : i < 8 ? Math.floor(Math.random() * 2) + 1 : 0
  }));

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '−';
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="랭킹" 
        description="지금 가장 인기있는 상품들"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '랭킹' }
        ]}
      />
      
      <div className={styles.content}>
        {/* 랭킹 히어로 섹션 */}
        <div className={styles.rankingHero}>
          <h2 className={styles.heroTitle}>🏆 실시간 랭킹</h2>
          <p className={styles.heroSubtitle}>지금 가장 HOT한 상품들</p>
          <p className={styles.heroDescription}>매시간 업데이트되는 실시간 인기 상품</p>
        </div>

        {/* 통계 섹션 */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>1위</div>
              <div className={styles.statLabel}>베스트 상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10,847</div>
              <div className={styles.statLabel}>총 판매량</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4.8</div>
              <div className={styles.statLabel}>평균 평점</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>매시간</div>
              <div className={styles.statLabel}>업데이트</div>
            </div>
          </div>
        </div>

        {/* 랭킹 필터 */}
        <div className={styles.filterSection}>
          <button className={`${styles.filterButton} ${styles.active}`}>전체</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>남성</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>여성</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>브랜드</button>
          <button className={`${styles.filterButton} ${styles.inactive}`}>신상품</button>
        </div>

        {/* 랭킹 상품 그리드 */}
        <div className={styles.rankingGrid}>
          {rankingProducts.map((product) => (
            <div key={product.id} className={styles.rankingCard}>
              <div className={styles.rankingHeader}>
                <div className={styles.rankNumber}>{product.rank}</div>
                <div className={`${styles.rankChange} ${styles[product.change]}`}>
                  {getChangeIcon(product.change)} {product.changeValue > 0 ? product.changeValue : ''}
                </div>
              </div>
              
              <div className={styles.productImage}></div>
              
              <div>
                <p className={styles.productBrand}>{product.brand}</p>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>{product.price.toLocaleString()}원</p>
                
                <div className={styles.productStats}>
                  <div className={styles.rating}>
                    ⭐ {product.rating.toFixed(1)} ({product.reviewCount})
                  </div>
                  <div className={styles.salesCount}>
                    {product.reviewCount * 2}개 판매
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className={styles.loadMoreSection}>
          <button className={styles.loadMoreButton}>
            더 많은 랭킹 보기 (TOP 50까지)
          </button>
        </div>
      </div>
    </div>
  );
}
