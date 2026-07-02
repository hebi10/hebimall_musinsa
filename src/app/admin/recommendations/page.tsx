'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useProducts } from '@/shared/hooks/useProducts';
import {
  useRecommendationSettings,
  useSaveRecommendationSetting,
} from '@/shared/hooks/useSiteContent';
import type { RecommendationSettingContent } from '@/shared/services/siteContentService';
import { Product } from '@/shared/types/product';
import styles from './page.module.css';

type RecommendSettings = RecommendationSettingContent;

export default function RecommendationsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSettings, setCurrentSettings] = useState<RecommendSettings[]>([]);
  const [editingSettings, setEditingSettings] = useState<RecommendSettings | null>(null);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetch: refetchProducts } = useProducts();
  const { refetch: refetchRecommendationSettings } = useRecommendationSettings();
  const saveRecommendationSetting = useSaveRecommendationSetting();

  useEffect(() => {
    Promise.all([
      refetchProducts().then((result) => result.data ?? []),
      refetchRecommendationSettings().then((result) => result.data ?? []),
    ])
      .then(([productsData, settingsData]) => {
        setProducts(productsData);
        setCurrentSettings(settingsData);
      })
      .catch((err) => {
        console.error('추천 설정 조회 실패:', err);
        setError('추천 설정을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [refetchProducts, refetchRecommendationSettings]);

  const getProductsBySettings = (settings: RecommendSettings): Product[] => {
    if (settings.type === 'manual') {
      return products.filter((product) => settings.productIds?.includes(product.id));
    }

    let filtered = [...products];

    switch (settings.type) {
      case 'rating':
        filtered = filtered
          .filter((product) =>
            product.rating >= (settings.criteria.minRating || 4.3) &&
            product.reviewCount >= (settings.criteria.minReviews || 50)
          )
          .sort((a, b) => b.rating - a.rating);
        break;
      case 'review':
        filtered = filtered
          .filter((product) => product.reviewCount >= (settings.criteria.minReviews || 80))
          .sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'sale':
        filtered = filtered
          .filter((product) => product.isSale && product.saleRate && product.saleRate >= (settings.criteria.minSaleRate || 15))
          .sort((a, b) => (b.saleRate || 0) - (a.saleRate || 0));
        break;
      case 'new': {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (settings.criteria.maxDaysOld || 30));
        filtered = filtered
          .filter((product) => product.isNew || new Date(product.createdAt).getTime() >= cutoffDate.getTime())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      }
      default:
        break;
    }

    return filtered.slice(0, 20);
  };

  const saveSetting = async (setting: RecommendSettings) => {
    setSaving(true);
    try {
      await saveRecommendationSetting.mutateAsync(setting);
      setCurrentSettings((prev) => prev.map((item) => item.id === setting.id ? setting : item));
      setEditingSettings(null);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    const setting = currentSettings.find((item) => item.id === id);
    if (!setting) return;
    await saveSetting({ ...setting, isActive: !setting.isActive });
  };

  const handleManualProductSelection = (productId: string, selected: boolean) => {
    if (editingSettings?.type !== 'manual') return;

    const productIds = editingSettings.productIds || [];
    setEditingSettings({
      ...editingSettings,
      productIds: selected
        ? [...productIds, productId]
        : productIds.filter((id) => id !== productId),
    });
  };

  const totalActiveSettings = currentSettings.filter((setting) => setting.isActive).length;
  const totalRecommendedProducts = currentSettings
    .filter((setting) => setting.isActive)
    .reduce((sum, setting) => sum + getProductsBySettings(setting).length, 0);

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>추천 설정을 불러오는 중입니다.</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.loading}>{error}</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>추천 상품 관리</h1>
        <p>Firestore 추천 설정을 기준으로 추천 상품을 미리보고 조정합니다</p>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>활성 설정</span>
            <span className={styles.summaryValue}>{totalActiveSettings}개</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>추천 상품</span>
            <span className={styles.summaryValue}>{totalRecommendedProducts}개</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>전체 상품</span>
            <span className={styles.summaryValue}>{products.length}개</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
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
                        <input type="checkbox" checked={settings.isActive} onChange={() => toggleActive(settings.id)} disabled={saving} />
                        <span className={styles.slider}></span>
                      </label>

                      <button onClick={() => setEditingSettings({ ...settings })} className={styles.editButton}>
                        설정
                      </button>

                      <button onClick={() => setPreviewProducts(recommendedProducts)} className={styles.previewButton}>
                        미리보기
                      </button>
                    </div>
                  </div>

                  <div className={styles.settingsStats}>
                    <span className={styles.statItem}>{recommendedProducts.length}개 상품</span>
                    <span className={styles.statItem}>{settings.isActive ? '활성' : '비활성'}</span>
                    <span className={styles.statItem}>순서: {settings.order}</span>
                  </div>

                  <div className={styles.criteria}>
                    {settings.criteria.minRating && <span className={styles.criteriaItem}>평점 {settings.criteria.minRating} 이상</span>}
                    {settings.criteria.minReviews && <span className={styles.criteriaItem}>리뷰 {settings.criteria.minReviews}개 이상</span>}
                    {settings.criteria.minSaleRate && <span className={styles.criteriaItem}>할인율 {settings.criteria.minSaleRate}% 이상</span>}
                    {settings.criteria.maxDaysOld && <span className={styles.criteriaItem}>{settings.criteria.maxDaysOld}일 이내 신상품</span>}
                    {settings.type === 'manual' && <span className={styles.criteriaItem}>수동 선택 {settings.productIds?.length || 0}개</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {editingSettings && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingSettings.name} 설정</h3>
                <button onClick={() => setEditingSettings(null)} className={styles.closeButton}>×</button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>설정 이름</label>
                  <input type="text" value={editingSettings.name} onChange={(e) => setEditingSettings({ ...editingSettings, name: e.target.value })} />
                </div>

                <div className={styles.formGroup}>
                  <label>설명</label>
                  <textarea value={editingSettings.description} onChange={(e) => setEditingSettings({ ...editingSettings, description: e.target.value })} />
                </div>

                {editingSettings.type === 'manual' ? (
                  <div className={styles.manualSelection}>
                    <h4>수동 선택 상품 ({editingSettings.productIds?.length || 0}개)</h4>
                    <div className={styles.productsList}>
                      {products.map((product) => (
                        <div key={product.id} className={styles.productItem}>
                          <label className={styles.productLabel}>
                            <input
                              type="checkbox"
                              checked={editingSettings.productIds?.includes(product.id) || false}
                              onChange={(e) => handleManualProductSelection(product.id, e.target.checked)}
                            />
                            <div className={styles.productInfo}>
                              <span className={styles.productName}>{product.name}</span>
                              <span className={styles.productDetails}>{product.brand} | {product.rating} | {product.reviewCount}</span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <CriteriaEditor setting={editingSettings} onChange={setEditingSettings} />
                )}
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setEditingSettings(null)} className={styles.cancelButton}>취소</button>
                <button onClick={() => saveSetting(editingSettings)} className={styles.saveButton} disabled={saving}>
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {previewProducts.length > 0 && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h3>미리보기 ({previewProducts.length}개)</h3>
              <button onClick={() => setPreviewProducts([])} className={styles.closePreviewButton}>닫기</button>
            </div>

            <div className={styles.previewGrid}>
              {previewProducts.slice(0, 12).map((product) => (
                <div key={product.id} className={styles.previewCard}>
                  <div className={styles.previewImage}>
                    {product.mainImage ? (
                      <Image src={product.mainImage} alt={product.name} width={160} height={160} unoptimized />
                    ) : (
                      <div className={styles.placeholderImage}></div>
                    )}
                  </div>
                  <div className={styles.previewInfo}>
                    <h4>{product.name}</h4>
                    <p>{product.brand}</p>
                    <div className={styles.previewStats}>
                      <span>{product.rating}</span>
                      <span>{product.reviewCount}</span>
                      {product.isSale && <span>{product.saleRate}%</span>}
                    </div>
                    <div className={styles.previewPrice}>{product.price.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>

            {previewProducts.length > 12 && <p className={styles.moreInfo}>+{previewProducts.length - 12}개 상품 더 있음</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function CriteriaEditor({
  setting,
  onChange,
}: {
  setting: RecommendSettings;
  onChange: (setting: RecommendSettings) => void;
}) {
  const updateCriteria = (key: keyof RecommendSettings['criteria'], value: number) => {
    onChange({ ...setting, criteria: { ...setting.criteria, [key]: value } });
  };

  return (
    <>
      {setting.type === 'rating' && (
        <>
          <NumberField label="최소 평점" value={setting.criteria.minRating || 4.3} step="0.1" max={5} onChange={(value) => updateCriteria('minRating', value)} />
          <NumberField label="최소 리뷰 수" value={setting.criteria.minReviews || 50} onChange={(value) => updateCriteria('minReviews', value)} />
        </>
      )}
      {setting.type === 'review' && (
        <NumberField label="최소 리뷰 수" value={setting.criteria.minReviews || 80} onChange={(value) => updateCriteria('minReviews', value)} />
      )}
      {setting.type === 'sale' && (
        <NumberField label="최소 할인율 (%)" value={setting.criteria.minSaleRate || 15} max={100} onChange={(value) => updateCriteria('minSaleRate', value)} />
      )}
      {setting.type === 'new' && (
        <NumberField label="신상품 기준 (일)" value={setting.criteria.maxDaysOld || 30} min={1} onChange={(value) => updateCriteria('maxDaysOld', value)} />
      )}
    </>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = '1',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
