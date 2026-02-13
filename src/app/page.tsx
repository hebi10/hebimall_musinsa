import Link from "next/link";
import MainBanner from "./_components/MainBanner";
import ProductSection from "./_components/ProductSection";
import DynamicCategorySection from "./_components/DynamicCategorySection";
import FeaturedProducts from "./_components/FeaturedProducts";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 메인 배너 슬라이드 */}
      <MainBanner />

      {/* 인기 카테고리 섹션 */}
      <section className={styles.categorySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>인기 카테고리</h2>
            <p className={styles.sectionSubtitle}>스타일별로 찾아보세요</p>
          </div>
          
          <DynamicCategorySection 
            maxCategories={4} 
            className={styles.categoryGrid}
          />
        </div>
      </section>

      {/* 추천 상품 섹션 */}
      <FeaturedProducts />

      {/* 특가 할인 배너 */}
      <section className={styles.promoBanner}>
        <div className={styles.promoBannerContent}>
          <div className={styles.promoText}>
            <span className={styles.promoLabel}>SPECIAL OFFER</span>
            <h3 className={styles.promoTitle}>지금 최대 70% 할인</h3>
            <p className={styles.promoDescription}>선착순 한정 특가! 놓치면 후회하는 기회</p>
          </div>
          <Link href="/main/sale" className={styles.promoButton}>
            특가 상품 보기
          </Link>
        </div>
      </section>

      {/* 상품 섹션들 */}
      <div className={styles.productSections}>
        <ProductSection 
          title="신상품" 
          type="new"
          maxItems={6}
        />
        
        <ProductSection 
          title="베스트셀러" 
          type="bestseller"
          maxItems={6}
        />
        
        <ProductSection 
          title="특가 상품" 
          type="sale"
          maxItems={6}
        />
      </div>

      {/* 브랜드 스토리 섹션 */}
      <section className={styles.brandStory}>
        <div className={styles.sectionContainer}>
          <div className={styles.brandContent}>
            <div className={styles.brandText}>
              <h2 className={styles.brandTitle}>STYNA</h2>
              <h3 className={styles.brandSubtitle}>당신만의 스타일을 찾아보세요</h3>
              <p className={styles.brandDescription}>
                최신 트렌드부터 클래식까지, 다양한 스타일의 상품을 만나보세요. 
                STYNA은 고객 한 분 한 분의 개성을 존중하며, 
                최고의 쇼핑 경험을 제공합니다.
              </p>
              <div className={styles.brandStats}>
                <div className={styles.brandStat}>
                  <span className={styles.brandStatNumber}>50K+</span>
                  <span className={styles.brandStatLabel}>만족한 고객</span>
                </div>
                <div className={styles.brandStat}>
                  <span className={styles.brandStatNumber}>4.8</span>
                  <span className={styles.brandStatLabel}>평균 평점</span>
                </div>
                <div className={styles.brandStat}>
                  <span className={styles.brandStatNumber}>24/7</span>
                  <span className={styles.brandStatLabel}>고객 지원</span>
                </div>
              </div>
            </div>
            <div className={styles.brandImage}>
              <div className={styles.brandImagePlaceholder}>
                <p className={styles.brandImageLogo}>STYNA</p>
                <p className={styles.brandImageSub}>Premium Fashion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links 섹션 */}
      <section className={styles.quickLinks}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>빠른 서비스</h2>
            <p className={styles.sectionSubtitle}>자주 찾는 서비스를 빠르게 이용하세요</p>
          </div>
          
          <div className={styles.quickLinksGrid}>
            <Link href="/mypage/order-list" className={styles.quickLinkCard}>
              <h4 className={styles.quickLinkTitle}>주문/배송 조회</h4>
              <p className={styles.quickLinkDescription}>주문 상태와 배송 정보를 확인하세요</p>
            </Link>
            
            <Link href="/mypage/wishlist" className={styles.quickLinkCard}>
              <h4 className={styles.quickLinkTitle}>위시리스트</h4>
              <p className={styles.quickLinkDescription}>관심 있는 상품을 저장해보세요</p>
            </Link>
            
            <Link href="/cs/inquiry" className={styles.quickLinkCard}>
              <h4 className={styles.quickLinkTitle}>1:1 문의</h4>
              <p className={styles.quickLinkDescription}>궁금한 점을 언제든 문의하세요</p>
            </Link>
            
            <Link href="/events" className={styles.quickLinkCard}>
              <h4 className={styles.quickLinkTitle}>이벤트</h4>
              <p className={styles.quickLinkDescription}>진행 중인 다양한 이벤트를 확인하세요</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
