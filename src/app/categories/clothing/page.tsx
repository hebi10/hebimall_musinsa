'use client';

import React from 'react';
import styles from './page.module.css';

const ClothingPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>의류</h1>
          <p className={styles.heroSubtitle}>
            트렌디하고 편안한 의류로 완성하는 나만의 스타일
          </p>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.productsGrid}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingIcon}>👕</div>
            <p className={styles.loadingText}>의류 상품을 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingPage;