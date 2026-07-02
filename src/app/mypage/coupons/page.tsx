'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/context/authProvider';
import {
  getDaysUntilCouponExpiry,
  useRegisterCouponByCode,
  useUserCoupons,
  useUserCouponStats,
} from '@/shared/hooks/useCoupons';
import { CouponFilter } from '@/shared/types/coupon';
import CouponRegister from '../_components/CouponRegister';
import styles from './page.module.css';

type CouponStatusFilter = NonNullable<CouponFilter['status']>;

const statusOptions = ['전체', '사용가능', '사용완료', '기간만료'];

function formatCouponValue(type: string, value: number) {
  if (type === '무료배송') return '무료배송';
  return `${value.toLocaleString()}${type === '할인율' ? '%' : '원'} 할인`;
}

export default function CouponsPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const filter = useMemo<CouponFilter>(() => ({
    status: selectedStatus === '전체' ? undefined : selectedStatus as CouponStatusFilter,
    sortBy: 'issuedDate',
    sortOrder: 'desc',
  }), [selectedStatus]);
  const { data: userCoupons = [], isLoading: loading, error } = useUserCoupons(user?.uid || null, filter);
  const { data: couponStats = null } = useUserCouponStats(user?.uid || null);
  const registerCouponByCodeMutation = useRegisterCouponByCode(user?.uid || null);

  const handleCouponRegistration = async (couponCode: string): Promise<boolean> => {
    if (!couponCode.trim()) return false;

    try {
      const response = await registerCouponByCodeMutation.mutateAsync(couponCode.trim());
      return response.success;
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
          <p className={styles.errorMessage}>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }

  const expiringSoonCount = userCoupons.filter((userCouponView) => {
    const days = getDaysUntilCouponExpiry(userCouponView.coupon.expiryDate);
    return days <= 7 && days > 0;
  }).length;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>쿠폰</h2>
        <p className={styles.pageDesc}>보유하신 쿠폰을 확인하고 관리하세요.</p>
      </div>

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
            <div className={styles.statNumber}>{couponStats?.used || 0}</div>
            <div className={styles.statLabel}>사용완료</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{expiringSoonCount}개</div>
            <div className={styles.statLabel}>곧 만료</div>
          </div>
        </div>
      </div>

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
      </div>

      <CouponRegister onRegister={handleCouponRegistration} />

      <div className={styles.couponsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>보유 쿠폰</h3>
          <div className={styles.resultCount}>총 {userCoupons.length}장</div>
        </div>

        <div className={styles.couponsList}>
          {userCoupons.length > 0 ? (
            userCoupons.map((userCouponView) => {
              const daysUntilExpiry = getDaysUntilCouponExpiry(userCouponView.coupon.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

              return (
                <div key={userCouponView.id} className={styles.couponCard}>
                  <div className={styles.couponMain}>
                    <div className={styles.couponLeft}>
                      <div className={styles.couponInfo}>
                        <h4 className={styles.couponName}>{userCouponView.coupon.name}</h4>
                        <div className={styles.couponValue}>
                          {formatCouponValue(userCouponView.coupon.type, userCouponView.coupon.value)}
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
                      <div className={styles.couponStatus}>{userCouponView.status}</div>
                      <div className={styles.couponExpiry}>
                        <span className={styles.expiryLabel}>만료일</span>
                        <span className={styles.expiryDate}>{userCouponView.coupon.expiryDate}</span>
                        {isExpiringSoon && (
                          <span className={styles.expiryWarning}>
                            {daysUntilExpiry}일 남음
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.couponFooter}>
                    <button className={styles.useCouponButton}>
                      쿠폰 사용하기
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}></div>
              <div className={styles.emptyTitle}>보유하신 쿠폰이 없습니다</div>
              <div className={styles.emptyDesc}>쿠폰을 등록하거나 이벤트에 참여해 쿠폰을 받아보세요.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
