'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useCoupon } from '@/context/couponProvider';
import { CouponFilter } from '@/shared/types/coupon';
import CouponRegister from '../_components/CouponRegister';

export default function CouponsPage() {
  const {
    userCoupons,
    couponStats,
    loading,
    error,
    getUserCouponsWithFilter,
    registerCouponByCode,
    getDaysUntilExpiry
  } = useCoupon();

  const [selectedStatus, setSelectedStatus] = useState<string>('전체');

  const statusOptions = ['전체', '사용가능', '사용완료', '기간만료'];

  // 필터 변경시 쿠폰 목록 다시 조회
  useEffect(() => {
    const filter: CouponFilter = {
      status: selectedStatus === '전체' ? undefined : selectedStatus as any,
      sortBy: 'issuedDate',
      sortOrder: 'desc'
    };
    getUserCouponsWithFilter(filter);
  }, [selectedStatus, getUserCouponsWithFilter]); // 이제 안전하게 포함 가능

  const handleCouponRegistration = async (couponCode: string): Promise<boolean> => {
    if (!couponCode.trim()) {
      return false;
    }

    try {
      const response = await registerCouponByCode(couponCode.trim());
      
      if (response.success) {
        // 성공시 쿠폰 목록 새로고침
        const filter: CouponFilter = {
          status: selectedStatus === '전체' ? undefined : selectedStatus as any,
          sortBy: 'issuedDate',
          sortOrder: 'desc'
        };
        getUserCouponsWithFilter(filter);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('쿠폰 등록 오류:', error);
      return false;
    }
  };

  if (loading && userCoupons.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>쿠폰을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>쿠폰</h2>
        <p className={styles.pageDesc}>보유하신 쿠폰을 확인하고 관리하세요.</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{couponStats?.total || 0}</div>
            <div className={styles.statLabel}>전체 쿠폰</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{couponStats?.available || 0}</div>
            <div className={styles.statLabel}>사용가능</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {userCoupons
                .filter(uc => uc.status === '사용가능')
                .reduce((sum, uc) => {
                  if (uc.coupon.type === '할인금액') return sum + uc.coupon.value;
                  return sum;
                }, 0)
                .toLocaleString()}원
            </div>
            <div className={styles.statLabel}>절약 가능 금액</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {userCoupons
                .filter(uc => {
                  if (uc.status !== '사용가능') return false;
                  const days = getDaysUntilExpiry(uc.coupon.expiryDate);
                  return days <= 7 && days > 0;
                })
                .length}개
            </div>
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
          {/* CouponRegister 컴포넌트에서 버튼도 포함하여 처리 */}
        </div>
      </div>

      {/* Coupon Registration Component */}
      <CouponRegister 
        onRegister={handleCouponRegistration}
      />

      {/* Coupons List */}
      <div className={styles.couponsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>보유 쿠폰</h3>
          <div className={styles.resultCount}>총 {userCoupons.length}장</div>
        </div>

        <div className={styles.couponsList}>
          {userCoupons.length > 0 ? (
            userCoupons.map((userCouponView) => {
              const daysUntilExpiry = getDaysUntilExpiry(userCouponView.coupon.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 7 && userCouponView.status === '사용가능';
              
              return (
                <div key={userCouponView.id} className={`${styles.couponCard} ${styles[`status-${userCouponView.status}`]}`}>
                  <div className={styles.couponMain}>
                    <div className={styles.couponLeft}>
                      <div className={styles.couponType}>
                        {userCouponView.coupon.type === '할인금액' && ''}
                        {userCouponView.coupon.type === '할인율' && ''}
                        {userCouponView.coupon.type === '무료배송' && ''}
                      </div>
                      
                      <div className={styles.couponInfo}>
                        <h4 className={styles.couponName}>{userCouponView.coupon.name}</h4>
                        <div className={styles.couponValue}>
                          {userCouponView.coupon.type === '할인금액' && `${userCouponView.coupon.value.toLocaleString()}원 할인`}
                          {userCouponView.coupon.type === '할인율' && `${userCouponView.coupon.value}% 할인`}
                          {userCouponView.coupon.type === '무료배송' && '무료배송'}
                        </div>
                        {userCouponView.coupon.minOrderAmount && (
                          <div className={styles.minOrder}>
                            {userCouponView.coupon.minOrderAmount.toLocaleString()}원 이상 구매 시
                          </div>
                        )}
                        {userCouponView.coupon.description && (
                          <div className={styles.couponDescription}>
                            {userCouponView.coupon.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.couponRight}>
                      <div className={`${styles.couponStatus} ${styles[`status-${userCouponView.status}`]}`}>
                        {userCouponView.status}
                      </div>
                      
                      <div className={styles.couponExpiry}>
                        {userCouponView.status === '사용완료' ? (
                          <span className={styles.usedDate}>사용일: {userCouponView.usedDate}</span>
                        ) : (
                          <>
                            <span className={styles.expiryLabel}>만료일</span>
                            <span className={styles.expiryDate}>{userCouponView.coupon.expiryDate}</span>
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

                  {userCouponView.status === '사용가능' && (
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
              <div className={styles.emptyIcon}></div>
              <div className={styles.emptyTitle}>보유하신 쿠폰이 없습니다</div>
              <div className={styles.emptyDesc}>쿠폰을 등록하거나 이벤트에 참여하여 쿠폰을 받아보세요.</div>
              {/* CouponRegister 컴포넌트에서 버튼을 제공 */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
