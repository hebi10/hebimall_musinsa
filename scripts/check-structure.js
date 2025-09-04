const { db } = require('./firebase-config');
const { collection, getDocs } = require('firebase/firestore');

async function checkFirebaseStructure() {
  try {
    console.log('🔍 Firebase 컬렉션 구조 확인...\n');
    
    // 카테고리 확인
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log('📁 Categories 컬렉션:');
    categoriesSnapshot.forEach(doc => {
      console.log(`  - ${doc.id}: ${doc.data().name}`);
    });
    
    // 상품 확인
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.log('\n📦 Products 컬렉션:');
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (카테고리: ${data.category})`);
    });
    
    console.log('\n📊 현재 구조 분석:');
    console.log('✅ 현재: 단일 컬렉션 방식');
    console.log('   - categories/ (카테고리 정보)');
    console.log('   - products/ (모든 상품, category 필드로 분류)');
    
    console.log('\n❌ 사용자 요청: 중첩 컬렉션 방식');
    console.log('   - categories/shoes/products/productId');
    console.log('   - categories/clothing/products/productId');
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error);
  }
}

checkFirebaseStructure().then(() => process.exit(0));
