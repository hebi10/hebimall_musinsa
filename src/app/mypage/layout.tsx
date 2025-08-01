"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../components/common/PageHeader";
import styles from "./layout.module.css";
import { useParams, usePathname } from "next/navigation";

interface MyPageLayoutProps {
  children: React.ReactNode;
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const [activeTab, setActiveTab] = useState('orders');
  const pathname = usePathname();

  const userInfo = {
    name: "김철수",
    email: "kimcs@example.com",
    membershipLevel: "VIP",
    orders: 15,
    reviews: 8,
    points: 12500,
    coupons: 3
  };

  const quickActions = [
    { icon: "📦", title: "주문내역", desc: "주문 현황 확인", href: "/mypage/order-list" },
    { icon: "⭐", title: "문의관리", desc: "작성한 문의", href: "/mypage/qa" },
    { icon: "🎁", title: "쿠폰함", desc: "사용 가능 쿠폰", href: "/mypage/coupons" },
    { icon: "👤", title: "회원정보", desc: "정보 수정", href: "/mypage/info-edit" },
    { icon: "❤️", title: "최근본상품", desc: "최근 본 상품", href: "/mypage/recently-viewed" },
    { icon: "💰", title: "적립금", desc: "포인트 관리", href: "/mypage/point" }
  ];

  useEffect(() => {
    if (pathname.includes("/mypage/order-list")) {
      setActiveTab("orders");
    } else if (pathname.includes("/mypage/qa")) {
      setActiveTab("reviews");
    } else if (pathname.includes("/mypage/recently-viewed")) {
      setActiveTab("wishlist");
    } else if (pathname.includes("/mypage/coupons")) {
      setActiveTab("coupons");
    } else if (pathname.includes("/mypage/point")) {
      setActiveTab("points");
    } else if (pathname.includes("/mypage/info-edit")) {
      setActiveTab("profile");
    } else if (pathname.includes("/mypage/counsel")) {
      setActiveTab("counsel");
    } else if (pathname.includes("/mypage/restock")) {
      setActiveTab("restock");
    }
  }, [pathname]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="마이페이지"
        description="나의 쇼핑 정보를 관리하세요"
        breadcrumb={[
          { label: '홈', href: '/' },
          { label: '마이페이지' }
        ]}
      />
      
      <div className={styles.content}>
        {/* 프로필 섹션 */}
        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {userInfo.name.charAt(0)}
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{userInfo.name}님</h2>
              <p className={styles.profileEmail}>{userInfo.email}</p>
              <span className={styles.membershipLevel}>{userInfo.membershipLevel} 회원</span>
            </div>
          </div>
          
          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{userInfo.orders}</div>
              <div className={styles.statLabel}>총 주문</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{userInfo.reviews}</div>
              <div className={styles.statLabel}>작성 리뷰</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{userInfo.points.toLocaleString()}</div>
              <div className={styles.statLabel}>적립금</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{userInfo.coupons}</div>
              <div className={styles.statLabel}>쿠폰</div>
            </div>
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className={styles.actionCard}>
              <div className={styles.actionIcon}>{action.icon}</div>
              <div className={styles.actionTitle}>{action.title}</div>
              <div className={styles.actionDesc}>{action.desc}</div>
            </Link>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div className={styles.mainContent}>
          {/* 사이드바 */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>마이메뉴</h3>
              <nav className={styles.sidebarMenu}>
                <Link 
                  href="/mypage/order-list" 
                  className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`}
                >
                  주문내역
                </Link>
                <Link 
                  href="/mypage/qa" 
                  className={`${styles.menuItem} ${activeTab === 'reviews' ? styles.active : ''}`}
                >
                  문의관리
                </Link>
                <Link 
                  href="/mypage/recently-viewed" 
                  className={`${styles.menuItem} ${activeTab === 'wishlist' ? styles.active : ''}`}
                >
                  최근본상품
                </Link>
                <Link 
                  href="/mypage/coupons" 
                  className={`${styles.menuItem} ${activeTab === 'coupons' ? styles.active : ''}`}
                >
                  쿠폰관리
                </Link>
                <Link 
                  href="/mypage/point" 
                  className={`${styles.menuItem} ${activeTab === 'point' ? styles.active : ''}`}
                >
                  적립금
                </Link>
                <Link 
                  href="/mypage/info-edit" 
                  className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`}
                >
                  회원정보수정
                </Link>
                <Link 
                  href="/mypage/counsel" 
                  className={`${styles.menuItem} ${activeTab === 'counsel' ? styles.active : ''}`}
                >
                  상담내역
                </Link>
                <Link 
                  href="/mypage/restock" 
                  className={`${styles.menuItem} ${activeTab === 'restock' ? styles.active : ''}`}
                >
                  재입고알림
                </Link>
              </nav>
            </div>
          </div>

          {/* 콘텐츠 영역 - 여기에 각 페이지의 내용이 들어감 */}
          <div className={styles.contentArea}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
