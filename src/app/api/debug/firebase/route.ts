import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/libs/firebase/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    console.log('🔍 Firebase 데이터 디버깅 시작...');
    
    // 카테고리 목록 확인
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    const result: {
      categories: any[];
      targetProduct: any;
      allProducts: any[];
    } = {
      categories: [],
      targetProduct: null,
      allProducts: []
    };
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      
      try {
        const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
        console.log(`  └─ 상품 ${productsSnapshot.size}개`);
        
        const products: any[] = [];
        
        productsSnapshot.forEach(productDoc => {
          const productData = productDoc.data();
          const product = {
            id: productDoc.id,
            name: productData.name || '이름 없음',
            category: categoryId
          };
          
          products.push(product);
          result.allProducts.push(product);
          
          console.log(`    - ${productDoc.id}: ${productData.name || '이름 없음'}`);
          
          // 특정 상품 ID 찾기
          if (productId && productDoc.id === productId) {
            result.targetProduct = {
              ...product,
              data: productData
            };
            console.log(`✅ 타겟 상품 발견! 카테고리: ${categoryId}`);
          }
        });
        
        result.categories.push({
          id: categoryId,
          productCount: productsSnapshot.size,
          products: products
        });
        
      } catch (error) {
        console.error(`❌ ${categoryId} 상품 조회 실패:`, error);
        result.categories.push({
          id: categoryId,
          productCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Firebase 디버깅 실패:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
