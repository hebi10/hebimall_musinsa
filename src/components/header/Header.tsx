import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          {/* 로고 */}
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              HEBIMALL
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className={styles.nav}>
            <div className={styles.navList}>
              <Link href="/main/recommend" className={styles.navLink}>
                추천
              </Link>
              <Link href="/main/ranking" className={styles.navLink}>
                랭킹
              </Link>
              <Link href="/main/sale" className={styles.navLink}>
                세일
              </Link>
              <Link href="/main/brand" className={styles.navLink}>
                브랜드
              </Link>
            </div>
          </nav>

          {/* 사용자 메뉴 */}
          <div className={styles.userMenu}>
            <Link href="/search" className={styles.userLink}>
              검색
            </Link>
            <Link href="/orders/cart" className={styles.userLink}>
              장바구니
            </Link>
            <Link href="/mypage" className={styles.userLink}>
              마이페이지
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
