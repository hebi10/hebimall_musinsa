'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

interface Coupon {
  id: string;
  name: string;
  type: '할인금액' | '할인율' | '무료배송';
  value: number;
  minOrderAmount?: number;
  expiryDate: string;
  status: '사용가능' | '사용완료' | '기간만료';
  usedDate?: string;
  description?: string;
}

export default function CouponsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const statusOptions = ['전체', '사용가능', '사용완료', '기간만료'];

  const coupons: Coupon[] = [
    {
      id: 'C001',
      name: '신규회원 환영 쿠폰',
      type: '할인금액',
      value: 10000,
      minOrderAmount: 50000,
      expiryDate: '2024.12.31',
      status: '사용가능',
      description: '첫 구매 시 사용 가능한 특별 할인 쿠폰'
    },
    {
      id: 'C002',
      name: '겨울 세일 쿠폰',
      type: '할인율',
      value: 20,
      minOrderAmount: 100000,
      expiryDate: '2024.12.25',
      status: '사용가능',
      description: '겨울 상품 전용 할인 쿠폰'
    },
    {
      id: 'C003',
      name: '무료배송 쿠폰',
      type: '무료배송',
      value: 0,
      expiryDate: '2024.12.15',
      status: '사용완료',
      usedDate: '2024.11.28',
      description: '배송비 무료 혜택'
    },
    {
      id: 'C004',
      name: '추석 특가 쿠폰',
      type: '할인율',
      value: 15,
      minOrderAmount: 80000,
      expiryDate: '2024.10.15',
      status: '기간만료',
      description: '추석 연휴 특별 할인'
    }
  ];

  const filteredCoupons = coupons.filter(coupon => 
    selectedStatus === '전체' || coupon.status === selectedStatus
  );

  const handleCouponRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    // 쿠폰 등록 로직
    console.log('쿠폰 등록:', couponCode);
    setCouponCode('');
    setShowRegistrationForm(false);
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>쿠폰</h2>
        <p className={styles.pageDesc}>보유하신 쿠폰을 확인하고 관리하세요.</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎫</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>전체 쿠폰</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>3</div>
            <div className={styles.statLabel}>사용가능</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>45,000원</div>
            <div className={styles.statLabel}>절약 가능 금액</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>2개</div>
            <div className={styles.statLabel}>곧 만료</div>
          </div>
        </div>
      </div>

      {/* Filter and Registration Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>쿠폰 상태</label>
          <div className={styles.filterButtons}>
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`${styles.filterButton} ${selectedStatus === status ? styles.active : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.registrationButtonContainer}>
          <button 
            className={styles.registrationButton}
            onClick={() => setShowRegistrationForm(!showRegistrationForm)}
          >
            <span className={styles.buttonIcon}>➕</span>
            쿠폰 등록
          </button>
        </div>
      </div>

      {/* Coupon Registration Form */}
      {showRegistrationForm && (
        <div className={styles.registrationForm}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>쿠폰 등록</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setShowRegistrationForm(false)}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleCouponRegistration} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>쿠폰 코드</label>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  className={styles.formInput}
                  placeholder="쿠폰 코드를 입력하세요"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className={styles.registerButton}>
                  등록
                </button>
              </div>
            </div>
            <div className={styles.formNote}>
              * 쿠폰 코드는 대소문자를 구분합니다. 정확히 입력해주세요.
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className={styles.couponsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>보유 쿠폰</h3>
          <div className={styles.resultCount}>총 {filteredCoupons.length}장</div>
        </div>

        <div className={styles.couponsList}>
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((coupon) => {
              const daysUntilExpiry = getDaysUntilExpiry(coupon.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 7 && coupon.status === '사용가능';
              
              return (
                <div key={coupon.id} className={`${styles.couponCard} ${styles[`status-${coupon.status}`]}`}>
                  <div className={styles.couponMain}>
                    <div className={styles.couponLeft}>
                      <div className={styles.couponType}>
                        {coupon.type === '할인금액' && '💰'}
                        {coupon.type === '할인율' && '📊'}
                        {coupon.type === '무료배송' && '🚚'}
                      </div>
                      
                      <div className={styles.couponInfo}>
                        <h4 className={styles.couponName}>{coupon.name}</h4>
                        <div className={styles.couponValue}>
                          {coupon.type === '할인금액' && `${coupon.value.toLocaleString()}원 할인`}
                          {coupon.type === '할인율' && `${coupon.value}% 할인`}
                          {coupon.type === '무료배송' && '무료배송'}
                        </div>
                        {coupon.minOrderAmount && (
                          <div className={styles.minOrder}>
                            {coupon.minOrderAmount.toLocaleString()}원 이상 구매 시
                          </div>
                        )}
                        {coupon.description && (
                          <div className={styles.couponDescription}>
                            {coupon.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.couponRight}>
                      <div className={`${styles.couponStatus} ${styles[`status-${coupon.status}`]}`}>
                        {coupon.status}
                      </div>
                      
                      <div className={styles.couponExpiry}>
                        {coupon.status === '사용완료' ? (
                          <span className={styles.usedDate}>사용일: {coupon.usedDate}</span>
                        ) : (
                          <>
                            <span className={styles.expiryLabel}>만료일</span>
                            <span className={styles.expiryDate}>{coupon.expiryDate}</span>
                            {isExpiringSoon && (
                              <span className={styles.expiryWarning}>
                                {daysUntilExpiry}일 남음!
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {coupon.status === '사용가능' && (
                    <div className={styles.couponFooter}>
                      <button className={styles.useCouponButton}>
                        쿠폰 사용하기
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎫</div>
              <div className={styles.emptyTitle}>보유하신 쿠폰이 없습니다</div>
              <div className={styles.emptyDesc}>쿠폰을 등록하거나 이벤트에 참여하여 쿠폰을 받아보세요.</div>
              <button 
                className={styles.registrationButton}
                onClick={() => setShowRegistrationForm(true)}
              >
                쿠폰 등록하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
