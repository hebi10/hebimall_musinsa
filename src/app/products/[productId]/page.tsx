import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { mockProducts } from '@/mocks/products';

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  // 실제로는 API에서 제품 정보를 가져와서 메타데이터 생성
  const product = mockProducts.find(p => p.id === productId);
  
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
      images: [product.images[0]]
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params;
  
  // 실제로는 API에서 제품 정보를 가져옴
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
