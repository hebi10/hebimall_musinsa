'use client';

import { useDashboardData, useDashboardFormatters } from '@/shared/hooks/useDashboardQuery';
import Chart from './_components/Chart';
import ErrorBoundary from './_components/ErrorBoundary';
import LoadingSpinner from './_components/LoadingSpinner';
import styles from './page.module.css';

export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const { stats, loading, error, lastUpdated, refresh, isRefreshing } = useDashboardData();
  const { formatNumber, formatCurrency, formatTimeAgo, getGrowthColor, getGrowthIcon } = useDashboardFormatters();

  if (loading && !stats) {
    return (
      <div className={styles.dashboard}>
        <LoadingSpinner 
          size="large" 
          message="대시보드 데이터를 불러오는 중..." 
        />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.error}>
          <h2>데이터를 불러올 수 없습니다</h2>
          <p>{error}</p>
          <button onClick={refresh} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.noData}>
          <p>표시할 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 차트 데이터 준비
  const revenueChartData = stats.revenueByMonth.slice(-6).map(item => ({
    label: item.month.split('-')[1] + '월',
    value: item.revenue
  }));

  const orderStatusChartData = Object.entries(stats.orderStatusStats).map(([status, count]) => ({
    label: getStatusText(status),
    value: count
  }));

  const categoryChartData = [
    { label: '상의', value: Math.floor(Math.random() * 500) + 200 },
    { label: '하의', value: Math.floor(Math.random() * 400) + 150 },
    { label: '신발', value: Math.floor(Math.random() * 300) + 100 },
    { label: '아우터', value: Math.floor(Math.random() * 250) + 80 },
    { label: '액세서리', value: Math.floor(Math.random() * 200) + 50 }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1>대시보드</h1>
          <p>전체 현황을 한눈에 확인하세요</p>
          {lastUpdated && (
            <small className={styles.lastUpdated}>
              마지막 업데이트: {formatTimeAgo(lastUpdated)}
            </small>
          )}
        </div>
        <button onClick={refresh} className={styles.refreshButton} disabled={isRefreshing}>
          {isRefreshing ? '업데이트 중...' : '새로고침'}
        </button>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        {/* 사용자 통계 - Firebase 데이터가 있을 때만 표시 */}
        {stats.dataAvailability.users && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>총 사용자</h3>
              <p className={styles.statNumber}>{formatNumber(stats.totalUsers)}</p>
              <span 
                className={styles.statChange}
                style={{ color: getGrowthColor(stats.monthlyGrowth.users) }}
              >
                {getGrowthIcon(stats.monthlyGrowth.users)} {stats.monthlyGrowth.users}% 이번 달
              </span>
            </div>
          </div>
        )}

        {/* 상품 통계 - Mock 데이터 사용 */}
        {stats.dataAvailability.products && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statContent}>
              <h3>총 상품</h3>
              <p className={styles.statNumber}>{formatNumber(stats.totalProducts)}</p>
              <span 
                className={styles.statChange}
                style={{ color: getGrowthColor(stats.monthlyGrowth.products) }}
              >
                {getGrowthIcon(stats.monthlyGrowth.products)} {stats.monthlyGrowth.products}% 이번 달
              </span>
            </div>
          </div>
        )}

        {/* 쿠폰 통계 - Firebase 연결이 있을 때만 표시 */}
        {stats.dataAvailability.coupons && stats.totalCoupons > 0 && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎫</div>
            <div className={styles.statContent}>
              <h3>발급된 쿠폰</h3>
              <p className={styles.statNumber}>{formatNumber(stats.totalCoupons)}</p>
              <span 
                className={styles.statChange}
                style={{ color: getGrowthColor(stats.monthlyGrowth.coupons) }}
              >
                {getGrowthIcon(stats.monthlyGrowth.coupons)} {stats.monthlyGrowth.coupons}% 이번 달
              </span>
            </div>
          </div>
        )}

        {/* 이벤트 통계 - Firebase 연결이 있을 때만 표시 */}
        {stats.dataAvailability.events && stats.activeEvents > 0 && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎉</div>
            <div className={styles.statContent}>
              <h3>진행중 이벤트</h3>
              <p className={styles.statNumber}>{formatNumber(stats.activeEvents)}</p>
              <span 
                className={styles.statChange}
                style={{ color: getGrowthColor(stats.monthlyGrowth.events) }}
              >
                {getGrowthIcon(stats.monthlyGrowth.events)} {stats.monthlyGrowth.events}개 이번 달
              </span>
            </div>
          </div>
        )}

        {/* 주문 통계 - Mock 데이터 사용 */}
        {stats.dataAvailability.orders && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statContent}>
              <h3>총 주문</h3>
              <p className={styles.statNumber}>{formatNumber(stats.totalOrders)}</p>
              <span 
                className={styles.statChange}
                style={{ color: getGrowthColor(stats.monthlyGrowth.orders) }}
              >
                {getGrowthIcon(stats.monthlyGrowth.orders)} {stats.monthlyGrowth.orders}% 이번 달
              </span>
            </div>
          </div>
        )}

        {/* 매출 통계 - 주문이 있을 때만 표시 */}
        {stats.dataAvailability.orders && stats.totalRevenue > 0 && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <h3>총 매출</h3>
              <p className={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</p>
              <span 
                className={styles.statChange}
                style={{ color: getGrowthColor(stats.monthlyGrowth.revenue) }}
              >
                {getGrowthIcon(stats.monthlyGrowth.revenue)} {stats.monthlyGrowth.revenue}% 이번 달
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 차트 섹션 - 데이터가 있을 때만 표시 */}
      {(stats.dataAvailability.orders || stats.dataAvailability.products) && (
        <div className={styles.chartsGrid}>
          {/* 매출 차트 - 주문 데이터가 있을 때만 */}
          {stats.dataAvailability.orders && stats.revenueByMonth.length > 0 && (
            <div className={styles.chartCard}>
              <Chart
                data={revenueChartData}
                type="line"
                title="최근 6개월 매출 추이"
                width={500}
                height={250}
              />
            </div>
          )}

          {/* 주문 상태 차트 - 주문 데이터가 있을 때만 */}
          {stats.dataAvailability.orders && Object.keys(stats.orderStatusStats).length > 0 && (
            <div className={styles.chartCard}>
              <Chart
                data={orderStatusChartData}
                type="pie"
                title="주문 상태 분포"
                width={400}
                height={300}
              />
            </div>
          )}

          {/* 카테고리 차트 - 상품 데이터가 있을 때만 */}
          {stats.dataAvailability.products && (
            <div className={styles.chartCard}>
              <Chart
                data={categoryChartData}
                type="bar"
                title="카테고리별 상품 판매량"
                width={500}
                height={250}
              />
            </div>
          )}
        </div>
      )}

      {/* 추가 정보 섹션 */}
      <div className={styles.infoGrid}>
        {/* 최근 활동 - 항상 표시 (Mock 데이터라도) */}
        <div className={styles.recentActivity}>
          <h2>최근 활동</h2>
          <div className={styles.activityList}>
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <span className={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  <p>{activity.description}</p>
                  <span 
                    className={styles.activityPriority}
                    data-priority={activity.priority}
                  >
                    {activity.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.noDataMessage}>최근 활동이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 재고 부족 상품 - 상품 데이터가 있고 재고 부족 상품이 있을 때만 */}
        {stats.dataAvailability.products && stats.lowStockProducts.length > 0 && (
          <div className={styles.lowStockSection}>
            <h2>재고 부족 상품</h2>
            <div className={styles.lowStockList}>
              {stats.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className={styles.lowStockItem}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.stockCount}>
                    {product.stock}개 남음
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 베스트셀러 상품 - 상품 데이터가 있을 때만 */}
        {stats.dataAvailability.products && stats.topSellingProducts.length > 0 && (
          <div className={styles.topSellingSection}>
            <h2>베스트셀러 상품</h2>
            <div className={styles.topSellingList}>
              {stats.topSellingProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className={styles.topSellingItem}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.reviewCount}>
                    리뷰 {formatNumber(product.reviewCount)}개
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 주문 상태 통계 - 주문 데이터가 있을 때만 */}
        {stats.dataAvailability.orders && Object.keys(stats.orderStatusStats).length > 0 && (
          <div className={styles.orderStatusSection}>
            <h2>주문 상태 현황</h2>
            <div className={styles.orderStatusList}>
              {Object.entries(stats.orderStatusStats).map(([status, count]) => (
                <div key={status} className={styles.orderStatusItem}>
                  <span className={styles.statusLabel}>
                    {getStatusText(status)}
                  </span>
                  <span className={styles.statusCount}>
                    {formatNumber(count)}건
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 주문 상태 텍스트 변환
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '결제 대기',
    'confirmed': '주문 확인',
    'preparing': '상품 준비중',
    'shipped': '배송 중',
    'delivered': '배송 완료',
    'cancelled': '주문 취소',
    'returned': '반품',
    'exchanged': '교환'
  };
  
  return statusMap[status] || status;
}
