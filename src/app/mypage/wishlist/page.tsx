'use client';

import React from 'react';
import WishlistProducts from '../_components/WishlistProducts';
import styles from './page.module.css';

export default function WishlistPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>찜한 상품</h1>
        <p>관심 있는 상품들을 모아보세요</p>
      </div>
      
      <div className={styles.content}>
        <WishlistProducts />
      </div>
    </div>
  );
}
