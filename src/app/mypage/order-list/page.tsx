'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useAuth } from '@/context/authProvider';
import { OrderService } from '@/shared/services/orderService';
import { Order, OrderStatus } from '@/shared/types/order';

export default function OrderListPage() {
  const { user, userData, loading, isAdmin } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3개월');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 주문 데이터 로드
  const loadOrders = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userOrders = await OrderService.getUserOrders(user.uid, 50);
      setOrders(userOrders);
    } catch (err) {
      console.error('주문 목록 로드 실패:', err);
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadOrders();
    }
  }, [user?.uid]);

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;

  const statusOptions = ['전체', 'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
  const statusLabels: Record<string, string> = {
    '전체': '전체',
    'pending': '결제 대기',
    'confirmed': '주문 확인',
    'preparing': '상품 준비중',
    'shipped': '배송중',
    'delivered': '배송완료',
    'cancelled': '취소',
  };
  
  const periodOptions = ['1개월', '3개월', '6개월', '1년'];

  // 필터링된 주문 목록
  const filteredOrders = orders.filter(order => {
    if (selectedStatus === '전체') return true;
    return order.status === selectedStatus;
  });

  // 통계 계산
  const stats = {
    total: orders.length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalAmount: orders.reduce((sum, order) => sum + order.finalAmount, 0)
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "결제 대기";
      case "confirmed": return "주문 확인";
      case "preparing": return "상품 준비중";
      case "shipped": return "배송 중";
      case "delivered": return "배송 완료";
      case "cancelled": return "주문 취소";
      case "returned": return "반품";
      case "exchanged": return "교환";
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>주문/배송 조회</h2>
        <p className={styles.pageDesc}>주문하신 상품의 주문내역을 확인하실 수 있습니다.</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>총 주문</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚚</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.shipped}</div>
            <div className={styles.statLabel}>배송중</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.delivered}</div>
            <div className={styles.statLabel}>배송완료</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{formatCurrency(stats.totalAmount)}</div>
            <div className={styles.statLabel}>총 구매금액</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>주문상태</label>
          <div className={styles.filterButtons}>
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`${styles.filterButton} ${selectedStatus === status ? styles.active : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {statusLabels[status] || status}
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>조회기간</label>
          <div className={styles.filterButtons}>
            {periodOptions.map((period) => (
              <button
                key={period}
                className={`${styles.filterButton} ${selectedPeriod === period ? styles.active : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>주문 목록</h3>
          <div className={styles.resultCount}>총 {filteredOrders.length}건</div>
          <button 
            onClick={loadOrders} 
            className={styles.refreshButton}
            disabled={isLoading}
          >
            {isLoading ? '새로고침 중...' : '🔄 새로고침'}
          </button>
        </div>

        <div className={styles.ordersList}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>주문 목록을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={loadOrders} className={styles.retryButton}>
                다시 시도
              </button>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>{order.orderNumber}</span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className={styles.orderStatusBadge}>
                    <span className={`${styles.statusDot} ${styles[`status-${order.status}`]}`}></span>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className={styles.orderProducts}>
                  {order.products.map((product) => (
                    <div key={product.id} className={styles.productItem}>
                      <div className={styles.productImage}>
                        <img src={product.productImage} alt={product.productName} />
                      </div>
                      <div className={styles.productInfo}>
                        <div className={styles.productBrand}>{product.brand}</div>
                        <div className={styles.productName}>{product.productName}</div>
                        <div className={styles.productOption}>
                          {product.color} / {product.size} / 수량 {product.quantity}개
                        </div>
                      </div>
                      <div className={styles.productPrice}>
                        {formatCurrency(product.price * product.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    총 주문금액: <strong>{formatCurrency(order.finalAmount)}</strong>
                    {order.discountAmount > 0 && (
                      <span className={styles.discountAmount}>
                        (할인 {formatCurrency(order.discountAmount)})
                      </span>
                    )}
                  </div>
                  <div className={styles.orderActions}>
                    <button className={styles.actionButton}>주문상세</button>
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <button className={styles.actionButton}>배송조회</button>
                    )}
                    {order.status === 'delivered' && (
                      <button className={styles.actionButton}>리뷰작성</button>
                    )}
                    {order.status === 'pending' && (
                      <button className={`${styles.actionButton} ${styles.cancel}`}>주문취소</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <div className={styles.emptyTitle}>주문 내역이 없습니다</div>
              <div className={styles.emptyDesc}>
                {selectedStatus === '전체' 
                  ? '아직 주문하신 상품이 없습니다.' 
                  : `'${statusLabels[selectedStatus]}' 상태의 주문이 없습니다.`
                }
              </div>
              <Link href="/" className={styles.shopButton}>
                쇼핑하러 가기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
