"use client";

import { usePointBalance } from "@/shared/hooks/usePoint";
import styles from "../layout.module.css";
import { useCoupon } from "@/context/couponProvider";

interface ProfileSectionProps {
  userInfo: {
    name: string;
    email: string;
    membershipLevel: string;
    orders: number;
    reviews: number;
    coupons: number;
  };
}

export default function ProfileSection({ userInfo }: ProfileSectionProps) {
  const { data: balanceData, isLoading: isBalanceLoading } = usePointBalance();
  const pointBalance = balanceData?.pointBalance || 0;
  const { userCoupons } = useCoupon();
  const availableCouponCount = userCoupons.filter(coupon => coupon.status === "사용가능").length;

  return (
    <div className={styles.profileSection}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {userInfo.name.charAt(0)}
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{userInfo.name}님</h2>
          <p className={styles.profileEmail}>{userInfo.email}</p>
          <span className={styles.membershipLevel}>{userInfo.membershipLevel} 회원</span>
        </div>
      </div>
      
      <div className={styles.profileStats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{userInfo.orders}</div>
          <div className={styles.statLabel}>총 주문</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{userInfo.reviews}</div>
          <div className={styles.statLabel}>작성 리뷰</div>
        </div>
        <div className={styles.statItem}>
          {isBalanceLoading ? (
            <div className={styles.statNumber}>로딩중...</div>
          ) : (
            <div className={styles.statNumber}>{pointBalance.toLocaleString()}</div>
          )}
          <div className={styles.statLabel}>적립금</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{availableCouponCount}</div>
          <div className={styles.statLabel}>쿠폰</div>
        </div>
      </div>
    </div>
  );
}
