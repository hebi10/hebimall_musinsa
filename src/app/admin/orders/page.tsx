"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth/authProvider";
import styles from "./page.module.css";

interface OrderData {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  amount: string;
  status: string;
  statusText: string;
  date: string;
  items: number;
  paymentMethod: string;
}

interface OrderStats {
  total: number;
  pending: number;
  shipping: number;
  delivered: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, shipping: 0, delivered: 0 });

  useEffect(() => {
    // 관리자 권한 체크
    if (!user || user.role !== "admin") {
      router.replace("/");
      return;
    }

    // 예시 주문 데이터
    const mockOrders: OrderData[] = [
      {
        id: "1",
        orderNumber: "#12345",
        customer: "홍길동",
        email: "hong@example.com",
        amount: "159,900원",
        status: "pending",
        statusText: "결제 대기",
        date: "2024-01-20",
        items: 3,
        paymentMethod: "신용카드"
      },
      {
        id: "2",
        orderNumber: "#12344",
        customer: "김영희",
        email: "kim@example.com",
        amount: "89,000원",
        status: "confirmed",
        statusText: "주문 확인",
        date: "2024-01-20",
        items: 2,
        paymentMethod: "계좌이체"
      },
      {
        id: "3",
        orderNumber: "#12343",
        customer: "이철수",
        email: "lee@example.com",
        amount: "299,800원",
        status: "shipping",
        statusText: "배송 중",
        date: "2024-01-19",
        items: 5,
        paymentMethod: "신용카드"
      },
      {
        id: "4",
        orderNumber: "#12342",
        customer: "박민수",
        email: "park@example.com",
        amount: "129,000원",
        status: "delivered",
        statusText: "배송 완료",
        date: "2024-01-18",
        items: 2,
        paymentMethod: "카카오페이"
      },
      {
        id: "5",
        orderNumber: "#12341",
        customer: "정소영",
        email: "jung@example.com",
        amount: "79,900원",
        status: "delivered",
        statusText: "배송 완료",
        date: "2024-01-17",
        items: 1,
        paymentMethod: "신용카드"
      },
      {
        id: "6",
        orderNumber: "#12340",
        customer: "최준호",
        email: "choi@example.com",
        amount: "199,000원",
        status: "cancelled",
        statusText: "주문 취소",
        date: "2024-01-16",
        items: 3,
        paymentMethod: "신용카드"
      }
    ];

    setOrders(mockOrders);

    // 통계 계산
    const newStats = {
      total: mockOrders.length,
      pending: mockOrders.filter(order => order.status === "pending").length,
      shipping: mockOrders.filter(order => order.status === "shipping" || order.status === "confirmed").length,
      delivered: mockOrders.filter(order => order.status === "delivered").length
    };
    setStats(newStats);
  }, [router, user]);

  // 필터링 로직
  useEffect(() => {
    let filtered = orders;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter]);

  // 권한 체크 로딩
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
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
          <p>권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, statusText: getStatusText(newStatus) }
        : order
    ));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "결제 대기";
      case "confirmed": return "주문 확인";
      case "shipping": return "배송 중";
      case "delivered": return "배송 완료";
      case "cancelled": return "주문 취소";
      default: return status;
    }
  };

  const handleExport = () => {
    // CSV 내보내기 로직
    alert("주문 데이터를 CSV로 내보냅니다.");
  };

  // 페이지네이션
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={styles.container}>
      {/* 관리자 헤더 */}
      <div className={styles.adminHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.adminTitle}>HEBIMALL Admin</h1>
              <nav className={styles.adminNav}>
                <Link href="/admin/dashboard" className={styles.navLink}>
                  📊 대시보드
                </Link>
                <Link href="/admin/users" className={styles.navLink}>
                  👥 사용자 관리
                </Link>
                <Link href="/admin/products" className={styles.navLink}>
                  📦 상품 관리
                </Link>
                <Link href="/admin/orders" className={`${styles.navLink} ${styles.active}`}>
                  🛒 주문 관리
                </Link>
              </nav>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userInfo}>
                👨‍💼 관리자
              </div>
              <Link href="/" className={styles.logoutButton}>
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>주문 관리</h2>
          <p className={styles.pageSubtitle}>
            전체 주문 내역을 관리하고 주문 상태를 업데이트하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className={styles.statsCards}>
          <div className={`${styles.statsCard} ${styles.total}`}>
            <div className={styles.statsValue}>{stats.total}</div>
            <div className={styles.statsLabel}>전체 주문</div>
          </div>
          <div className={`${styles.statsCard} ${styles.pending}`}>
            <div className={styles.statsValue}>{stats.pending}</div>
            <div className={styles.statsLabel}>결제 대기</div>
          </div>
          <div className={`${styles.statsCard} ${styles.shipping}`}>
            <div className={styles.statsValue}>{stats.shipping}</div>
            <div className={styles.statsLabel}>처리/배송 중</div>
          </div>
          <div className={`${styles.statsCard} ${styles.delivered}`}>
            <div className={styles.statsValue}>{stats.delivered}</div>
            <div className={styles.statsLabel}>배송 완료</div>
          </div>
        </div>

        {/* 컨트롤 섹션 */}
        <div className={styles.controlsSection}>
          <div className={styles.controlsGrid}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="주문번호, 고객명, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">전체 상태</option>
              <option value="pending">결제 대기</option>
              <option value="confirmed">주문 확인</option>
              <option value="shipping">배송 중</option>
              <option value="delivered">배송 완료</option>
              <option value="cancelled">주문 취소</option>
            </select>

            <button onClick={handleExport} className={styles.exportButton}>
              📊 CSV 내보내기
            </button>
          </div>
        </div>

        {/* 주문 테이블 */}
        <div className={styles.ordersTable}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>🛒 주문 목록</h3>
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객정보</th>
                <th>상품수량</th>
                <th>주문금액</th>
                <th>결제방법</th>
                <th>주문일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{order.customer}</strong><br />
                      <small style={{ color: '#999' }}>{order.email}</small>
                    </div>
                  </td>
                  <td>{order.items}개</td>
                  <td><strong>{order.amount}</strong></td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                      {order.statusText}
                    </span>
                  </td>
                  <td>
                    <button className={`${styles.actionButton} ${styles.primary}`}>
                      상세
                    </button>
                    {order.status === "pending" && (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleStatusChange(order.id, "confirmed")}
                      >
                        승인
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleStatusChange(order.id, "shipping")}
                      >
                        배송
                      </button>
                    )}
                    {order.status === "shipping" && (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleStatusChange(order.id, "delivered")}
                      >
                        완료
                      </button>
                    )}
                    <button className={`${styles.actionButton} ${styles.danger}`}>
                      취소
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button
              className={styles.pageButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
