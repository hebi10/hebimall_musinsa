'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/shared/types/category';
import { CategoryService } from '@/shared/services/categoryService';
import styles from './page.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    path: '',
    description: '',
    icon: '',
    order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await CategoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        path: category.path,
        description: category.description || '',
        icon: category.icon || '',
        order: category.order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        path: '',
        description: '',
        icon: '',
        order: categories.length,
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      path: '',
      description: '',
      icon: '',
      order: 0,
    });
    setImageFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 이름이 변경되면 자동으로 slug와 path 생성
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        slug,
        path: `/categories/${slug}`
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = editingCategory?.imageUrl;

      // 이미지 업로드
      if (imageFile) {
        const tempId = editingCategory?.id || `temp_${Date.now()}`;
        imageUrl = await CategoryService.uploadCategoryImage(imageFile, tempId);
      }

      const categoryData = {
        ...formData,
        imageUrl,
      };

      if (editingCategory) {
        // 수정
        const updateData: UpdateCategoryRequest = {
          id: editingCategory.id,
          ...categoryData,
        };
        await CategoryService.updateCategory(updateData);
      } else {
        // 생성
        await CategoryService.createCategory(categoryData);
      }

      await fetchCategories();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리 저장에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await CategoryService.deleteCategory(category.id);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리 삭제에 실패했습니다.');
    }
  };

  const handleOrderChange = async (categoryId: string, newOrder: number) => {
    try {
      const updatedCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, order: newOrder };
        }
        return cat;
      });

      const orderUpdates = updatedCategories.map(cat => ({
        id: cat.id,
        order: cat.order
      }));

      await CategoryService.updateCategoryOrder(orderUpdates);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '순서 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>카테고리를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>카테고리 관리</h1>
        <button className={styles.addButton} onClick={() => openModal()}>
          새 카테고리 추가
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)} className={styles.errorClose}>
            ×
          </button>
        </div>
      )}

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryImage}>
              {category.imageUrl ? (
                <img src={category.imageUrl} alt={category.name} />
              ) : category.icon ? (
                <span className={styles.categoryIcon}>{category.icon}</span>
              ) : (
                <span className={styles.placeholder}>📦</span>
              )}
            </div>
            
            <div className={styles.categoryInfo}>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <p className={styles.categoryPath}>{category.path}</p>
              <p className={styles.categoryDescription}>{category.description}</p>
              
              <div className={styles.categoryMeta}>
                <span className={`${styles.status} ${category.isActive ? styles.active : styles.inactive}`}>
                  {category.isActive ? '활성' : '비활성'}
                </span>
                <span className={styles.order}>순서: {category.order}</span>
              </div>
            </div>

            <div className={styles.categoryActions}>
              <button 
                className={styles.editButton}
                onClick={() => openModal(category)}
              >
                수정
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDelete(category)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
            </h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">카테고리 이름*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slug">슬러그*</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="path">경로*</label>
                <input
                  type="text"
                  id="path"
                  name="path"
                  value={formData.path}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">설명</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="icon">아이콘 (이모지)</label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="📦"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="order">순서*</label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image">카테고리 이미지</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {editingCategory?.imageUrl && (
                  <div className={styles.currentImage}>
                    <p>현재 이미지:</p>
                    <img src={editingCategory.imageUrl} alt="현재 이미지" />
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>
                  취소
                </button>
                <button type="submit" disabled={uploading} className={styles.submitButton}>
                  {uploading ? '저장 중...' : editingCategory ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
