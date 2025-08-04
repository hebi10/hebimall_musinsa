import { ReactNode } from 'react';
import Link from 'next/link';
import styles from './layout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={styles.adminContainer}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navItem}>
            <span>📊</span>
            대시보드
          </Link>
          <Link href="/admin/users" className={styles.navItem}>
            <span>👥</span>
            사용자 관리
          </Link>
          <Link href="/admin/products" className={styles.navItem}>
            <span>📦</span>
            상품 관리
          </Link>
          <Link href="/admin/orders" className={styles.navItem}>
            <span>📋</span>
            주문 관리
          </Link>
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1>관리자 패널</h1>
          <div className={styles.userInfo}>
            <span>관리자님 환영합니다</span>
            <button className={styles.logoutBtn}>로그아웃</button>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
