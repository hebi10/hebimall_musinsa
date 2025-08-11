'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProduct } from '@/context/productProvider';
import { Product } from '@/shared/types/product';
import EditModal from '@/app/admin/_components/EditModal';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, loadProductById, currentProduct, updateProduct } = useProduct();
  const [loading, setLoading] = useState(true);

  const productId = params.productId as string;
  
  console.log('📄 편집 페이지 - params:', params);
  console.log('🆔 추출된 productId:', productId);

  useEffect(() => {
    console.log("인터셉팅, 패러렐 X - 새로운 구조");
    const loadProduct = async () => {
      if (productId) {
        console.log('🔄 상품 로드 시작:', productId);
        try {
          const product = await getProductById(productId);
          console.log('🔍 getProductById 결과:', product);
          if (product) {
            // currentProduct 상태도 설정 (EditModal에서 사용)
            await loadProductById(productId);
            console.log('✅ 상품 로드 성공');
          } else {
            console.log('❌ 상품이 null로 반환됨');
          }
        } catch (error) {
          console.error('상품 로드 실패:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('❌ productId가 없음');
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, getProductById, loadProductById]);

  const handleSave = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct.id, updatedProduct);
      router.push('/admin/dashboard/products');
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert('상품 수정에 실패했습니다.');
    }
  };

  const handleClose = () => {
    router.push('/admin/dashboard/products');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        fontSize: '16px'
      }}>
        상품 정보를 불러오는 중...
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px'
      }}>
        <div style={{ fontSize: '16px' }}>상품을 찾을 수 없습니다.</div>
        <button 
          onClick={handleClose}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <EditModal
      product={currentProduct}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}
