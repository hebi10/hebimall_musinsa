"use client";

import { useEffect, useState } from "react";
import PageHeader from "../_components/PageHeader";
import styles from "./layout.module.css";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/authProvider";
import { CouponProvider } from "@/context/couponProvider";
import { ProfileSection, QuickActions, SidebarMenu } from "./_components";

interface MyPageLayoutProps {
  children: React.ReactNode;
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const [activeTab, setActiveTab] = useState('orders');
  const pathname = usePathname();
  const { userData, logout } = useAuth();

  const userInfo = {
    name: userData?.name || "로딩중...",
    email: userData?.email || "로딩중...",
    membershipLevel: userData?.membershipLevel || "silver",
    orders: userData?.orders || 0,
    reviews: userData?.reviews || 0,
    coupons: userData?.coupons || 0
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
    const tabMap = {
      "/mypage/order-list": "orders",
      "/mypage/qa": "reviews",
      "/mypage/recently-viewed": "wishlist",
      "/mypage/coupons": "coupons",
      "/mypage/point": "point",
      "/mypage/info-edit": "profile",
      "/mypage/counsel": "counsel",
      "/mypage/restock": "restock",
    };

    const found = Object.entries(tabMap).find(([key]) => pathname.includes(key));
    if (found) {
      setActiveTab(found[1]);
    }
  }, [pathname]);

  // 마이페이지 접속 시 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <ProfileSection userInfo={userInfo} />

        {/* 빠른 메뉴 */}
        <QuickActions actions={quickActions} />

        {/* 메인 콘텐츠 */}
        <div className={styles.mainContent}>
          {/* 사이드바 */}
          <SidebarMenu activeTab={activeTab} logout={logout} />

          {/* 콘텐츠 영역 - 여기에 각 페이지의 내용이 들어감 */}
          <div className={styles.contentArea}>
            <CouponProvider>
              {children}
            </CouponProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
