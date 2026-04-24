import Image from "next/image";
import Link from "next/link";
import MainBanner from "./_components/MainBanner";
import ProductSection from "./_components/ProductSection";
import DynamicCategorySection from "./_components/DynamicCategorySection";
import FeaturedProducts from "./_components/FeaturedProducts";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <MainBanner />

      <section className={styles.moodSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.storyIntro}>
            <div>
              <span className={styles.eyebrow}>카테고리 셀렉션</span>
              <h2 className={styles.storyTitle}>무드에 맞춰 먼저 둘러보세요.</h2>
            </div>
            <p className={styles.storyDescription}>
              카테고리 이름보다 분위기와 스타일을 먼저 보고, 원하는 상품군으로
              자연스럽게 이동할 수 있도록 구성했습니다.
            </p>
          </div>

          <DynamicCategorySection
            maxCategories={4}
            className={styles.categoryMoodGrid}
          />
        </div>
      </section>

      <FeaturedProducts
        eyebrow="추천 셀렉션"
        title="이번 주 추천 상품"
        subtitle="메인에서 먼저 둘러보는 편집 셀렉션"
        description="실루엣, 컬러, 활용도가 좋은 상품만 골라 메인에서 먼저 보여주는 큐레이션입니다."
        sectionClassName={styles.featuredSection}
        viewAllLabel="전체 보기"
      />

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
            <span className={styles.promoVisualBadge}>한정 셀렉션</span>
          </div>

          <div className={styles.promoCopy}>
            <span className={styles.promoEyebrow}>미드 시즌 셀렉션</span>
            <h2 className={styles.promoTitle}>차분한 톤에 힘을 실은 간절기 셀렉션</h2>
            <p className={styles.promoDescription}>
              가볍게 걸치는 아우터와 매일 들기 좋은 가방, 시즌감이 살아 있는
              상품만 골라 하나의 기획 구간으로 묶었습니다.
            </p>
          </div>

          <div className={styles.promoMeta}>
            <p className={styles.promoNote}>선별 상품 최대 30% 할인</p>
            <p className={styles.promoList}>
              간절기 아우터
              <span className={styles.promoDivider}>/</span>
              데일리 백
              <span className={styles.promoDivider}>/</span>
              한정 수량
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
          subtitle="천천히 훑어볼수록 좋은 이번 주 업데이트"
          description="정적인 그리드보다 실제 매대를 둘러보는 느낌이 들도록 가로 레일 방식으로 구성했습니다."
          eyebrow="신상품"
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
          subtitle="이번 주 고객 반응이 가장 빠른 상품입니다."
          eyebrow="베스트 8"
          type="bestseller"
          maxItems={8}
          variant="ranking"
          headerStyle="bordered"
          viewAllLink="/products?sort=bestseller"
          viewAllLabel="랭킹 보기"
        />
      </section>

      <section id="about" className={styles.seasonNote}>
        <div className={styles.sectionContainer}>
          <div className={styles.seasonInner}>
            <div className={styles.seasonHeading}>
              <span className={styles.eyebrow}>브랜드 노트</span>
              <h2 className={styles.seasonTitle}>
                매일 입는 옷을 더 차분하게 고르는 방식
              </h2>
            </div>

            <div className={styles.seasonBody}>
              <p className={styles.seasonDescription}>
                STYNA는 메인에서부터 차분한 패션 무드가 느껴지도록 뉴트럴한
                질감, 더 선명한 간격감, 그리고 천천히 둘러보게 되는 리듬으로
                화면을 정리하고 있습니다.
              </p>
              <div className={styles.seasonActions}>
                <Link href="/recommend" className={styles.primaryLink}>
                  추천 셀렉션 보기
                </Link>
                <Link href="/events" className={styles.secondaryLink}>
                  기획전 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
