'use client';

import React from 'react';
import styles from './page.module.css';

const ShoesPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>신발</h1>
          <p className={styles.heroSubtitle}>
            편안하고 스타일리시한 신발로 완벽한 발걸음을
          </p>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.productsGrid}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingIcon}>👟</div>
            <p className={styles.loadingText}>신발 상품을 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoesPage;