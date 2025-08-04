import ProductDetailClient from '../../[productId]/ProductDetailClient';
import { mockProducts } from '../../../../mocks/products';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
