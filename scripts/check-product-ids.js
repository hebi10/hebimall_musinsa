const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBUv3D8_Z5G7sSUCi9YvQwKgJf3NKgQYjo",
  authDomain: "hebimall.firebaseapp.com",
  projectId: "hebimall",
  storageBucket: "hebimall.firebasestorage.app",
  messagingSenderId: "461569816406",
  appId: "1:461569816406:web:3d7c59c4a9cd44f0b93b14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getProductIds() {
  try {
    console.log('상품 ID 목록을 가져오는 중...');
    
    const categories = ['accessories', 'bags', 'clothing', 'jewelry', 'outdoor', 'shoes', 'sports'];
    const productIds = [];
    
    for (const category of categories) {
      const productsCollection = collection(db, `categories/${category}/products`);
      const snapshot = await getDocs(productsCollection);
      
      snapshot.docs.forEach(doc => {
        productIds.push({
          id: doc.id,
          name: doc.data().name,
          category: category
        });
      });
      
      console.log(`${category} 카테고리: ${snapshot.docs.length}개 상품`);
    }
    
    console.log(`\n총 ${productIds.length}개 상품 발견:`);
    productIds.forEach((product, index) => {
      console.log(`${index + 1}. [${product.category}] ${product.name} (${product.id})`);
    });
    
    return productIds;
    
  } catch (error) {
    console.error('상품 ID 조회 실패:', error);
    return [];
  }
}

// 스크립트 실행
if (require.main === module) {
  getProductIds().then(() => {
    process.exit(0);
  });
}

module.exports = { getProductIds };
