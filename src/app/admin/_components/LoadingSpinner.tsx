'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = '로딩 중...', 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.inner}></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
