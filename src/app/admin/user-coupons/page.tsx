'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function AdminUserCouponsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>사용자 쿠폰 지급</h1>
        <p>개별 사용자 지급 기능은 서버 검증 경계 정리 후 다시 제공됩니다</p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>기능 준비 중</h3>
          <div className={styles.assignDisabled}>
            <p>
              사용자 지정 쿠폰 지급은 대상 사용자 확인, 중복 지급 방지, 발급 이력 기록이 서버에서
              함께 처리되어야 합니다. 현재 화면에서는 실제 지급처럼 보이는 임시 성공 처리를
              제거했습니다.
            </p>
            <p>
              쿠폰 생성과 비활성화는 기존 쿠폰 관리 화면에서 계속 처리할 수 있습니다.
            </p>
            <Link href="/admin/coupons" className={styles.assignBtn}>
              쿠폰 관리로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
