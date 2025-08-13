import ProductDetailClient from '../../_components/ProductDetailClient';
import { CategoryBasedProductService } from '@/shared/services/categoryBasedProductService';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  
  try {
    console.log('🔍 상품 상세 페이지 로드 (products/products 경로):', productId);
    
    // Firebase에서 상품 정보 가져오기
    const product = await CategoryBasedProductService.findProductById(productId);
    
    if (!product) {
      console.log('❌ 상품을 찾을 수 없음:', productId);
      notFound();
    }

    console.log('✅ 상품 정보 로드 완료:', product.name);
    return <ProductDetailClient product={product} />;
    
  } catch (error) {
    console.error('상품 상세 페이지 로드 실패:', error);
    notFound();
  }
}
