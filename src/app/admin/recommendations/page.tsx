'use client';

import { useState, useEffect } from 'react';
import { useProduct } from '@/context/productProvider';
import { Product } from '@/shared/types/product';
import styles from './page.module.css';

interface RecommendSettings {
  id: string;
  type: 'rating' | 'review' | 'sale' | 'new' | 'manual';
  name: string;
  description: string;
  isActive: boolean;
  criteria: {
    minRating?: number;
    minReviews?: number;
    minSaleRate?: number;
    maxDaysOld?: number;
  };
  productIds?: string[];
  order: number;
}

export default function RecommendationsAdminPage() {
  const { products, loading, loadProducts } = useProduct();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentSettings, setCurrentSettings] = useState<RecommendSettings[]>([
    {
      id: 'rating',
      type: 'rating',
      name: '높은 평점 상품',
      description: '평점 4.3 이상의 우수한 상품들',
      isActive: true,
      criteria: { minRating: 4.3, minReviews: 50 },
      order: 1
    },
    {
      id: 'review',
      type: 'review', 
      name: '리뷰 많은 상품',
      description: '리뷰 80개 이상의 인기 상품들',
      isActive: true,
      criteria: { minReviews: 80 },
      order: 2
    },
    {
      id: 'sale',
      type: 'sale',
      name: '할인 상품',
      description: '현재 할인 중인 특가 상품들',
      isActive: true,
      criteria: { minSaleRate: 15 },
      order: 3
    },
    {
      id: 'new',
      type: 'new',
      name: '신상품',
      description: '최근 30일 내 출시된 상품들',
      isActive: true,
      criteria: { maxDaysOld: 30 },
      order: 4
    },
    {
      id: 'manual',
      type: 'manual',
      name: '수동 선택 상품',
      description: '관리자가 직접 선택한 추천 상품들',
      isActive: false,
      criteria: {},
      productIds: [],
      order: 5
    }
  ]);

  const [editingSettings, setEditingSettings] = useState<RecommendSettings | null>(null);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  // 설정에 따른 상품 필터링
  const getProductsBySettings = (settings: RecommendSettings): Product[] => {
    if (settings.type === 'manual') {
      return products.filter(p => settings.productIds?.includes(p.id));
    }

    let filtered = [...products];

    switch (settings.type) {
      case 'rating':
        filtered = filtered.filter(p => 
          p.rating >= (settings.criteria.minRating || 4.3) &&
          p.reviewCount >= (settings.criteria.minReviews || 50)
        ).sort((a, b) => b.rating - a.rating);
        break;
        
      case 'review':
        filtered = filtered.filter(p => 
          p.reviewCount >= (settings.criteria.minReviews || 80)
        ).sort((a, b) => b.reviewCount - a.reviewCount);
        break;
        
      case 'sale':
        filtered = filtered.filter(p => 
          p.isSale && 
          p.saleRate && 
          p.saleRate >= (settings.criteria.minSaleRate || 15)
        ).sort((a, b) => (b.saleRate || 0) - (a.saleRate || 0));
        break;
        
      case 'new':
        const maxDays = settings.criteria.maxDaysOld || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxDays);
        
        filtered = filtered.filter(p => 
          p.isNew || new Date(p.createdAt) >= cutoffDate
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered.slice(0, 20);
  };

  // 설정 미리보기
  const handlePreview = (settings: RecommendSettings) => {
    const filtered = getProductsBySettings(settings);
    setPreviewProducts(filtered);
  };

  // 설정 수정
  const handleEditSettings = (settings: RecommendSettings) => {
    setEditingSettings({...settings});
  };

  // 설정 저장
  const handleSaveSettings = () => {
    if (!editingSettings) return;
    
    setCurrentSettings(prev => 
      prev.map(s => s.id === editingSettings.id ? editingSettings : s)
    );
    setEditingSettings(null);
    
    // 실제로는 Firebase에 저장
    console.log('설정 저장:', editingSettings);
  };

  // 활성화 토글
  const toggleActive = (id: string) => {
    setCurrentSettings(prev =>
      prev.map(s => s.id === id ? {...s, isActive: !s.isActive} : s)
    );
  };

  // 수동 선택 상품 관리
  const handleManualProductSelection = (productId: string, selected: boolean) => {
    if (editingSettings?.type === 'manual') {
      const productIds = editingSettings.productIds || [];
      if (selected) {
        setEditingSettings({
          ...editingSettings,
          productIds: [...productIds, productId]
        });
      } else {
        setEditingSettings({
          ...editingSettings,
          productIds: productIds.filter(id => id !== productId)
        });
      }
    }
  };

  const totalActiveSettings = currentSettings.filter(s => s.isActive).length;
  const totalRecommendedProducts = currentSettings
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + getProductsBySettings(s).length, 0);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>추천 상품 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>⭐ 추천 상품 관리</h1>
        <p>추천 알고리즘 설정 및 수동 추천 상품을 관리합니다</p>
        
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>활성 설정</span>
            <span className={styles.summaryValue}>{totalActiveSettings}개</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>총 추천 상품</span>
            <span className={styles.summaryValue}>{totalRecommendedProducts}개</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>전체 상품</span>
            <span className={styles.summaryValue}>{products.length}개</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* 추천 설정 목록 */}
        <div className={styles.settingsSection}>
          <h2>추천 설정</h2>
          
          <div className={styles.settingsList}>
            {currentSettings.map((settings) => {
              const recommendedProducts = getProductsBySettings(settings);
              
              return (
                <div key={settings.id} className={styles.settingsCard}>
                  <div className={styles.settingsHeader}>
                    <div className={styles.settingsInfo}>
                      <h3>{settings.name}</h3>
                      <p>{settings.description}</p>
                    </div>
                    
                    <div className={styles.settingsActions}>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settings.isActive}
                          onChange={() => toggleActive(settings.id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                      
                      <button 
                        onClick={() => handleEditSettings(settings)}
                        className={styles.editButton}
                      >
                        설정
                      </button>
                      
                      <button 
                        onClick={() => handlePreview(settings)}
                        className={styles.previewButton}
                      >
                        미리보기
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.settingsStats}>
                    <span className={styles.statItem}>
                      📊 {recommendedProducts.length}개 상품
                    </span>
                    <span className={styles.statItem}>
                      🔥 {settings.isActive ? '활성' : '비활성'}
                    </span>
                    <span className={styles.statItem}>
                      📅 순서: {settings.order}
                    </span>
                  </div>
                  
                  {/* 기준 표시 */}
                  <div className={styles.criteria}>
                    {settings.criteria.minRating && (
                      <span className={styles.criteriaItem}>
                        ⭐ 평점 {settings.criteria.minRating}점 이상
                      </span>
                    )}
                    {settings.criteria.minReviews && (
                      <span className={styles.criteriaItem}>
                        💬 리뷰 {settings.criteria.minReviews}개 이상
                      </span>
                    )}
                    {settings.criteria.minSaleRate && (
                      <span className={styles.criteriaItem}>
                        🔥 할인율 {settings.criteria.minSaleRate}% 이상
                      </span>
                    )}
                    {settings.criteria.maxDaysOld && (
                      <span className={styles.criteriaItem}>
                        ✨ {settings.criteria.maxDaysOld}일 이내 신상품
                      </span>
                    )}
                    {settings.type === 'manual' && (
                      <span className={styles.criteriaItem}>
                        👤 수동 선택 ({settings.productIds?.length || 0}개)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 설정 편집 모달 */}
        {editingSettings && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingSettings.name} 설정</h3>
                <button 
                  onClick={() => setEditingSettings(null)}
                  className={styles.closeButton}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>설정 이름</label>
                  <input
                    type="text"
                    value={editingSettings.name}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      name: e.target.value
                    })}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>설명</label>
                  <textarea
                    value={editingSettings.description}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      description: e.target.value
                    })}
                  />
                </div>
                
                {editingSettings.type === 'rating' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>최소 평점</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editingSettings.criteria.minRating || 4.3}
                        onChange={(e) => setEditingSettings({
                          ...editingSettings,
                          criteria: {
                            ...editingSettings.criteria,
                            minRating: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>최소 리뷰 수</label>
                      <input
                        type="number"
                        min="0"
                        value={editingSettings.criteria.minReviews || 50}
                        onChange={(e) => setEditingSettings({
                          ...editingSettings,
                          criteria: {
                            ...editingSettings.criteria,
                            minReviews: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </>
                )}
                
                {editingSettings.type === 'review' && (
                  <div className={styles.formGroup}>
                    <label>최소 리뷰 수</label>
                    <input
                      type="number"
                      min="0"
                      value={editingSettings.criteria.minReviews || 80}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        criteria: {
                          ...editingSettings.criteria,
                          minReviews: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                )}
                
                {editingSettings.type === 'sale' && (
                  <div className={styles.formGroup}>
                    <label>최소 할인율 (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingSettings.criteria.minSaleRate || 15}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        criteria: {
                          ...editingSettings.criteria,
                          minSaleRate: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                )}
                
                {editingSettings.type === 'new' && (
                  <div className={styles.formGroup}>
                    <label>신상품 기준 (일)</label>
                    <input
                      type="number"
                      min="1"
                      value={editingSettings.criteria.maxDaysOld || 30}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        criteria: {
                          ...editingSettings.criteria,
                          maxDaysOld: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                )}
                
                {editingSettings.type === 'manual' && (
                  <div className={styles.manualSelection}>
                    <h4>수동 선택 상품 ({editingSettings.productIds?.length || 0}개)</h4>
                    <div className={styles.productsList}>
                      {products.map((product) => (
                        <div key={product.id} className={styles.productItem}>
                          <label className={styles.productLabel}>
                            <input
                              type="checkbox"
                              checked={editingSettings.productIds?.includes(product.id) || false}
                              onChange={(e) => handleManualProductSelection(
                                product.id, 
                                e.target.checked
                              )}
                            />
                            <div className={styles.productInfo}>
                              <span className={styles.productName}>{product.name}</span>
                              <span className={styles.productDetails}>
                                {product.brand} | ⭐{product.rating} | 💬{product.reviewCount}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  onClick={() => setEditingSettings(null)}
                  className={styles.cancelButton}
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className={styles.saveButton}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 미리보기 섹션 */}
        {previewProducts.length > 0 && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h3>🔍 미리보기 ({previewProducts.length}개)</h3>
              <button 
                onClick={() => setPreviewProducts([])}
                className={styles.closePreviewButton}
              >
                닫기
              </button>
            </div>
            
            <div className={styles.previewGrid}>
              {previewProducts.slice(0, 12).map((product) => (
                <div key={product.id} className={styles.previewCard}>
                  <div className={styles.previewImage}>
                    {product.mainImage ? (
                      <img src={product.mainImage} alt={product.name} />
                    ) : (
                      <div className={styles.placeholderImage}>
                        📦
                      </div>
                    )}
                  </div>
                  <div className={styles.previewInfo}>
                    <h4>{product.name}</h4>
                    <p>{product.brand}</p>
                    <div className={styles.previewStats}>
                      <span>⭐ {product.rating}</span>
                      <span>💬 {product.reviewCount}</span>
                      {product.isSale && <span>🔥 {product.saleRate}%</span>}
                    </div>
                    <div className={styles.previewPrice}>
                      {product.price.toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {previewProducts.length > 12 && (
              <p className={styles.moreInfo}>
                +{previewProducts.length - 12}개 상품 더 있음
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
