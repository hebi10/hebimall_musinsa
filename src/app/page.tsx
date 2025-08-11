import Link from "next/link";
import Button from "./_components/Button";
import ProductSection from "./_components/ProductSection";
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
          <Link href="/products">
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
          <Link href="/products?category=상의" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👕</div>
            <span className={styles.categoryLabel}>상의</span>
          </Link>
          <Link href="/products?category=하의" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👖</div>
            <span className={styles.categoryLabel}>하의</span>
          </Link>
          <Link href="/products?category=신발" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👟</div>
            <span className={styles.categoryLabel}>신발</span>
          </Link>
          <Link href="/products?category=액세서리" className={styles.categoryCard}>
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

      {/* 상품 섹션들 */}
      <ProductSection 
        title="추천 상품" 
        type="recommended" 
      />
      
      <ProductSection 
        title="신상품" 
        type="new" 
      />
      
      <ProductSection 
        title="세일 상품" 
        type="sale" 
      />
      
      <ProductSection 
        title="베스트셀러" 
        type="bestseller" 
      />
    </div>
  );
}
