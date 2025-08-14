import { use } from 'react';
import styles from './page.module.css';

// 동적 배포에서는 generateStaticParams 불필요

export default function ProductEditModal({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>상품 편집</h2>
        <p>상품 ID: {productId}</p>
        <div className={styles.buttonContainer}>
          <button className={styles.cancelButton}>취소</button>
          <button className={styles.saveButton}>저장</button>
        </div>
      </div>
    </div>
  );
}