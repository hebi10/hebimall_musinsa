import { Metadata } from 'next';
import ProductDetailClient from '../_components/ProductDetailClient';
import { CategoryOnlyProductService } from '@/shared/services/hybridProductService';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  
  try {
    const product = await CategoryOnlyProductService.getProductById(productId);
    
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
        images: product.images && product.images.length > 0 ? [product.images[0]] : []
      }
    };
  } catch (error) {
    console.error('메타데이터 생성 실패:', error);
    return {
      title: '상품을 찾을 수 없습니다 - HEBIMALL'
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  
  try {
    const product = await CategoryOnlyProductService.getProductById(productId);
    
    if (!product) {
      notFound();
    }

    return <ProductDetailClient product={product} />;
    
  } catch (error) {
    console.error('상품 상세 페이지 로드 실패:', error);
    notFound();
  }
}