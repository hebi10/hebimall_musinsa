import Link from "next/link";
import MainBanner from "./_components/MainBanner";
import ProductSection from "./_components/ProductSection";
import DynamicCategorySection from "./_components/DynamicCategorySection";
import FeaturedProducts from "./_components/FeaturedProducts";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 메인 배너 */}
      <MainBanner />

      {/* 카테고리 */}
      <section className={styles.categorySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderLeft}>
            <h2 className={styles.sectionTitle}>카테고리</h2>
          </div>

          <DynamicCategorySection
            maxCategories={4}
            className={styles.categoryGrid}
          />
        </div>
      </section>

      {/* 추천 상품 */}
      <FeaturedProducts />

      {/* 신상품 */}
      <div className={styles.productSections}>
        <ProductSection
          title="신상품"
          subtitle="최근 등록된 상품"
          type="new"
          maxItems={4}
          viewAllLink="/products?sort=newest"
        />
      </div>

      {/* 세일 안내 */}
      <section className={styles.saleBanner}>
        <div className={styles.saleBannerContent}>
          <div className={styles.saleText}>
            <h3 className={styles.saleTitle}>시즌오프 할인 중</h3>
            <p className={styles.saleDescription}>지금 할인 중인 상품을 확인해보세요.</p>
          </div>
          <Link href="/main/sale" className={styles.saleButton}>
            할인 상품 보기
          </Link>
        </div>
      </section>

      {/* 베스트셀러 */}
      <div className={styles.productSections}>
        <ProductSection
          title="베스트셀러"
          subtitle="리뷰가 많은 인기 상품"
          type="bestseller"
          maxItems={8}
          variant="ranking"
          viewAllLink="/products?sort=bestseller"
        />
      </div>

      {/* 특가 상품 */}
      <div className={styles.productSections}>
        <ProductSection
          title="할인 상품"
          subtitle="지금 할인 중인 상품"
          type="sale"
          maxItems={4}
          variant="sale"
          viewAllLink="/main/sale"
        />
      </div>

      {/* 서비스 안내 */}
      <section className={styles.serviceInfo}>
        <div className={styles.sectionContainer}>
          <div className={styles.serviceGrid}>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceItemTitle}>배송 안내</h4>
              <p className={styles.serviceItemDesc}>
                평일 오후 2시 이전 주문 시 당일 발송됩니다.
                배송은 2~3일 정도 소요됩니다.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceItemTitle}>교환/반품</h4>
              <p className={styles.serviceItemDesc}>
                수령 후 7일 이내 접수 가능합니다.
                상품 하자 시 반품 배송비는 무료입니다.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceItemTitle}>고객 문의</h4>
              <p className={styles.serviceItemDesc}>
                1:1 문의 또는 채팅 상담을 이용해주세요.
                평일 10:00~18:00 운영합니다.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceItemTitle}>주문 조회</h4>
              <p className={styles.serviceItemDesc}>
                <Link href="/mypage/order-list" className={styles.serviceLink}>마이페이지</Link>에서
                주문 상태와 배송 현황을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
