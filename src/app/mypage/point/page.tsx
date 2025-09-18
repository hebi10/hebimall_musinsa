'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authProvider';
import { useRouter } from 'next/navigation';
import { usePointBalance, usePointHistory } from '@/shared/hooks/usePoint';
import { PointHistory } from '@/shared/types/point';
import styles from './page.module.css';

export default function PointPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');

  // 포인트 잔액 조회
  const { data: balanceData, isLoading: isBalanceLoading } = usePointBalance();

  // 포인트 내역 조회
  const { history, isLoading: isHistoryLoading, hasMore, loadMore, isLoadingMore } = usePointHistory(20);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  const pointBalance = balanceData?.pointBalance || 0;

  const formatDate = (date: any) => {
    if (!date) return '';
    
    // Firestore Timestamp를 Date로 변환
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPointTypeText = (type: string) => {
    switch (type) {
      case 'earn': return '적립';
      case 'use': return '사용';
      case 'expire': return '만료';
      case 'refund': return '환불';
      default: return type;
    }
  };

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'earn': return styles.earn;
      case 'use': return styles.use;
      case 'expire': return styles.expire;
      case 'refund': return styles.refund;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>포인트 관리</h1>
        <p>STYNA 포인트를 확인하고 관리하세요</p>
      </div>

      {/* 포인트 잔액 카드 */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceInfo}>
          <h2>보유 포인트</h2>
          <div className={styles.balance}>
            {isBalanceLoading ? (
              <div className={styles.skeleton}></div>
            ) : (
              <>
                <span className={styles.amount}>{pointBalance.toLocaleString()}</span>
                <span className={styles.unit}>P</span>
              </>
            )}
          </div>
          <p className={styles.balanceDesc}>
            1포인트 = 1원으로 사용 가능합니다
          </p>
        </div>
        <div className={styles.balanceIcon}>
          <span>💎</span>
        </div>
      </div>

      {/* 포인트 적립 안내 */}
      <div className={styles.earnInfo}>
        <h3>포인트 적립 안내</h3>
        <div className={styles.earnMethods}>
          <div className={styles.earnMethod}>
            <span className={styles.methodIcon}>🎉</span>
            <div className={styles.methodInfo}>
              <h4>신규 가입</h4>
              <p>5,000P 지급</p>
            </div>
          </div>
          <div className={styles.earnMethod}>
            <span className={styles.methodIcon}>🛍️</span>
            <div className={styles.methodInfo}>
              <h4>상품 구매</h4>
              <p>구매금액의 1% 적립</p>
            </div>
          </div>
          <div className={styles.earnMethod}>
            <span className={styles.methodIcon}>⭐</span>
            <div className={styles.methodInfo}>
              <h4>리뷰 작성</h4>
              <p>500P 적립</p>
            </div>
          </div>
          <div className={styles.earnMethod}>
            <span className={styles.methodIcon}>🎂</span>
            <div className={styles.methodInfo}>
              <h4>생일 혜택</h4>
              <p>3,000P 적립</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className={styles.tabMenu}>
        <button
          className={`${styles.tabButton} ${activeTab === 'balance' ? styles.active : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          포인트 잔액
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          포인트 내역
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'balance' && (
          <div className={styles.balanceTab}>
            <div className={styles.balanceDetails}>
              <div className={styles.balanceItem}>
                <span className={styles.label}>총 적립 포인트</span>
                <span className={styles.value}>
                  {history
                    .filter(item => item.type === 'earn')
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString()}P
                </span>
              </div>
              <div className={styles.balanceItem}>
                <span className={styles.label}>총 사용 포인트</span>
                <span className={styles.value}>
                  {history
                    .filter(item => item.type === 'use')
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString()}P
                </span>
              </div>
              <div className={styles.balanceItem}>
                <span className={styles.label}>만료된 포인트</span>
                <span className={styles.value}>
                  {history
                    .filter(item => item.type === 'expire')
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString()}P
                </span>
              </div>
            </div>
            <div className={styles.pointNote}>
              <h4>포인트 사용 안내</h4>
              <ul>
                <li>포인트는 적립일로부터 6개월간 유효합니다</li>
                <li>주문 시 최대 50%까지 포인트로 결제 가능합니다</li>
                <li>포인트는 1P = 1원으로 사용됩니다</li>
                <li>환불 시 사용한 포인트는 다시 적립됩니다</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.historyTab}>
            {isHistoryLoading ? (
              <div className={styles.loading}>포인트 내역을 불러오는 중...</div>
            ) : history.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📋</span>
                <p>포인트 사용 내역이 없습니다</p>
              </div>
            ) : (
              <>
                <div className={styles.historyList}>
                  {history.map((item: PointHistory) => (
                    <div key={item.id} className={styles.historyItem}>
                      <div className={styles.historyContent}>
                        <div className={styles.historyHeader}>
                          <span className={`${styles.pointType} ${getPointTypeColor(item.type)}`}>
                            {getPointTypeText(item.type)}
                          </span>
                          <span className={styles.historyDate}>
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <div className={styles.historyDesc}>
                          {item.description}
                        </div>
                        {item.orderId && (
                          <div className={styles.orderId}>
                            주문번호: {item.orderId}
                          </div>
                        )}
                      </div>
                      <div className={styles.historyAmount}>
                        <span className={`${styles.amount} ${getPointTypeColor(item.type)}`}>
                          {item.type === 'use' || item.type === 'expire' ? '-' : '+'}
                          {item.amount.toLocaleString()}P
                        </span>
                        <div className={styles.balanceAfter}>
                          잔액: {item.balanceAfter?.toLocaleString() || 0}P
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className={styles.loadMore}>
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className={styles.loadMoreButton}
                    >
                      {isLoadingMore ? '불러오는 중...' : '더 보기'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
