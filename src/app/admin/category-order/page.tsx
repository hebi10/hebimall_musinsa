'use client';

import { useState, useEffect } from 'react';
import { CategoryOrderService } from '@/shared/services/categoryOrderService';
import styles from './page.module.css';

interface CategoryOrderItem {
  id: string;
  name: string;
  order: number;
}

export default function CategoryOrderPage() {
  const [categories, setCategories] = useState<CategoryOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCategoryOrder();
  }, []);

  const loadCategoryOrder = async () => {
    try {
      setLoading(true);
      const sortedCategories = await CategoryOrderService.getSortedCategories();
      setCategories(sortedCategories);
      setError(null);
    } catch (err) {
      console.error('카테고리 순서 로딩 실패:', err);
      setError('카테고리 순서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    
    const newCategories = [...categories];
    [newCategories[index], newCategories[index - 1]] = 
    [newCategories[index - 1], newCategories[index]];
    
    // 순서 재정렬
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx
    }));
    
    setCategories(updatedCategories);
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = 
    [newCategories[index + 1], newCategories[index]];
    
    // 순서 재정렬
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx
    }));
    
    setCategories(updatedCategories);
  };

  const saveOrder = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const newOrder = categories.map(cat => cat.name);
      await CategoryOrderService.updateCategoryOrder(
        newOrder, 
        'mainPageOrder', 
        '관리자 페이지에서 설정된 카테고리 순서'
      );
      
      setSuccess('카테고리 순서가 성공적으로 저장되었습니다!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('카테고리 순서 저장 실패:', err);
      setError('카테고리 순서 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultOrder = [
      '상의', '하의', '신발', '상의', '스포츠', '아웃도어', '가방', '주얼리', '액세서리'
    ];
    
    const resetCategories = defaultOrder.map((name, index) => ({
      id: name.toLowerCase(),
      name,
      order: index
    }));
    
    setCategories(resetCategories);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>카테고리 순서 관리</h1>
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>카테고리 순서 관리</h1>
        <p className={styles.description}>
          화살표 버튼을 사용하여 메인 페이지에 표시될 카테고리 순서를 변경할 수 있습니다.
        </p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <span className={styles.errorIcon}>❌</span>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successAlert}>
          <span className={styles.successIcon}>✅</span>
          {success}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.controls}>
          <button 
            onClick={resetToDefault} 
            className={styles.resetButton}
            disabled={saving}
          >
            기본 순서로 리셋
          </button>
          <button 
            onClick={saveOrder} 
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? '저장 중...' : '순서 저장'}
          </button>
        </div>

        <div className={styles.categoryList}>
          {categories.map((category, index) => (
            <div key={category.id} className={styles.categoryItem}>
              <div className={styles.categoryNumber}>
                {index + 1}
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryId}>ID: {category.id}</p>
              </div>
              <div className={styles.categoryControls}>
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || saving}
                  className={styles.moveButton}
                  title="위로 이동"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === categories.length - 1 || saving}
                  className={styles.moveButton}
                  title="아래로 이동"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>현재 순서</h3>
          <div className={styles.previewList}>
            {categories.map((cat, index) => (
              <span key={cat.id} className={styles.previewItem}>
                {index + 1}. {cat.name}
                {index < categories.length - 1 && ' → '}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
