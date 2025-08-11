'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProduct } from '@/context/productProvider';
import { Product } from '@/shared/types/product';
import EditModal from '@/app/admin/_components/EditModal';

export default function EditProductModal() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, loadProductById, currentProduct, updateProduct } = useProduct();
  const [loading, setLoading] = useState(true);

  const productId = params.productId as string;

  useEffect(() => {
    console.log("인터셉팅, 패러렐 O - 새로운 구조");
    const loadProduct = async () => {
      if (productId) {
        try {
          const product = await getProductById(productId);
          console.log('🔍 getProductById 결과:', product);
          if (product) {
            // currentProduct 상태도 설정 (EditModal에서 사용)
            await loadProductById(productId);
            console.log('✅ 모달용 상품 로드 성공');
          } else {
            console.log('❌ 모달에서 상품이 null로 반환됨');
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
      console.log('💾 상품 업데이트 시작:', updatedProduct.id);
      
      const result = await updateProduct(updatedProduct.id, updatedProduct);
      
      console.log('✅ 상품 업데이트 성공:', result);
      
      // 성공 메시지는 EditModal에서 처리
      router.back();
      
    } catch (error) {
      console.error('❌ 상품 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '상품 수정에 실패했습니다.';
      alert(`상품 수정 실패: ${errorMessage}`);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '16px'
        }}>
          상품 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '16px'
        }}>
          상품을 찾을 수 없습니다.
          <button 
            onClick={handleClose}
            style={{
              marginLeft: '10px',
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
        </div>
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
