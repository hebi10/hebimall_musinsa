// categoryUtils 테스트 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBaKyZ8Z3eWw6n8kKhvJ7rFVlD1RhBKx-k",
  authDomain: "hebi-mall.firebaseapp.com",
  projectId: "hebi-mall",
  storageBucket: "hebi-mall.firebasestorage.app",
  messagingSenderId: "82467588522",
  appId: "1:82467588522:web:9b8d8e7b4e5c8d6a7f8b9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCategoryUtils() {
  console.log('🔍 Firebase에서 카테고리 정보를 확인합니다...');
  
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesMap = {};
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categoriesMap[doc.id] = data.name || doc.id;
      console.log(`📂 ${doc.id}: ${data.name || '이름 없음'}`);
    });
    
    console.log('\n✅ 카테고리 매핑 결과:');
    console.log(categoriesMap);
    
    // 자주 사용하는 카테고리들 확인
    const commonCategories = ['tops', 'accessories', 'bags', 'bottoms', 'shoes'];
    console.log('\n🎯 주요 카테고리 확인:');
    commonCategories.forEach(cat => {
      const name = categoriesMap[cat];
      console.log(`  ${cat} → ${name || '❌ 없음'}`);
    });
    
  } catch (error) {
    console.error('❌ 카테고리 데이터 로드 실패:', error);
  }
}

testCategoryUtils();
