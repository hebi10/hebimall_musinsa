import Link from "next/link";
import styles from "../layout.module.css";

interface SidebarMenuProps {
  activeTab: string;
  logout: () => void;
}

export default function SidebarMenu({ activeTab, logout }: SidebarMenuProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarTitle}>마이메뉴</h3>
        <nav className={styles.sidebarMenu}>
          <Link 
            href="/mypage/order-list" 
            className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`}
          >
            주문내역
          </Link>
          <Link 
            href="/mypage/qa" 
            className={`${styles.menuItem} ${activeTab === 'reviews' ? styles.active : ''}`}
          >
            문의관리
          </Link>
          <Link 
            href="/mypage/recently-viewed" 
            className={`${styles.menuItem} ${activeTab === 'wishlist' ? styles.active : ''}`}
          >
            최근본상품
          </Link>
          <Link 
            href="/mypage/wishlist" 
            className={`${styles.menuItem} ${activeTab === 'favorite' ? styles.active : ''}`}
          >
            찜한상품
          </Link>
          <Link 
            href="/mypage/coupons" 
            className={`${styles.menuItem} ${activeTab === 'coupons' ? styles.active : ''}`}
          >
            쿠폰관리
          </Link>
          <Link 
            href="/mypage/point" 
            className={`${styles.menuItem} ${activeTab === 'point' ? styles.active : ''}`}
          >
            적립금
          </Link>
          <Link 
            href="/mypage/info-edit" 
            className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`}
          >
            회원정보수정
          </Link>
          <Link 
            href="/mypage/counsel" 
            className={`${styles.menuItem} ${activeTab === 'counsel' ? styles.active : ''}`}
          >
            상담내역
          </Link>
          <Link 
            href="/mypage/restock" 
            className={`${styles.menuItem} ${activeTab === 'restock' ? styles.active : ''}`}
          >
            재입고알림
          </Link>
          <button
            className={styles.menuItem}
            onClick={logout}
          >
            로그아웃
          </button>
        </nav>
      </div>
    </div>
  );
}
