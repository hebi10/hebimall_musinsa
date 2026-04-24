'use client';

import React from 'react';
import RecentProducts from '../_components/RecentProducts';
import styles from './page.module.css';

export default function RecentlyViewedPage() {
  return (
    <div className={styles.container}>
      <RecentProducts />
    </div>
  );
}
