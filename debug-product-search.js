const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'hebimall-musinsa'
  });
}

const db = admin.firestore();

async function checkProduct() {
  console.log('🔍 상품 ID SE2niktLz1IXGoFDaPaq 검색 중...');
  
  // 모든 카테고리에서 해당 상품 검색
  const categories = ['tops', 'bottoms', 'clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'sports', 'outdoor'];
  
  for (const category of categories) {
    try {
      console.log(`📂 ${category} 카테고리 검색 중...`);
      
      const productRef = db.collection('categories').doc(category).collection('products').doc('SE2niktLz1IXGoFDaPaq');
      const doc = await productRef.get();
      
      if (doc.exists) {
        return;
      }
    } catch (error) {
      console.error(`❌ ${category} 검색 실패:`, error.message);
    }
  }
  
  console.log('❌ 모든 카테고리에서 상품을 찾을 수 없습니다.');
  
  // 전체 상품 목록 확인
  console.log('\n🔍 전체 상품 목록 확인...');
  for (const category of categories) {
    try {
      const snapshot = await db.collection('categories').doc(category).collection('products').limit(5).get();
      console.log(`📂 ${category}: ${snapshot.size}개 상품`);
      snapshot.forEach(doc => {
        console.log(`  - ${doc.id}: ${doc.data().name}`);
      });
    } catch (error) {
      console.error(`❌ ${category} 목록 조회 실패:`, error.message);
    }
  }
}

checkProduct().catch(console.error);
