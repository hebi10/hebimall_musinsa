'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './EventNavigation.module.css';

export default function EventNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/events', label: '이벤트 목록', icon: '📋' },
    { href: '/admin/events/create', label: '새 이벤트', icon: '➕' },
  ];

  return (
    <nav className={styles.navigation}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
