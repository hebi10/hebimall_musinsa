import { ReactNode } from 'react';
import styles from './layout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>STYNA</h1>
          <p className={styles.subtitle}>패션을 위한 모든 것</p>
        </div>
        {children}
      </div>
      <div className={styles.backgroundPattern}></div>
    </div>
  );
}
