import Link from "next/link";
import styles from "./adminNav.module.css";

export default function AdminNav() {
  return (
    <nav className={styles.adminNav}>
      <Link href="/admin" className={styles.navLink}>
        📊 대시보드
      </Link>
      <Link href="/admin/categories" className={styles.navLink}>
        📂 카테고리 관리
      </Link>
      <Link href="/admin/dashboard/users" className={styles.navLink}>
        👥 사용자 관리
      </Link>
      <Link href="/admin/dashboard/products" className={styles.navLink}>
        📦 상품 관리
      </Link>
      <Link href="/admin/dashboard/orders" className={styles.navLink}>
        🛒 주문 관리
      </Link>
    </nav>
  );
}
