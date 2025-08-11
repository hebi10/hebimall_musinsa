import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryBasedProductService } from '@/shared/services/categoryBasedProductService';
import ProductCard from '@/app/products/_components/ProductCard';
import styles from './CategoryPage.module.css';

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  
  const categoryNames: Record<string, string> = {
    'clothing': '의류',
    'bags': '가방',
    'accessories': '액세서리',
    'shoes': '신발'
  };

  const categoryName = categoryNames[categoryId] || categoryId;

  return {
    title: `${categoryName} - HEBIMALL`,
    description: `HEBIMALL의 ${categoryName} 카테고리 상품을 둘러보세요.`
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  const categoryNames: Record<string, string> = {
    'clothing': '의류',
    'bags': '가방', 
    'accessories': '액세서리',
    'shoes': '신발'
  };

  const categoryName = categoryNames[categoryId];

  if (!categoryName) {
    console.log('❌ 존재하지 않는 카테고리:', categoryId);
    notFound();
  }

  try {
    console.log('🔍 카테고리 페이지 로드:', categoryId);
    
    // Firebase에서 해당 카테고리의 상품들 가져오기
    const products = await CategoryBasedProductService.getProductsByCategory(categoryId);
    
    console.log(`✅ ${categoryName} 카테고리 상품 로드 완료:`, products.length, '개');

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{categoryName}</h1>
          <p className={styles.description}>
            총 {products.length}개의 상품이 있습니다.
          </p>
        </div>

        {products.length > 0 ? (
          <div className={styles.productGrid}>
            {products.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                originalPrice={product.originalPrice}
                isNew={product.isNew}
                isSale={product.isSale}
                saleRate={product.saleRate}
                rating={product.rating}
                reviewCount={product.reviewCount}
                image={product.images[0]}
                stock={product.stock}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>아직 등록된 상품이 없습니다</h3>
            <p>새로운 {categoryName} 상품이 곧 업데이트 될 예정입니다.</p>
          </div>
        )}
      </div>
    );
    
  } catch (error) {
    console.error('카테고리 페이지 로드 실패:', error);
    notFound();
  }
}
