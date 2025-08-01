'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

interface PointTransaction {
  id: string;
  type: '적립' | '사용' | '소멸';
  amount: number;
  description: string;
  date: string;
  expiryDate?: string;
  orderId?: string;
}

export default function PointPage() {
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1개월');

  const typeOptions = ['전체', '적립', '사용', '소멸'];
  const periodOptions = ['1개월', '3개월', '6개월', '1년'];

  const currentPoints = 25000;
  const pointsExpiringIn30Days = 5000;

  const transactions: PointTransaction[] = [
    {
      id: 'PT001',
      type: '적립',
      amount: 2500,
      description: '주문완료 적립 (ORD-20241201-001)',
      date: '2024.12.01',
      expiryDate: '2025.12.01',
      orderId: 'ORD-20241201-001'
    },
    {
      id: 'PT002',
      type: '사용',
      amount: -10000,
      description: '주문 시 사용 (ORD-20241130-002)',
      date: '2024.11.30',
      orderId: 'ORD-20241130-002'
    },
    {
      id: 'PT003',
      type: '적립',
      amount: 1500,
      description: '리뷰 작성 적립',
      date: '2024.11.28',
      expiryDate: '2025.11.28'
    },
    {
      id: 'PT004',
      type: '적립',
      amount: 5000,
      description: '이벤트 참여 적립',
      date: '2024.11.25',
      expiryDate: '2025.11.25'
    },
    {
      id: 'PT005',
      type: '소멸',
      amount: -3000,
      description: '유효기간 만료로 인한 소멸',
      date: '2024.11.20'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => 
    selectedType === '전체' || transaction.type === selectedType
  );

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>적립금</h2>
        <p className={styles.pageDesc}>적립금 현황과 사용 내역을 확인하세요.</p>
      </div>

      {/* Points Summary */}
      <div className={styles.summarySection}>
        <div className={styles.currentPointsCard}>
          <div className={styles.pointsIcon}>💰</div>
          <div className={styles.pointsInfo}>
            <div className={styles.pointsLabel}>보유 적립금</div>
            <div className={styles.pointsAmount}>{currentPoints.toLocaleString()}원</div>
          </div>
        </div>
        
        <div className={styles.expiryWarningCard}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningInfo}>
            <div className={styles.warningLabel}>30일 내 소멸 예정</div>
            <div className={styles.warningAmount}>{pointsExpiringIn30Days.toLocaleString()}원</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💵</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>47개</div>
            <div className={styles.statLabel}>총 거래</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>125,000원</div>
            <div className={styles.statLabel}>총 적립</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📉</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>85,000원</div>
            <div className={styles.statLabel}>총 사용</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>15,000원</div>
            <div className={styles.statLabel}>소멸된 적립금</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>거래 유형</label>
          <div className={styles.filterButtons}>
            {typeOptions.map((type) => (
              <button
                key={type}
                className={`${styles.filterButton} ${selectedType === type ? styles.active : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>기간</label>
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

      {/* Transactions List */}
      <div className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>적립금 내역</h3>
          <div className={styles.resultCount}>총 {filteredTransactions.length}건</div>
        </div>

        <div className={styles.transactionsList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className={`${styles.transactionCard} ${styles[`type-${transaction.type}`]}`}>
                <div className={styles.transactionMain}>
                  <div className={styles.transactionLeft}>
                    <div className={styles.transactionType}>
                      {transaction.type === '적립' && '💰'}
                      {transaction.type === '사용' && '💸'}
                      {transaction.type === '소멸' && '⏰'}
                    </div>
                    
                    <div className={styles.transactionInfo}>
                      <h4 className={styles.transactionDescription}>{transaction.description}</h4>
                      <div className={styles.transactionDate}>{transaction.date}</div>
                      {transaction.orderId && (
                        <div className={styles.orderId}>주문번호: {transaction.orderId}</div>
                      )}
                      {transaction.expiryDate && transaction.type === '적립' && (
                        <div className={styles.expiryInfo}>
                          <span className={styles.expiryLabel}>만료일:</span>
                          <span className={styles.expiryDate}>{transaction.expiryDate}</span>
                          {getDaysUntilExpiry(transaction.expiryDate) <= 30 && (
                            <span className={styles.expiryWarning}>
                              ({getDaysUntilExpiry(transaction.expiryDate)}일 남음)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.transactionRight}>
                    <div className={`${styles.transactionAmount} ${styles[`amount-${transaction.type}`]}`}>
                      {transaction.type === '적립' && '+'}
                      {transaction.amount.toLocaleString()}원
                    </div>
                    <div className={`${styles.transactionTypeLabel} ${styles[`label-${transaction.type}`]}`}>
                      {transaction.type}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💰</div>
              <div className={styles.emptyTitle}>적립금 내역이 없습니다</div>
              <div className={styles.emptyDesc}>쇼핑을 통해 적립금을 모아보세요.</div>
            </div>
          )}
        </div>
      </div>

      {/* Points Guide */}
      <div className={styles.guideSection}>
        <h3 className={styles.guideTitle}>적립금 안내</h3>
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>🛒</div>
            <div className={styles.guideContent}>
              <div className={styles.guideItemTitle}>구매 적립</div>
              <div className={styles.guideItemDesc}>구매 금액의 1% 적립</div>
            </div>
          </div>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>⭐</div>
            <div className={styles.guideContent}>
              <div className={styles.guideItemTitle}>리뷰 적립</div>
              <div className={styles.guideItemDesc}>상품 리뷰 작성 시 1,000원 적립</div>
            </div>
          </div>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>🎉</div>
            <div className={styles.guideContent}>
              <div className={styles.guideItemTitle}>이벤트 적립</div>
              <div className={styles.guideItemDesc}>다양한 이벤트 참여로 적립</div>
            </div>
          </div>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>⏳</div>
            <div className={styles.guideContent}>
              <div className={styles.guideItemTitle}>유효기간</div>
              <div className={styles.guideItemDesc}>적립일로부터 1년간 유효</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
