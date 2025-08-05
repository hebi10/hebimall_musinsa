'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AddModal.module.css';

interface Product {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
}

export default function AddProductModal() {
  const router = useRouter();
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [product, setProduct] = useState<Product>({
    name: '',
    price: 0,
    description: '',
    category: '',
    stock: 0,
    images: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('상품 추가:', product);
    
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h1>상품 추가</h1>
          <button 
            onClick={handleClose} 
            className={styles.closeButton}
            type="button"
          >
            ✕
          </button>
        </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">상품명 *</label>
          <input
            type="text"
            id="name"
            value={product.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="상품명을 입력하세요"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">가격 *</label>
            <input
              type="number"
              id="price"
              value={product.price || ''}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              required
              placeholder="0"
              min="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="stock">재고 수량 *</label>
            <input
              type="number"
              id="stock"
              value={product.stock || ''}
              onChange={(e) => handleInputChange('stock', Number(e.target.value))}
              required
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">카테고리 *</label>
          <select
            id="category"
            value={product.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
          >
            <option value="">카테고리를 선택하세요</option>
            <option value="clothing">의류</option>
            <option value="shoes">신발</option>
            <option value="accessories">액세서리</option>
            <option value="bags">가방</option>
            <option value="beauty">뷰티</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">상품 설명 *</label>
          <textarea
            id="description"
            value={product.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            placeholder="상품에 대한 자세한 설명을 입력하세요"
            rows={6}
          />
        </div>

        <div className={styles.formGroup}>
          <label>상품 이미지</label>
          <div className={styles.imageUpload}>
            <input
              type="file"
              multiple
              accept="image/*"
              className={styles.fileInput}
            />
            <p className={styles.uploadText}>
              이미지를 선택하거나 드래그 앤 드롭으로 업로드하세요
            </p>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={handleClose}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button type="submit" className={styles.submitButton}>
            상품 추가
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
