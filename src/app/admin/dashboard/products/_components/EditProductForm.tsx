'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/shared/types/product';
import useInputs from '@/shared/hooks/useInput';
import { 
  uploadProductImages, 
  deleteProductImage, 
  validateImageFiles,
  createPreviewUrl,
  revokePreviewUrl 
} from '@/shared/libs/firebase/storage';
import styles from './EditProductForm.module.css';

interface EditProductFormProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

export default function EditProductForm({ product, onSave, onCancel }: EditProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // useInputs로 기본 필드들 관리
  const [basicFields, onChangeBasic] = useInputs({
    name: product.name,
    price: product.price.toString(),
    originalPrice: product.originalPrice?.toString() || '',
    description: product.description,
    brand: product.brand,
    category: product.category,
    stock: product.stock.toString(),
    sku: product.sku || '',
    saleRate: product.saleRate?.toString() || '',
    material: product.details?.material || '',
    origin: product.details?.origin || '',
    manufacturer: product.details?.manufacturer || '',
    precautions: product.details?.precautions || ''
  });

  // 복잡한 필드들은 별도 state로 관리
  const [complexFields, setComplexFields] = useState({
    images: product.images || [],
    mainImage: product.mainImage || '',
    sizes: product.sizes || [],
    colors: product.colors || [],
    tags: product.tags || [],
    isNew: product.isNew || false,
    isSale: product.isSale || false,
    status: product.status || 'active',
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0
  });

  // 사이즈 관련 상태
  const [sizeDetails, setSizeDetails] = useState(product.details?.sizes || {});
  
  // 이미지 미리보기 URL 관리
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // 기존 이미지들의 미리보기 URL 생성
    if (complexFields.images.length > 0) {
      setPreviewUrls(complexFields.images);
    }

    return () => {
      // 컴포넌트 언마운트 시 미리보기 URL 정리
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          revokePreviewUrl(url);
        }
      });
    };
  }, []);

  // 이미지 업로드 처리
  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    try {
      // 파일 유효성 검사
      const validationResult = validateImageFiles(Array.from(files));
      if (validationResult.errors.length > 0) {
        alert(validationResult.errors.join('\n'));
        return;
      }

      setUploading(true);

      // 미리보기 URL 생성
      const newPreviewUrls = Array.from(files).map(file => createPreviewUrl(file));
      
      // 기존 미리보기에 추가
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Firebase Storage에 업로드
      const uploadResults = await uploadProductImages(
        Array.from(files),
        product.category,
        product.id,
        (progress: number, fileName: string) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: progress
          }));
        }
      );

      // 업로드된 이미지 URL을 상태에 추가
      const newImageUrls = uploadResults;
      setComplexFields(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }));

      // 첫 번째 이미지가 없으면 메인 이미지로 설정
      if (!complexFields.mainImage && newImageUrls.length > 0) {
        setComplexFields(prev => ({
          ...prev,
          mainImage: newImageUrls[0]
        }));
      }

      // 미리보기 URL을 실제 URL로 교체
      setPreviewUrls(prev => {
        const filtered = prev.filter(url => !newPreviewUrls.includes(url));
        return [...filtered, ...newImageUrls];
      });

      // 임시 미리보기 URL 정리
      newPreviewUrls.forEach(url => revokePreviewUrl(url));

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // 이미지 삭제 처리
  const handleImageDelete = async (imageUrl: string, index: number) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return;

    try {
      // Firebase Storage에서 이미지 삭제 (URL이 Firebase Storage URL인 경우만)
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        await deleteProductImage(imageUrl);
      }

      // 상태에서 이미지 제거
      setComplexFields(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));

      // 미리보기에서도 제거
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));

      // 삭제된 이미지가 메인 이미지였다면 첫 번째 이미지를 메인으로 설정
      if (complexFields.mainImage === imageUrl) {
        const remainingImages = complexFields.images.filter((_, i) => i !== index);
        setComplexFields(prev => ({
          ...prev,
          mainImage: remainingImages.length > 0 ? remainingImages[0] : ''
        }));
      }

    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };

  // 메인 이미지 설정
  const handleSetMainImage = (imageUrl: string) => {
    setComplexFields(prev => ({
      ...prev,
      mainImage: imageUrl
    }));
  };

  // 태그 추가
  const handleAddTag = (tag: string) => {
    if (tag.trim() && !complexFields.tags.includes(tag.trim())) {
      setComplexFields(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    setComplexFields(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 사이즈 추가
  const handleAddSize = (size: string) => {
    if (size.trim() && !complexFields.sizes.includes(size.trim())) {
      setComplexFields(prev => ({
        ...prev,
        sizes: [...prev.sizes, size.trim()]
      }));
    }
  };

  // 사이즈 제거
  const handleRemoveSize = (sizeToRemove: string) => {
    setComplexFields(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
    
    // 사이즈 상세 정보도 제거
    setSizeDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[sizeToRemove];
      return newDetails;
    });
  };

  // 색상 추가
  const handleAddColor = (color: string) => {
    if (color.trim() && !complexFields.colors.includes(color.trim())) {
      setComplexFields(prev => ({
        ...prev,
        colors: [...prev.colors, color.trim()]
      }));
    }
  };

  // 색상 제거
  const handleRemoveColor = (colorToRemove: string) => {
    setComplexFields(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  // 저장 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedProduct: Product = {
        ...product,
        name: basicFields.name,
        description: basicFields.description,
        price: parseInt(basicFields.price) || 0,
        originalPrice: basicFields.originalPrice ? parseInt(basicFields.originalPrice) : undefined,
        brand: basicFields.brand,
        category: basicFields.category,
        stock: parseInt(basicFields.stock) || 0,
        sku: basicFields.sku,
        saleRate: basicFields.saleRate ? parseInt(basicFields.saleRate) : undefined,
        images: complexFields.images,
        mainImage: complexFields.mainImage,
        sizes: complexFields.sizes,
        colors: complexFields.colors,
        tags: complexFields.tags,
        isNew: complexFields.isNew,
        isSale: complexFields.isSale,
        status: complexFields.status as 'active' | 'inactive' | 'draft',
        rating: complexFields.rating,
        reviewCount: complexFields.reviewCount,
        details: {
          ...product.details,
          material: basicFields.material,
          origin: basicFields.origin,
          manufacturer: basicFields.manufacturer,
          precautions: basicFields.precautions,
          sizes: sizeDetails
        },
        updatedAt: new Date()
      };

      await onSave(updatedProduct);
    } catch (error) {
      console.error('상품 저장 실패:', error);
      alert('상품 저장에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* 기본 정보 섹션 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>기본 정보</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>상품명 *</label>
          <input
            type="text"
            name="name"
            value={basicFields.name}
            onChange={onChangeBasic}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>브랜드 *</label>
            <input
              type="text"
              name="brand"
              value={basicFields.brand}
              onChange={onChangeBasic}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>카테고리 *</label>
            <select
              name="category"
              value={basicFields.category}
              onChange={onChangeBasic}
              className={styles.select}
              required
            >
              <option value="">카테고리 선택</option>
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="신발">신발</option>
              <option value="액세서리">액세서리</option>
              <option value="가방">가방</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>상품 설명</label>
          <textarea
            name="description"
            value={basicFields.description}
            onChange={onChangeBasic}
            className={styles.textarea}
            rows={4}
          />
        </div>
      </div>

      {/* 가격 정보 섹션 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>가격 정보</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>판매가 *</label>
            <input
              type="number"
              name="price"
              value={basicFields.price}
              onChange={onChangeBasic}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>정가</label>
            <input
              type="number"
              name="originalPrice"
              value={basicFields.originalPrice}
              onChange={onChangeBasic}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>할인율 (%)</label>
            <input
              type="number"
              name="saleRate"
              value={basicFields.saleRate}
              onChange={onChangeBasic}
              className={styles.input}
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* 재고 및 상태 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>재고 및 상태</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>재고 수량 *</label>
            <input
              type="number"
              name="stock"
              value={basicFields.stock}
              onChange={onChangeBasic}
              className={styles.input}
              required
              min="0"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>SKU</label>
            <input
              type="text"
              name="sku"
              value={basicFields.sku}
              onChange={onChangeBasic}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>상품 상태</label>
            <select
              value={complexFields.status}
              onChange={(e) => setComplexFields(prev => ({ 
                ...prev, 
                status: e.target.value as 'active' | 'inactive' | 'draft'
              }))}
              className={styles.select}
            >
              <option value="active">판매중</option>
              <option value="inactive">판매중지</option>
              <option value="draft">임시저장</option>
            </select>
          </div>
        </div>
      </div>

      {/* 상품 옵션 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>상품 옵션</h3>
        
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={complexFields.isNew}
              onChange={(e) => setComplexFields(prev => ({ ...prev, isNew: e.target.checked }))}
              className={styles.checkbox}
            />
            신상품
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={complexFields.isSale}
              onChange={(e) => setComplexFields(prev => ({ ...prev, isSale: e.target.checked }))}
              className={styles.checkbox}
            />
            할인상품
          </label>
        </div>
      </div>

      {/* 이미지 섹션 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>상품 이미지</h3>
        
        <div className={styles.imageUpload}>
          <input
            type="file"
            id="imageUpload"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className={styles.fileInput}
            disabled={uploading}
          />
          <label htmlFor="imageUpload" className={styles.uploadButton}>
            {uploading ? '업로드 중...' : '이미지 추가'}
          </label>
        </div>

        {previewUrls.length > 0 && (
          <div className={styles.imageGrid}>
            {previewUrls.map((url, index) => (
              <div key={index} className={styles.imageItem}>
                <img src={url} alt={`상품 이미지 ${index + 1}`} className={styles.image} />
                <div className={styles.imageActions}>
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(url)}
                    className={`${styles.mainButton} ${complexFields.mainImage === url ? styles.isMain : ''}`}
                    disabled={uploading}
                  >
                    {complexFields.mainImage === url ? '메인' : '메인으로'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageDelete(url, index)}
                    className={styles.deleteButton}
                    disabled={uploading}
                  >
                    삭제
                  </button>
                </div>
                {uploadProgress[`image_${index}`] && (
                  <div className={styles.progress}>
                    <div 
                      className={styles.progressBar}
                      style={{ width: `${uploadProgress[`image_${index}`]}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 정보 섹션 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>상세 정보</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>소재</label>
            <input
              type="text"
              name="material"
              value={basicFields.material}
              onChange={onChangeBasic}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>원산지</label>
            <input
              type="text"
              name="origin"
              value={basicFields.origin}
              onChange={onChangeBasic}
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>제조사</label>
            <input
              type="text"
              name="manufacturer"
              value={basicFields.manufacturer}
              onChange={onChangeBasic}
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>취급주의사항</label>
          <textarea
            name="precautions"
            value={basicFields.precautions}
            onChange={onChangeBasic}
            className={styles.textarea}
            rows={3}
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={uploading}
        >
          취소
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={uploading}
        >
          {uploading ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
