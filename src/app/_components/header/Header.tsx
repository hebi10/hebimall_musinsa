'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useAuth } from '@/context/authProvider';

export default function Header() {
  const { user, isAdmin } = useAuth();

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
              <Link href="/products" className={styles.navLink}>
                전체상품
              </Link>
              <Link href="/recommend" className={styles.navLink}>
                추천
              </Link>
              <Link href="/events" className={styles.navLink}>
                이벤트
              </Link>
              <Link href="/reviews" className={styles.navLink}>
                리뷰
              </Link>
              <Link href="/main/sale" className={styles.navLink}>
                세일
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
            {user && (
              <Link href="/mypage" className={styles.userLink}>마이페이지</Link>
            )}
            {!user && (
              <Link href="/auth/login" className={styles.userLink}>로그인</Link>
            )}
            {isAdmin && (
              <Link href="/admin" className={styles.userLink}>Admin</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
