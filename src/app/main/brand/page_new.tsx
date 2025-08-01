import Link from "next/link";
import PageHeader from "../../../components/common/PageHeader";
import styles from "./page.module.css";

export default function BrandPage() {
  const popularBrands = [
    { name: 'NIKE', logo: '👟', products: 156, description: '스포츠 브랜드', rating: 4.8 },
    { name: 'ADIDAS', logo: '⚡', products: 134, description: '스포츠웨어', rating: 4.7 },
    { name: 'UNIQLO', logo: '👕', products: 298, description: '베이직 의류', rating: 4.6 },
    { name: 'ZARA', logo: '✨', products: 189, description: '패스트 패션', rating: 4.5 },
    { name: 'H&M', logo: '🔥', products: 267, description: '트렌디 패션', rating: 4.4 },
    { name: 'MUJI', logo: '🌿', products: 89, description: '미니멀 라이프', rating: 4.7 },
    { name: 'SUPREME', logo: '🔴', products: 67, description: '스트릿 패션', rating: 4.9 },
    { name: 'KENZO', logo: '🐅', products: 45, description: '럭셔리 브랜드', rating: 4.6 },
  ];

  const featuredBrands = [
    { name: 'NIKE', logo: 'N', description: '스포츠의 정수' },
    { name: 'ADIDAS', logo: 'A', description: '3 스트라이프' },
    { name: 'SUPREME', logo: 'S', description: '스트릿의 왕' },
  ];

  const brandCategories = [
    { name: '스포츠/아웃도어', count: 45 },
    { name: '캐주얼', count: 123 },
    { name: '스트릿', count: 67 },
    { name: '럭셔리', count: 23 },
    { name: '빈티지', count: 34 },
    { name: '언더웨어', count: 28 },
  ];

  return (
    <div className={styles.container}>
      <PageHeader 
        title="브랜드" 
        description="다양한 브랜드의 상품을 만나보세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '브랜드' }
        ]}
      />
      
      <div className={styles.content}>
        {/* 브랜드 히어로 섹션 */}
        <div className={styles.brandHero}>
          <h2 className={styles.heroTitle}>🏢 브랜드 컬렉션</h2>
          <p className={styles.heroSubtitle}>전 세계 유명 브랜드와 함께</p>
          <p className={styles.heroDescription}>트렌드를 이끄는 브랜드들의 특별한 컬렉션</p>
        </div>

        {/* 통계 섹션 */}
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>280+</div>
              <div className={styles.statLabel}>브랜드</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50,000+</div>
              <div className={styles.statLabel}>상품</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4.7</div>
              <div className={styles.statLabel}>평균 평점</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>매일</div>
              <div className={styles.statLabel}>신상품</div>
            </div>
          </div>
        </div>

        {/* 피처드 브랜드 섹션 */}
        <div className={styles.featuredSection}>
          <h3 className={styles.featuredTitle}>🌟 주목할 만한 브랜드</h3>
          <div className={styles.featuredGrid}>
            {featuredBrands.map((brand) => (
              <div key={brand.name} className={styles.featuredBrand}>
                <div className={styles.featuredLogo}>{brand.logo}</div>
                <div className={styles.featuredInfo}>
                  <div className={styles.featuredName}>{brand.name}</div>
                  <div className={styles.featuredDesc}>{brand.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 브랜드 카테고리 필터 */}
        <div className={styles.filterSection}>
          <button className={`${styles.filterButton} ${styles.active}`}>전체</button>
          {brandCategories.map((category) => (
            <button
              key={category.name}
              className={`${styles.filterButton} ${styles.inactive}`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* 브랜드 그리드 */}
        <div className={styles.brandGrid}>
          {popularBrands.map((brand) => (
            <Link key={brand.name} href={`/brand/${brand.name.toLowerCase()}`}>
              <div className={styles.brandCard}>
                <div className={styles.brandLogo}>{brand.logo}</div>
                <div className={styles.brandInfo}>
                  <h3 className={styles.brandName}>{brand.name}</h3>
                  <p className={styles.brandCategory}>{brand.description}</p>
                  <div className={styles.brandStats}>
                    <div className={styles.productCount}>{brand.products}개 상품</div>
                    <div className={styles.brandRating}>
                      ⭐ {brand.rating}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className={styles.loadMoreSection}>
          <button className={styles.loadMoreButton}>
            더 많은 브랜드 보기 (280개 브랜드)
          </button>
        </div>
      </div>
    </div>
  );
}
