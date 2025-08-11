'use client';

import { ReactNode } from 'react';
import styles from './layout.module.css';
import AdminNav from './_components/adminNav';
import { useAuth } from '@/context/authProvider';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className={styles.adminContainer}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Admin Panel</h2>
        </div>
        <AdminNav />
      </aside>

      {/* 메인 컨텐츠 */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1>관리자 패널</h1>
          <div className={styles.userInfo}>
            <span>관리자님 환영합니다</span>
            <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
