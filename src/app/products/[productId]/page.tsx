import { Metadata } from 'next';
import ProductDetailClient from '../_components/ProductDetailClient';
import { CategoryOnlyProductService } from '@/shared/services/hybridProductService';
import { serializeProduct } from '@/shared/utils/serialize';
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
        title: '상품을 찾을 수 없습니다 - STYNA',
        description: 'STYNA에서 다양한 상품을 만나보세요.',
        openGraph: {
          title: '상품을 찾을 수 없습니다 - STYNA',
          description: 'STYNA에서 다양한 상품을 만나보세요.',
          images: ['/thum.png'],
        },
      };
    }
    
    const productImage = product.mainImage || (product.images && product.images[0]) || '/thum.png';
    const formattedPrice = new Intl.NumberFormat('ko-KR').format(product.price);
    const description = `${product.description} | 가격: ${formattedPrice}원 | STYNA`;
    
    return {
      title: `${product.name} - ${product.brand} | STYNA`,
      description: description,
      keywords: [product.name, product.brand, product.category, '쇼핑몰', 'STYNA', ...(product.tags || [])],
      openGraph: {
        title: `${product.name} - ${product.brand}`,
        description: description,
        images: [
          {
            url: productImage,
            width: 800,
            height: 800,
            alt: `${product.name} - ${product.brand}`,
            type: 'image/jpeg',
          }
        ],
        type: 'website',
        siteName: 'STYNA',
        url: `https://hebimall.web.app/products/${productId}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${product.brand}`,
        description: description,
        images: [productImage],
      },
      alternates: {
        canonical: `https://hebimall.web.app/products/${productId}`,
      },
    };
  } catch (error) {
    console.error('메타데이터 생성 실패:', error);
    return {
      title: '상품을 찾을 수 없습니다 - STYNA',
      description: 'STYNA에서 다양한 상품을 만나보세요.',
      openGraph: {
        title: '상품을 찾을 수 없습니다 - STYNA',
        description: 'STYNA에서 다양한 상품을 만나보세요.',
        images: ['/thum.png'],
      },
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

    // 직렬화하여 Timestamp 객체 문제 해결
    const serializedProduct = serializeProduct(product);

    return <ProductDetailClient product={serializedProduct} />;
    
  } catch (error) {
    console.error('상품 상세 페이지 로드 실패:', error);
    notFound();
  }
}