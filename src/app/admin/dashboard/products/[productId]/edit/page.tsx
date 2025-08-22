'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/context/productProvider';
import { useAuth } from '@/context/authProvider';
import { Product } from '@/shared/types/product';
import EditProductForm from '../../_components/EditProductForm';
import styles from './page.module.css';

interface ProductEditPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { getProductById, updateProduct } = useProduct();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { productId } = use(params);

  // 인증 및 권한 체크
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      router.push('/');
      return;
    }
  }, [user, isAdmin, authLoading, router]);

  // 상품 데이터 로드
  useEffect(() => {
    if (!productId || !user || !isAdmin) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading product with ID:', productId);
        const productData = await getProductById(productId);
        if (!productData) {
          setError('상품을 찾을 수 없습니다.');
          return;
        }
        
        setProduct(productData);
      } catch (err) {
        console.error('상품 로드 실패:', err);
        setError('상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, getProductById, user, isAdmin]);

  // 상품 수정 처리
  const handleSave = async (updatedProduct: Product) => {
    try {
      await updateProduct(productId, updatedProduct);
      alert('상품이 성공적으로 수정되었습니다.');
      router.push('/admin/dashboard/products');
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert('상품 수정에 실패했습니다.');
    }
  };

  // 취소 처리
  const handleCancel = () => {
    if (confirm('변경사항이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
      router.push('/admin/dashboard/products');
    }
  };

  // 로딩 중이거나 권한이 없으면 표시하지 않음
  if (authLoading || !user || !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>권한을 확인하는 중...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>상품 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>오류 발생</h2>
          <p>{error || '상품을 불러올 수 없습니다.'}</p>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/admin/dashboard/products')}
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>상품 편집</h1>
        <div className={styles.breadcrumb}>
          <span onClick={() => router.push('/admin')}>관리자</span>
          <span className={styles.separator}>/</span>
          <span onClick={() => router.push('/admin/dashboard/products')}>상품 관리</span>
          <span className={styles.separator}>/</span>
          <span>편집</span>
        </div>
      </div>

      <div className={styles.content}>
        <EditProductForm
          product={product}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
