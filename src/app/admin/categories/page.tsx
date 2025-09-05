'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    id: '',
    name: '',
    description: '',
    order: 1,
    isActive: true,
    icon: '📦',
    color: '#007bff'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Category[];
      
      // order로 정렬
      categoryList.sort((a, b) => a.order - b.order);
      setCategories(categoryList);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      alert('카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      await updateDoc(doc(db, 'categories', category.id), {
        name: category.name,
        description: category.description,
        order: category.order,
        isActive: category.isActive,
        icon: category.icon,
        color: category.color,
        updatedAt: new Date()
      });
      
      await loadCategories();
      setEditingCategory(null);
      alert('카테고리가 수정되었습니다.');
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
      alert('카테고리 수정에 실패했습니다.');
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.id || !newCategory.name) {
        alert('ID와 이름은 필수입니다.');
        return;
      }

      await addDoc(collection(db, 'categories'), {
        ...newCategory,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await loadCategories();
      setShowAddForm(false);
      setNewCategory({
        id: '',
        name: '',
        description: '',
        order: 1,
        isActive: true,
        icon: '📦',
        color: '#007bff'
      });
      alert('새 카테고리가 추가되었습니다.');
    } catch (error) {
      console.error('카테고리 추가 실패:', error);
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      await loadCategories();
      alert('카테고리가 삭제되었습니다.');
    } catch (error) {
      console.error('카테고리 삭제 실패:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      await updateDoc(doc(db, 'categories', category.id), {
        isActive: !category.isActive,
        updatedAt: new Date()
      });
      await loadCategories();
    } catch (error) {
      console.error('카테고리 상태 변경 실패:', error);
      alert('카테고리 상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>카테고리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>카테고리 관리</h1>
        <p className={styles.subtitle}>쇼핑몰의 카테고리를 관리하고 수정할 수 있습니다.</p>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          + 새 카테고리 추가
        </button>
      </div>

      {showAddForm && (
        <div className={styles.addForm}>
          <h3>새 카테고리 추가</h3>
          <div className={styles.formGroup}>
            <label>카테고리 ID:</label>
            <input
              type="text"
              value={newCategory.id}
              onChange={(e) => setNewCategory({...newCategory, id: e.target.value})}
              placeholder="예: electronics"
            />
          </div>
          <div className={styles.formGroup}>
            <label>카테고리 이름:</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              placeholder="예: 전자제품"
            />
          </div>
          <div className={styles.formGroup}>
            <label>설명:</label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              placeholder="카테고리 설명을 입력하세요"
            />
          </div>
          <div className={styles.formGroup}>
            <label>순서:</label>
            <input
              type="number"
              value={newCategory.order}
              onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>아이콘:</label>
            <input
              type="text"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
              placeholder="📦"
            />
          </div>
          <div className={styles.formGroup}>
            <label>색상:</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
            />
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveButton} onClick={handleAddCategory}>
              추가
            </button>
            <button className={styles.cancelButton} onClick={() => setShowAddForm(false)}>
              취소
            </button>
          </div>
        </div>
      )}

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryIcon} style={{ backgroundColor: category.color }}>
                {category.icon}
              </div>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryId}>ID: {category.id}</p>
              </div>
              <div className={styles.categoryStatus}>
                <span className={`${styles.statusBadge} ${category.isActive ? styles.active : styles.inactive}`}>
                  {category.isActive ? '활성' : '비활성'}
                </span>
              </div>
            </div>

            <div className={styles.categoryContent}>
              <p className={styles.categoryDescription}>{category.description}</p>
              <div className={styles.categoryMeta}>
                <span>순서: {category.order}</span>
                <span>색상: {category.color}</span>
              </div>
            </div>

            <div className={styles.categoryActions}>
              <button 
                className={styles.editButton}
                onClick={() => setEditingCategory(category)}
              >
                수정
              </button>
              <button 
                className={`${styles.toggleButton} ${category.isActive ? styles.deactivate : styles.activate}`}
                onClick={() => toggleCategoryStatus(category)}
              >
                {category.isActive ? '비활성화' : '활성화'}
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteCategory(category.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingCategory && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>카테고리 수정</h3>
            <div className={styles.formGroup}>
              <label>카테고리 이름:</label>
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>설명:</label>
              <textarea
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>순서:</label>
              <input
                type="number"
                value={editingCategory.order}
                onChange={(e) => setEditingCategory({...editingCategory, order: parseInt(e.target.value)})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>아이콘:</label>
              <input
                type="text"
                value={editingCategory.icon}
                onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>색상:</label>
              <input
                type="color"
                value={editingCategory.color}
                onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
              />
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.saveButton}
                onClick={() => handleSaveCategory(editingCategory)}
              >
                저장
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setEditingCategory(null)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.summary}>
        <h3>카테고리 통계</h3>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{categories.length}</span>
            <span className={styles.statLabel}>총 카테고리</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{categories.filter(c => c.isActive).length}</span>
            <span className={styles.statLabel}>활성 카테고리</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{categories.filter(c => !c.isActive).length}</span>
            <span className={styles.statLabel}>비활성 카테고리</span>
          </div>
        </div>
      </div>
    </div>
  );
}
