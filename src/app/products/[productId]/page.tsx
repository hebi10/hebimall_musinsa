import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from '../_components/ProductDetailClient';
import { CategoryBasedProductService } from '@/shared/services/categoryBasedProductService';

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  
  try {
    // Firebase에서 상품 정보 가져오기
    const product = await CategoryBasedProductService.findProductById(productId);
    
    if (!product) {
      return {
        title: '상품을 찾을 수 없습니다 - HEBIMALL'
      };
    }
    
    return {
      title: `${product.name} - HEBIMALL`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images.length > 0 ? [product.images[0]] : []
      }
    };
  } catch (error) {
    console.error('메타데이터 생성 실패:', error);
    return {
      title: '상품을 찾을 수 없습니다 - HEBIMALL'
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params;
  
  try {
    // Firebase에서 상품 정보 가져오기
    const product = await CategoryBasedProductService.findProductById(productId);
    
    if (!product) {
      console.log('❌ 상품을 찾을 수 없음:', productId);
      notFound();
    }

    return <ProductDetailClient product={product} />;
    
  } catch (error) {
    console.error('상품 상세 페이지 로드 실패:', error);
    notFound();
  }
}
