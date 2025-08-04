import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: {
    productId: string;
  };
}

// Mock 데이터 - 실제로는 API에서 가져올 데이터
const mockProduct = {
  id: 'product-1',
  name: '프리미엄 코튼 티셔츠',
  description: '부드러운 코튼 소재로 제작된 프리미엄 티셔츠입니다.',
  price: 29900,
  originalPrice: 39900,
  brand: 'HEBIMALL',
  category: '상의',
  images: [
    '/images/products/tshirt-1.jpg',
    '/images/products/tshirt-2.jpg',
    '/images/products/tshirt-3.jpg',
    '/images/products/tshirt-4.jpg'
  ],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['black', 'white', 'navy', 'gray'],
  stock: 50,
  rating: 4.5,
  reviewCount: 128,
  isNew: true,
  isSale: true,
  saleRate: 25,
  tags: ['베스트', '신상', 'SALE'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  details: {
    material: '코튼 100%',
    origin: '한국',
    manufacturer: 'HEBIMALL',
    precautions: '찬물 세탁, 건조기 사용 금지',
    sizes: {
      S: { chest: 50, length: 67, shoulder: 44 },
      M: { chest: 53, length: 70, shoulder: 46 },
      L: { chest: 56, length: 73, shoulder: 48 },
      XL: { chest: 59, length: 76, shoulder: 50 }
    }
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 실제로는 API에서 제품 정보를 가져와서 메타데이터 생성
  const product = mockProduct;
  
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

export default function ProductDetailPage({ params }: Props) {
  const { productId } = params;
  
  // 실제로는 API에서 제품 정보를 가져옴
  if (!mockProduct) {
    notFound();
  }

  return <ProductDetailClient product={mockProduct} />;
}
