'use client';

import React from 'react';
import WishlistProducts from '../_components/WishlistProducts';
import styles from './page.module.css';

export default function WishlistPage() {
  return (
    <div className={styles.container}>
      <WishlistProducts />
    </div>
  );
}
