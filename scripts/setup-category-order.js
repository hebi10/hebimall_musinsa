const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  Timestamp 
} = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCJrxe5Jdl95pBbAOy7rZ9H16CQkDqUGWE",
  authDomain: "hebi-mall.firebaseapp.com",
  databaseURL: "https://hebi-mall-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hebi-mall",
  storageBucket: "hebi-mall.appspot.com",
  messagingSenderId: "1045798983933",
  appId: "1:1045798983933:web:1cd1dbf7b6b7b2b5b29e4c"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 원하는 카테고리 순서 설정
const desiredCategoryOrder = [
  '상의',
  '하의', 
  '신발',
  '상의',
  '스포츠',
  '아웃도어',
  '가방',
  '주얼리',
  '액세서리'
];

// 카테고리 ID와 이름 매핑
const categoryMapping = {
  'tops': '상의',
  'bottoms': '하의',
  'shoes': '신발',
  'clothing': '상의',
  'sports': '스포츠',
  'outdoor': '아웃도어',
  'bags': '가방',
  'jewelry': '주얼리',
  'accessories': '액세서리'
};

// 역매핑 생성 (이름 -> ID)
const nameToIdMapping = {};
Object.entries(categoryMapping).forEach(([id, name]) => {
  nameToIdMapping[name] = id;
});

async function setupCategoryOrder() {
  try {
    console.log('🔧 카테고리 순서 설정 시작...\n');

    // 1. categoryOrder 컬렉션에 전역 설정 저장
    const orderData = {
      order: desiredCategoryOrder,
      mappedOrder: desiredCategoryOrder.map(name => nameToIdMapping[name]).filter(Boolean),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      description: '메인 페이지 카테고리 표시 순서',
      isActive: true
    };

    const orderRef = doc(db, 'categoryOrder', 'mainPageOrder');
    await setDoc(orderRef, orderData, { merge: true });
    
    console.log('✅ 카테고리 순서 설정 완료');
    console.log('📋 설정된 순서:', desiredCategoryOrder);
    console.log('🆔 매핑된 ID 순서:', orderData.mappedOrder);

    // 2. 각 카테고리에 order 필드 업데이트
    console.log('\n🔄 개별 카테고리 order 필드 업데이트...');
    
    for (let i = 0; i < desiredCategoryOrder.length; i++) {
      const categoryName = desiredCategoryOrder[i];
      const categoryId = nameToIdMapping[categoryName];
      
      if (categoryId) {
        try {
          const categoryRef = doc(db, 'categories', categoryId);
          const categoryDoc = await getDoc(categoryRef);
          
          if (categoryDoc.exists()) {
            await updateDoc(categoryRef, {
              order: i,
              updatedAt: Timestamp.now()
            });
            console.log(`  ✅ ${categoryName} (${categoryId}): order = ${i}`);
          } else {
            console.log(`  ⚠️ 카테고리 문서가 존재하지 않음: ${categoryName} (${categoryId})`);
          }
        } catch (error) {
          console.log(`  ❌ ${categoryName} 업데이트 실패:`, error.message);
        }
      } else {
        console.log(`  ⚠️ 매핑되지 않은 카테고리: ${categoryName}`);
      }
    }

    console.log('\n🎉 카테고리 순서 설정 완료!');
    
  } catch (error) {
    console.error('❌ 카테고리 순서 설정 실패:', error);
  }
}

// 스크립트 실행
setupCategoryOrder();
