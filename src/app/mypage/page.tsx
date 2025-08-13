'use client';

import React from 'react';
import { useAuth } from '@/context/authProvider';
import { useUserActivity } from '@/context/userActivityProvider';
import RecentProducts from './_components/RecentProducts';
import WishlistProducts from './_components/WishlistProducts';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyPage() {
  const { user } = useAuth();
  const { recentProducts, wishlistItems } = useUserActivity();

  if (!user) {
    return (
      <div className={styles.contentArea}>
        <div className={styles.notLoggedIn}>
          <div className={styles.loginPrompt}>
            <div className={styles.loginIcon}>👤</div>
            <h2>로그인이 필요합니다</h2>
            <p>마이페이지를 이용하려면 로그인해주세요.</p>
            <Link href="/auth/login" className={styles.loginButton}>
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* 대시보드 헤더 */}
      <div className={styles.dashboardHeader}>
        <h2>나의 쇼핑 현황</h2>
        <p>최근 활동과 찜한 상품을 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <h3>주문내역</h3>
            <p className={styles.statNumber}>0</p>
            <Link href="/mypage/order-list" className={styles.statLink}>
              자세히 보기 →
            </Link>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👀</div>
          <div className={styles.statInfo}>
            <h3>최근 본 상품</h3>
            <p className={styles.statNumber}>{recentProducts.length}</p>
            <Link href="/mypage/recently-viewed" className={styles.statLink}>
              자세히 보기 →
            </Link>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>❤️</div>
          <div className={styles.statInfo}>
            <h3>찜한 상품</h3>
            <p className={styles.statNumber}>{wishlistItems.length}</p>
            <Link href="/mypage/wishlist" className={styles.statLink}>
              자세히 보기 →
            </Link>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎁</div>
          <div className={styles.statInfo}>
            <h3>보유 쿠폰</h3>
            <p className={styles.statNumber}>0</p>
            <Link href="/mypage/coupons" className={styles.statLink}>
              자세히 보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* 최근 활동 섹션 */}
      <div className={styles.recentActivity}>
        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h3>최근 본 상품</h3>
            <Link href="/mypage/recently-viewed" className={styles.viewAllLink}>
              전체보기 →
            </Link>
          </div>
          <div className={styles.compactView}>
            <RecentProducts />
          </div>
        </div>
        
        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h3>찜한 상품</h3>
            <Link href="/mypage/wishlist" className={styles.viewAllLink}>
              전체보기 →
            </Link>
          </div>
          <div className={styles.compactView}>
            <WishlistProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
