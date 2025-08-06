import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../src/shared/libs/firebase/firebase';
import { mockProducts, mockCategories, mockBrands } from '../src/mocks/products';
import { Product } from '../src/shared/types/product';

// Firebase에서 Date 객체를 Timestamp로 변환하기 위한 함수
const convertProductForFirestore = (product: Product) => {
  return {
    ...product,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const seedProducts = async () => {
  console.log('🌱 상품 시드 데이터를 Firebase에 추가 중...');
  
  try {
    const batch = writeBatch(db);
    const productsRef = collection(db, 'products');

    mockProducts.forEach((product) => {
      const productDoc = doc(productsRef, product.id);
      const firestoreProduct = convertProductForFirestore(product);
      batch.set(productDoc, firestoreProduct);
    });

    await batch.commit();
    console.log(`✅ ${mockProducts.length}개의 상품이 성공적으로 추가되었습니다.`);
  } catch (error) {
    console.error('❌ 상품 추가 중 오류 발생:', error);
    throw error;
  }
};

const seedCategories = async () => {
  console.log('🌱 카테고리 시드 데이터를 Firebase에 추가 중...');
  
  try {
    const batch = writeBatch(db);
    const categoriesRef = collection(db, 'categories');

    mockCategories.forEach((category) => {
      const categoryDoc = doc(categoriesRef, category.id);
      batch.set(categoryDoc, category);
    });

    await batch.commit();
    console.log(`✅ ${mockCategories.length}개의 카테고리가 성공적으로 추가되었습니다.`);
  } catch (error) {
    console.error('❌ 카테고리 추가 중 오류 발생:', error);
    throw error;
  }
};

const seedBrands = async () => {
  console.log('🌱 브랜드 시드 데이터를 Firebase에 추가 중...');
  
  try {
    const batch = writeBatch(db);
    const brandsRef = collection(db, 'brands');

    mockBrands.forEach((brand) => {
      const brandDoc = doc(brandsRef, brand.id);
      batch.set(brandDoc, brand);
    });

    await batch.commit();
    console.log(`✅ ${mockBrands.length}개의 브랜드가 성공적으로 추가되었습니다.`);
  } catch (error) {
    console.error('❌ 브랜드 추가 중 오류 발생:', error);
    throw error;
  }
};

const seedAllData = async () => {
  console.log('🚀 Firebase 시드 데이터 추가 시작...\n');
  
  try {
    await seedCategories();
    await seedBrands();
    await seedProducts();
    
    console.log('\n🎉 모든 시드 데이터가 성공적으로 추가되었습니다!');
  } catch (error) {
    console.error('\n💥 시드 데이터 추가 중 오류 발생:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  seedAllData();
}

export { seedProducts, seedCategories, seedBrands, seedAllData };
