'use client';

import { useState, useEffect } from 'react';
import styles from './EditModal.module.css';
import useInputs from '@/shared/hooks/useInput';
import { Product } from '@/shared/types/product';
import { 
  uploadProductImages, 
  deleteProductImage, 
  validateImageFiles,
  createPreviewUrl,
  revokePreviewUrl 
} from '@/shared/libs/firebase/storage';
import { getCategoryNames } from '@/shared/utils/categoryUtils';

interface EditProductModalProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onClose: () => void;
}

export default function EditProductModal({ product, onSave, onClose }: EditProductModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategoryNames();
        setCategories(Object.entries(categoriesData).map(([id, name]) => ({ id, name })));
      } catch (error) {
        console.error('카테고리 목록 로드 실패:', error);
        // 기본 카테고리 설정 (fallback)
        setCategories([
          { id: 'tops', name: '상의' },
          { id: 'bottoms', name: '하의' },
          { id: 'shoes', name: '신발' },
          { id: 'accessories', name: '액세서리' },
          { id: 'bags', name: '가방' }
        ]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
    material: product.details.material || '',
    origin: product.details.origin || '',
    manufacturer: product.details.manufacturer || '',
    precautions: product.details.precautions || ''
  });

  // 복잡한 필드들은 별도 state로 관리
  const [complexFields, setComplexFields] = useState({
    images: product.images || [],
    mainImage: product.mainImage || '', // 기존 대표 이미지만 사용, 없으면 빈 문자열
    sizes: product.sizes || [],
    colors: product.colors || [],
    tags: product.tags || [],
    isNew: product.isNew || false,
    isSale: product.isSale || false,
    status: product.status || 'active' as 'active' | 'inactive' | 'draft'
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

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    try {
      setUploading(true);
      console.log('이미지 업로드 시작:', files.length, '개 파일');
      
      // 파일 유효성 검사
      const fileArray = Array.from(files);
      const { valid, errors } = validateImageFiles(fileArray);
      
      if (errors.length > 0) {
        console.warn('파일 유효성 검사 오류:', errors);
        alert(errors.join('\n'));
        if (valid.length === 0) {
          setUploading(false);
          return;
        }
      }
      
      console.log('유효한 파일:', valid.length, '개');
      
      // 카테고리별 구조화된 경로로 업로드: images/{category}/{productId}/
      const uploadedUrls = await uploadProductImages(
        valid,
        basicFields.category,
        product.id,
        (progress: number, fileName: string) => {
          console.log(`업로드 진행률: ${fileName} - ${progress}%`);
          setUploadProgress(prev => ({
            ...prev,
            [fileName]: progress
          }));
        }
      );
      
      console.log('이미지 업로드 완료:', uploadedUrls);
      
      setComplexFields(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        // 대표 이미지가 없을 때만 첫 번째 업로드된 이미지로 설정
        mainImage: prev.mainImage || (uploadedUrls.length > 0 ? uploadedUrls[0] : '')
      }));
      
      setUploadProgress({});
      alert(`${uploadedUrls.length}개의 이미지가 성공적으로 업로드되었습니다.`);
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      alert(`이미지 업로드 실패: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string, index: number) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      console.log('이미지 삭제 시작:', imageUrl);
      
      // Firebase Storage에서 이미지 삭제
      await deleteProductImage(imageUrl);
      
      // 상태에서 이미지 제거
      const newImages = complexFields.images.filter((_, i) => i !== index);
      setComplexFields(prev => ({
        ...prev,
        images: newImages,
        // 삭제된 이미지가 대표 이미지였다면 첫 번째 이미지로 변경
        mainImage: prev.mainImage === imageUrl 
          ? (newImages.length > 0 ? newImages[0] : '') 
          : prev.mainImage
      }));
      
      console.log('이미지 삭제 완료');
      alert('이미지가 성공적으로 삭제되었습니다.');
      
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '이미지 삭제에 실패했습니다.';
      alert(`이미지 삭제 실패: ${errorMessage}`);
    }
  };

  // 대표 이미지 설정 함수
  const handleSetMainImage = (imageUrl: string) => {
    setComplexFields(prev => ({
      ...prev,
      mainImage: imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('상품 수정 시작...');
      
      // 필수 필드 검증
      if (!basicFields.name.trim()) {
        alert('상품명을 입력해주세요.');
        return;
      }
      
      if (!basicFields.brand.trim()) {
        alert('브랜드를 입력해주세요.');
        return;
      }
      
      if (!basicFields.category) {
        alert('카테고리를 선택해주세요.');
        return;
      }
      
      if (!basicFields.description.trim()) {
        alert('상품 설명을 입력해주세요.');
        return;
      }
      
      if (Number(basicFields.price) <= 0) {
        alert('올바른 가격을 입력해주세요.');
        return;
      }
      
      if (Number(basicFields.stock) < 0) {
        alert('올바른 재고 수량을 입력해주세요.');
        return;
      }
      
      // Firestore는 undefined 값을 허용하지 않으므로, undefined 필드들을 제거하거나 기본값으로 설정
      const updatedProduct: Product = {
        ...product,
        name: basicFields.name.trim(),
        description: basicFields.description.trim(),
        price: Number(basicFields.price),
        brand: basicFields.brand.trim(),
        category: basicFields.category,
        stock: Number(basicFields.stock),
        images: complexFields.images,
        mainImage: complexFields.mainImage, // 대표 이미지 추가
        sizes: complexFields.sizes,
        colors: complexFields.colors,
        tags: complexFields.tags,
        isNew: complexFields.isNew,
        isSale: complexFields.isSale,
        status: complexFields.status,
        updatedAt: new Date(),
        details: {
          ...product.details,
          material: basicFields.material?.trim() || '',
          origin: basicFields.origin?.trim() || '',
          manufacturer: basicFields.manufacturer?.trim() || '',
          precautions: basicFields.precautions?.trim() || ''
        }
      };

      // 조건부로 필드 추가 (undefined 값 방지)
      if (basicFields.originalPrice && Number(basicFields.originalPrice) > 0) {
        updatedProduct.originalPrice = Number(basicFields.originalPrice);
      }

      if (basicFields.sku?.trim()) {
        updatedProduct.sku = basicFields.sku.trim();
      }

      if (basicFields.saleRate && Number(basicFields.saleRate) > 0) {
        updatedProduct.saleRate = Number(basicFields.saleRate);
      }
      
      console.log('업데이트할 상품 데이터:', updatedProduct);
      
      await onSave(updatedProduct);
      
      console.log('상품 수정 완료');
      // 성공 메시지는 부모 컴포넌트에서 처리하고 모달 닫기도 부모에서 처리
      
    } catch (error) {
      console.error('상품 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '상품 수정에 실패했습니다.';
      alert(`상품 수정 실패: ${errorMessage}`);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h1>상품 수정</h1>
          <button 
            onClick={onClose} 
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
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
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

          {/* 이미지 관리 섹션 */}
          <div className={styles.section}>
            <h3>상품 이미지</h3>
            
            <div className={styles.formGroup}>
              <label>이미지 업로드</label>
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(e) => {
                    if (e.target.files) {
                      handleImageUpload(e.target.files);
                    }
                  }}
                  disabled={uploading}
                />
                <p className={styles.uploadText}>
                  {uploading ? '업로드 중...' : '이미지를 선택하거나 드래그 앤 드롭으로 업로드하세요'}
                </p>
              </div>
              
              {/* 업로드 진행률 표시 */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className={styles.uploadProgress}>
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className={styles.progressItem}>
                      <span>{fileName}</span>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 이미지 미리보기 */}
              {complexFields.images.length > 0 && (
                <div className={styles.imagePreview}>
                  <p className={styles.imageGuide}>
                    이미지를 클릭하여 대표 이미지로 설정하세요. 
                    {!complexFields.mainImage && '현재 대표 이미지가 설정되지 않았습니다.'}
                  </p>
                  {complexFields.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`${styles.imageItem} ${
                        complexFields.mainImage === image ? styles.mainImage : ''
                      }`}
                      onClick={() => handleSetMainImage(image)}
                    >
                      <img src={image} alt={`Product ${index + 1}`} />
                      <div className={styles.imageActions}>
                        <span className={`${styles.imageOrder} ${
                          complexFields.mainImage === image ? styles.mainImageBadge : ''
                        }`}>
                          {complexFields.mainImage === image ? '대표' : 
                           (!complexFields.mainImage && index === 0 ? '추천' : index + 1)}
                        </span>
                        <button 
                          type="button" 
                          className={styles.deleteImageButton}
                          onClick={(e) => {
                            e.stopPropagation(); // 클릭 이벤트 버블링 방지
                            handleImageDelete(image, index);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                      {complexFields.mainImage === image && (
                        <div className={styles.mainImageOverlay}>
                          <span>대표 이미지</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
            >
              취소
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={uploading}
            >
              {uploading ? '업로드 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
