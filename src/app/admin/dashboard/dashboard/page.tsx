"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";
import styles from "./page.module.css";
import AdminNav from "../../_components/adminNav";
import FirebaseStorageTest from "../../_components/FirebaseStorageTest";

interface StatData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  color: string;
  icon: string;
}

interface OrderData {
  id: string;
  customer: string;
  amount: string;
  status: string;
  statusText: string;
  date: string;
}

interface ActivityData {
  id: string;
  text: string;
  time: string;
  icon: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // 관리자 권한 체크
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
      return;
    }

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [router, user]);

  // 사용자가 로그인하지 않았거나 관리자가 아닌 경우 로딩 화면 표시
  if (!user || user.role !== "admin") {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로그인 페이지로 강제 이동
      router.push('/auth/login');
    }
  };

  const stats: StatData[] = [
    { 
      title: '총 사용자', 
      value: '1,234', 
      change: '+12%', 
      isPositive: true, 
      color: 'blue',
      icon: '사용자'
    },
    { 
      title: '총 상품', 
      value: '856', 
      change: '+5%', 
      isPositive: true, 
      color: 'green',
      icon: '상품'
    },
    { 
      title: '추천 상품', 
      value: '4', 
      change: '활성화', 
      isPositive: true, 
      color: 'orange',
      icon: '추천'
    },
    { 
      title: '총 주문', 
      value: '2,345', 
      change: '+18%', 
      isPositive: true, 
      color: 'purple',
      icon: '주문'
    },
    { 
      title: '매출액', 
      value: '₩12,345,678', 
      change: '+25%', 
      isPositive: true, 
      color: 'red',
      icon: '매출'
    },
    { 
      title: '반품 요청', 
      value: '12', 
      change: '-15%', 
      isPositive: false, 
      color: 'cyan',
      icon: '반품'
    },
  ];

  const recentOrders: OrderData[] = [
    { 
      id: '#12345', 
      customer: '홍길동', 
      amount: '59,900원', 
      status: 'shipping', 
      statusText: '배송중',
      date: '2024-01-20'
    },
    { 
      id: '#12344', 
      customer: '김영희', 
      amount: '129,800원', 
      status: 'completed', 
      statusText: '결제완료',
      date: '2024-01-20'
    },
    { 
      id: '#12343', 
      customer: '이철수', 
      amount: '89,000원', 
      status: 'pending', 
      statusText: '배송완료',
      date: '2024-01-19'
    },
    { 
      id: '#12342', 
      customer: '박민수', 
      amount: '199,000원', 
      status: 'shipping', 
      statusText: '배송중',
      date: '2024-01-19'
    },
    { 
      id: '#12341', 
      customer: '정소영', 
      amount: '79,900원', 
      status: 'completed', 
      statusText: '배송완료',
      date: '2024-01-18'
    },
  ];

  const recentActivity: ActivityData[] = [
    {
      id: '1',
      text: '새로운 주문이 접수되었습니다 (#12346)',
      time: '5분 전',
      icon: '주문'
    },
    {
      id: '2',
      text: '상품 재고가 부족합니다 (아디다스 운동화)',
      time: '15분 전',
      icon: '경고'
    },
    {
      id: '3',
      text: '새로운 사용자가 가입했습니다 (이진우)',
      time: '1시간 전',
      icon: '신규'
    },
    {
      id: '4',
      text: '반품 요청이 처리되었습니다 (#12340)',
      time: '2시간 전',
      icon: '반품'
    },
    {
      id: '5',
      text: '상품 리뷰가 등록되었습니다',
      time: '3시간 전',
      icon: '리뷰'
    },
  ];

  return (
    <div className={styles.container}>
      {/* Firebase Storage 테스트 컴포넌트 (개발용) */}
      {process.env.NODE_ENV === 'development' && <FirebaseStorageTest />}
      
      {/* 관리자 헤더 */}
      <div className={styles.adminHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.adminTitle}>STYNA Admin</h1>
              <AdminNav />
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userInfo}>
                관리자
              </div>
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <h2 className={styles.pageTitle}>관리자 대시보드</h2>
          <p className={styles.pageSubtitle}>
            {currentTime} • STYNA 통합 관리 시스템
          </p>
        </div>

        {/* 통계 카드 */}
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.title} className={`${styles.statCard} ${styles[stat.color]}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  {stat.icon}
                </div>
                <div className={`${styles.statChange} ${!stat.isPositive ? styles.negative : ''}`}>
                  {stat.change}
                </div>
              </div>
              <div className={styles.statTitle}>{stat.title}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 대시보드 그리드 */}
        <div className={styles.dashboardGrid}>
          {/* 최근 주문 */}
          <div className={styles.dashboardCard}>
            <h3 className={styles.cardTitle}>
              최근 주문 현황
            </h3>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객명</th>
                  <th>주문금액</th>
                  <th>주문일</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>{order.date}</td>
                    <td>
                      <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                        {order.statusText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 빠른 작업 */}
          <div className={styles.dashboardCard}>
            <h3 className={styles.cardTitle}>
              빠른 작업
            </h3>
            <div className={styles.quickActions}>
              <Link href="/admin/dashboard/products/add" className={styles.actionButton}>
                새 상품 등록
              </Link>
              <Link href="/admin/featured-products" className={styles.actionButton}>
                추천 상품 관리
              </Link>
              <Link href="/admin/recommendations" className={`${styles.actionButton} ${styles.secondary}`}>
                추천 알고리즘 설정
              </Link>
              <Link href="/admin/dashboard/orders" className={`${styles.actionButton} ${styles.secondary}`}>
                주문 관리
              </Link>
              <Link href="/admin/dashboard/users" className={`${styles.actionButton} ${styles.tertiary}`}>
                사용자 관리
              </Link>
              <button className={styles.actionButton}>
                보고서 생성
              </button>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className={styles.dashboardCard}>
          <h3 className={styles.cardTitle}>
            최근 활동
          </h3>
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.icon}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>{activity.text}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
