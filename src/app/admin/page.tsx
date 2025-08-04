import styles from './page.module.css';

export default function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>대시보드</h1>
        <p>전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3>총 사용자</h3>
            <p className={styles.statNumber}>15,847</p>
            <span className={styles.statChange}>+12% 이번 달</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <h3>총 상품</h3>
            <p className={styles.statNumber}>2,364</p>
            <span className={styles.statChange}>+8% 이번 달</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <h3>총 주문</h3>
            <p className={styles.statNumber}>8,921</p>
            <span className={styles.statChange}>+23% 이번 달</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <h3>총 매출</h3>
            <p className={styles.statNumber}>₩128,450,000</p>
            <span className={styles.statChange}>+18% 이번 달</span>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className={styles.recentActivity}>
        <h2>최근 활동</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>10분 전</span>
            <p>새로운 주문이 접수되었습니다. (주문번호: #ORD-2024-001)</p>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>25분 전</span>
            <p>상품 재고가 부족합니다. (상품: 나이키 에어맥스)</p>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>1시간 전</span>
            <p>새로운 사용자가 가입했습니다.</p>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>2시간 전</span>
            <p>고객 문의가 접수되었습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
