const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Firebase 초기화
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

// 카테고리 이름 매핑 (한국어 → 영어)
const categoryNameMapping = {
  "가방": "Bags",
  "상의": "Tops", 
  "액세서리": "Accessories",
  "하의": "Bottoms",
  "의류": "Clothing",
  "신발": "Shoes",
  "주얼리": "Jewelry",
  "아웃도어": "Outdoor",
  "스포츠": "Sports"
};

// 상품 카테고리 매핑 (한국어 → 영어 ID)
const productCategoryMapping = {
  "가방": "bags",
  "상의": "tops",
  "액세서리": "accessories", 
  "하의": "bottoms"
};

async function fixCategoryNames() {
  console.log('🔄 카테고리 이름을 영어로 변경 중...');
  
  try {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();
    
    let updatedCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const koreanName = data.name;
      const englishName = categoryNameMapping[koreanName];
      
      if (englishName) {
        await doc.ref.update({
          name: englishName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ "${koreanName}" → "${englishName}" (ID: ${doc.id})`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 총 ${updatedCount}개 카테고리 이름이 업데이트되었습니다.`);
    
  } catch (error) {
    console.error('❌ 카테고리 이름 업데이트 실패:', error);
    throw error;
  }
}

async function fixProductCategories() {
  console.log('\n🔄 상품 카테고리 필드를 영어로 변경 중...');
  
  try {
    const categoriesRef = db.collection('categories');
    const categoriesSnapshot = await categoriesRef.get();
    
    let totalUpdated = 0;
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const productsRef = categoryDoc.ref.collection('products');
      const productsSnapshot = await productsRef.get();
      
      console.log(`\n📂 카테고리 "${categoryId}" 확인 중... (${productsSnapshot.size}개 상품)`);
      
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const currentCategory = productData.category;
        
        // 한국어 카테고리인 경우 영어로 변경
        if (productCategoryMapping[currentCategory]) {
          const englishCategory = productCategoryMapping[currentCategory];
          await productDoc.ref.update({
            category: englishCategory,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`  ✅ "${productData.name}" 상품: "${currentCategory}" → "${englishCategory}"`);
          totalUpdated++;
        }
        // 이미 영어인 경우 확인만
        else if (currentCategory === categoryId) {
          console.log(`  ✓ "${productData.name}" 상품: 이미 올바른 카테고리 "${currentCategory}"`);
        }
        // 카테고리가 맞지 않는 경우
        else {
          console.log(`  ⚠️ "${productData.name}" 상품: 카테고리 불일치 "${currentCategory}" (현재 위치: ${categoryId})`);
        }
      }
    }
    
    console.log(`\n🎉 총 ${totalUpdated}개 상품의 카테고리 필드가 업데이트되었습니다.`);
    
  } catch (error) {
    console.error('❌ 상품 카테고리 업데이트 실패:', error);
    throw error;
  }
}

async function checkResults() {
  console.log('\n업데이트 결과 확인...');
  
  try {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();
    
    console.log('\n✅ 카테고리 이름 확인:');
    for (const doc of snapshot.docs) {
      const data = doc.data();
    }
    
    console.log('\n✅ 상품 카테고리 샘플 확인:');
    for (const doc of snapshot.docs) {
      const productsRef = doc.ref.collection('products');
      const productsSnapshot = await productsRef.limit(2).get();
      
      if (!productsSnapshot.empty) {
        console.log(`\n   📂 ${doc.id} 카테고리:`);
        productsSnapshot.docs.forEach(productDoc => {
          const productData = productDoc.data();
          console.log(`     - "${productData.name}": category="${productData.category}"`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 결과 확인 실패:', error);
  }
}

async function main() {
  const action = process.argv[2] || 'all';
  
  try {
    switch (action) {
      case 'categories':
        await fixCategoryNames();
        break;
      case 'products':
        await fixProductCategories();
        break;
      case 'check':
        await checkResults();
        break;
      case 'all':
      default:
        await fixCategoryNames();
        await fixProductCategories();
        await checkResults();
        break;
    }
    
    console.log('\n🎯 작업이 완료되었습니다!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 작업 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
