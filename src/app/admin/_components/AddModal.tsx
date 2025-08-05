'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AddModal.module.css';
import useInputs from '@/shared/hooks/useInput';
import { Product } from '@/shared/types/product';
import { generateId } from '@/shared/utils/common';

export default function AddProductModal() {
  const router = useRouter();
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // useInputs로 기본 필드들 관리
  const [basicFields, onChangeBasic] = useInputs({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    brand: '',
    category: '',
    stock: '',
    sku: '',
    saleRate: '',
    material: '',
    origin: '',
    manufacturer: '',
    precautions: ''
  });

  // 복잡한 필드들은 별도 state로 관리
  const [complexFields, setComplexFields] = useState({
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    tags: [] as string[],
    isNew: false,
    isSale: false,
    status: 'draft' as 'active' | 'inactive' | 'draft'
  });

  const handleComplexFieldChange = (field: keyof typeof complexFields, value: any) => {
    setComplexFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field: 'sizes' | 'colors' | 'tags', value: string) => {
    if (value.trim() && !complexFields[field].includes(value.trim())) {
      setComplexFields(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: 'sizes' | 'colors' | 'tags', index: number) => {
    setComplexFields(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: Product = {
      id: generateId(),
      name: basicFields.name,
      description: basicFields.description,
      price: Number(basicFields.price),
      originalPrice: basicFields.originalPrice ? Number(basicFields.originalPrice) : undefined,
      brand: basicFields.brand,
      category: basicFields.category,
      stock: Number(basicFields.stock),
      sku: basicFields.sku || undefined,
      saleRate: basicFields.saleRate ? Number(basicFields.saleRate) : undefined,
      images: complexFields.images,
      sizes: complexFields.sizes,
      colors: complexFields.colors,
      tags: complexFields.tags,
      isNew: complexFields.isNew,
      isSale: complexFields.isSale,
      status: complexFields.status,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      details: {
        material: basicFields.material,
        origin: basicFields.origin,
        manufacturer: basicFields.manufacturer,
        precautions: basicFields.precautions,
        sizes: {}
      }
    };
    
    console.log('상품 추가:', newProduct);
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
          {/* 기본 정보 섹션 */}
          <div className={styles.section}>
            <h3>기본 정보</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">상품명 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={basicFields.name}
                onChange={onChangeBasic}
                required
                placeholder="상품명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="brand">브랜드 *</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={basicFields.brand}
                onChange={onChangeBasic}
                required
                placeholder="브랜드명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sku">SKU</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={basicFields.sku}
                onChange={onChangeBasic}
                placeholder="SKU를 입력하세요"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price">판매가격 *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={basicFields.price}
                  onChange={onChangeBasic}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="originalPrice">정가</label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={basicFields.originalPrice}
                  onChange={onChangeBasic}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="stock">재고 수량 *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={basicFields.stock}
                  onChange={onChangeBasic}
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
                name="category"
                value={basicFields.category}
                onChange={onChangeBasic}
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
                name="description"
                value={basicFields.description}
                onChange={onChangeBasic}
                required
                placeholder="상품에 대한 자세한 설명을 입력하세요"
                rows={6}
              />
            </div>
          </div>

          {/* 판매 설정 섹션 */}
          <div className={styles.section}>
            <h3>판매 설정</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="status">상품 상태 *</label>
                <select
                  id="status"
                  value={complexFields.status}
                  onChange={(e) => handleComplexFieldChange('status', e.target.value as 'active' | 'inactive' | 'draft')}
                  required
                >
                  <option value="draft">임시저장</option>
                  <option value="active">판매중</option>
                  <option value="inactive">판매중지</option>
                </select>
              </div>

              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={complexFields.isNew}
                    onChange={(e) => handleComplexFieldChange('isNew', e.target.checked)}
                  />
                  신상품
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={complexFields.isSale}
                    onChange={(e) => handleComplexFieldChange('isSale', e.target.checked)}
                  />
                  할인상품
                </label>
              </div>
            </div>

            {complexFields.isSale && (
              <div className={styles.formGroup}>
                <label htmlFor="saleRate">할인율 (%)</label>
                <input
                  type="number"
                  id="saleRate"
                  name="saleRate"
                  value={basicFields.saleRate}
                  onChange={onChangeBasic}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            )}
          </div>

          {/* 옵션 섹션 */}
          <div className={styles.section}>
            <h3>상품 옵션</h3>
            
            <div className={styles.formGroup}>
              <label>사이즈</label>
              <div className={styles.arrayInput}>
                <input
                  type="text"
                  placeholder="사이즈를 입력하고 Enter를 누르세요 (예: S, M, L)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('sizes', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {complexFields.sizes.map((size, index) => (
                    <span key={index} className={styles.tag}>
                      {size}
                      <button type="button" onClick={() => handleArrayRemove('sizes', index)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>색상</label>
              <div className={styles.arrayInput}>
                <input
                  type="text"
                  placeholder="색상을 입력하고 Enter를 누르세요 (예: 블랙, 화이트)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('colors', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {complexFields.colors.map((color, index) => (
                    <span key={index} className={styles.tag}>
                      {color}
                      <button type="button" onClick={() => handleArrayRemove('colors', index)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>태그</label>
              <div className={styles.arrayInput}>
                <input
                  type="text"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('tags', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {complexFields.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                      <button type="button" onClick={() => handleArrayRemove('tags', index)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 상세 정보 섹션 */}
          <div className={styles.section}>
            <h3>상세 정보</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="material">소재</label>
              <input
                type="text"
                id="material"
                name="material"
                value={basicFields.material}
                onChange={onChangeBasic}
                placeholder="소재 정보를 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="origin">원산지</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={basicFields.origin}
                onChange={onChangeBasic}
                placeholder="원산지를 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="manufacturer">제조사</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={basicFields.manufacturer}
                onChange={onChangeBasic}
                placeholder="제조사를 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="precautions">주의사항</label>
              <textarea
                id="precautions"
                name="precautions"
                value={basicFields.precautions}
                onChange={onChangeBasic}
                placeholder="세탁 방법, 보관 방법 등 주의사항을 입력하세요"
                rows={4}
              />
            </div>
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className={styles.section}>
            <h3>상품 이미지</h3>
            <div className={styles.formGroup}>
              <label>상품 이미지</label>
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const imageUrls = files.map(file => URL.createObjectURL(file));
                    handleComplexFieldChange('images', [...complexFields.images, ...imageUrls]);
                  }}
                />
                <p className={styles.uploadText}>
                  이미지를 선택하거나 드래그 앤 드롭으로 업로드하세요
                </p>
              </div>
              
              {complexFields.images.length > 0 && (
                <div className={styles.imagePreview}>
                  {complexFields.images.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newImages = complexFields.images.filter((_, i) => i !== index);
                          handleComplexFieldChange('images', newImages);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
