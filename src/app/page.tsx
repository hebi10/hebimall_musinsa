import Image from "next/image";
import Link from "next/link";
import MainBanner from "./_components/MainBanner";
import ProductSection from "./_components/ProductSection";
import DynamicCategorySection from "./_components/DynamicCategorySection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <MainBanner />

      <section className={styles.moodSection}>
        <div className={styles.sectionContainer}>
          <div className={[styles.storyIntro, styles.storyIntroCompact].join(" ")}>
            <div>
              <h2 className={styles.storyTitle}>많이 찾는 카테고리</h2>
              <p className={styles.storyDescription}>
                상의부터 신발까지, 자주 보는 스타일을 빠르게 둘러보세요.
              </p>
            </div>
          </div>

          <DynamicCategorySection
            maxCategories={4}
            className={styles.categoryMoodGrid}
          />
        </div>
      </section>

      <section id="md-picks" className={styles.featuredSection}>
        <ProductSection
          className={styles.bandSection}
          title="MD 추천 상품"
          subtitle="데일리로 입기 좋은 상품을 먼저 골라두었습니다."
          type="recommended"
          maxItems={8}
          headerStyle="display"
          viewAllLink="/recommend"
          viewAllLabel="추천 상품 전체 보기"
        />
      </section>

      <section className={styles.promoBand}>
        <div className={styles.promoInner}>
          <div className={styles.promoVisual}>
            <Image
              src="/main/mid_season_selection_v1.png"
              alt="Mid-season selection"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className={styles.promoImage}
            />
          </div>

          <div className={[styles.promoCopy, styles.promoCopyCompact].join(" ")}>
            <span className={styles.promoVisualBadge}>Season sale</span>
            <h2 className={styles.promoTitle}>간절기 아우터와 데일리 백</h2>
            <p className={styles.promoList}>
              선별 상품 최대 30% 할인. 매일 입기 좋은 기본 아이템 중심으로 정리했습니다.
            </p>
            <Link href="/main/sale" className={styles.promoButton}>
              세일 보러가기
            </Link>
          </div>
        </div>
      </section>

      <section id="new-arrivals" className={styles.newBand}>
        <ProductSection
          className={styles.bandSection}
          title="신상품"
          type="new"
          maxItems={8}
          variant="scroll"
          headerStyle="display"
          viewAllLink="/products?sort=newest"
          viewAllLabel="신상품 전체 보기"
        />
      </section>

      <section id="best-ranking" className={styles.rankingBand}>
        <ProductSection
          className={styles.bandSection}
          title="베스트 랭킹"
          subtitle="베스트셀러 상위 8개 상품"
          type="bestseller"
          maxItems={8}
          variant="ranking"
          headerStyle="bordered"
          showViewAllButton={false}
        />
      </section>
    </div>
  );
}
