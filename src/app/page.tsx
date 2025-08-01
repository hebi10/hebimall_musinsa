import Link from "next/link";
import Button from "../components/common/Button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 메인 배너 */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>
            HEBIMALL
          </h1>
          <p className={styles.bannerSubtitle}>
            최신 패션 트렌드를 만나보세요
          </p>
          <Link href="/main/recommend">
            <Button size="lg">
              쇼핑하러 가기
            </Button>
          </Link>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>인기 카테고리</h2>
        <p className={styles.sectionSubtitle}>다양한 스타일을 만나보세요</p>
        <div className={styles.categoryGrid}>
          <Link href="/category/tops" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👕</div>
            <span className={styles.categoryLabel}>상의</span>
          </Link>
          <Link href="/category/bottoms" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👖</div>
            <span className={styles.categoryLabel}>하의</span>
          </Link>
          <Link href="/category/shoes" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👟</div>
            <span className={styles.categoryLabel}>신발</span>
          </Link>
          <Link href="/category/accessories" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👜</div>
            <span className={styles.categoryLabel}>액세서리</span>
          </Link>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className={styles.section}>
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50K+</div>
              <div className={styles.statLabel}>누적 고객</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>1,000+</div>
              <div className={styles.statLabel}>상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4.8</div>
              <div className={styles.statLabel}>평균 평점</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>99%</div>
              <div className={styles.statLabel}>만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* 추천 상품 섹션 */}
      <section className={styles.productsSection}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>추천 상품</h2>
            <Link href="/main/recommend" className={styles.moreLink}>
              더보기 →
            </Link>
          </div>
          <div className={styles.productGrid}>
            {/* 예시 상품 카드들 */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={styles.productCard}>
                <div className={styles.productImage}></div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>상품명 {item}</h3>
                  <p className={styles.productBrand}>브랜드명</p>
                  <p className={styles.productPrice}>29,900원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
