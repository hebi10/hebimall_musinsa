const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCurrentStructure() {
  console.log('🔍 현재 구조 확인\n');
  
  // 1. 카테고리 목록
  console.log(' 카테고리 목록:');
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  categoriesSnapshot.docs.forEach(doc => {
    const data = doc.data();
  });
  
  // 2. 전체 상품
  console.log('\n📦 전체 상품:');
  const productsSnapshot = await getDocs(collection(db, 'products'));
  console.log(`   총 ${productsSnapshot.size}개 상품`);
  
  const categoryCount = {};
  const productDetails = [];
  
  productsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    categoryCount[data.category] = (categoryCount[data.category] || 0) + 1;
    productDetails.push({
      id: doc.id,
      name: data.name,
      category: data.category
    });
  });
  
  console.log('\n카테고리별 상품 분포:');
  Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}개`);
  });
  
  console.log('\n📝 상품 목록 (처음 5개):');
  productDetails.slice(0, 5).forEach(product => {
    console.log(`   ${product.id}: ${product.name} (${product.category})`);
  });
  
  // 3. 원하는 카테고리 목록과 비교
  const targetCategories = ['accessories', 'bags', 'bottoms', 'clothing', 'shoes', 'tops'];
  console.log('\n🎯 원하는 카테고리:');
  targetCategories.forEach(cat => {
    const exists = categoriesSnapshot.docs.some(doc => doc.id === cat);
    const hasProducts = categoryCount[cat] || 0;
    console.log(`   ${cat}: ${exists ? '✅' : '❌'} 존재, ${hasProducts}개 상품`);
  });
}

checkCurrentStructure().then(() => process.exit(0)).catch(console.error);
