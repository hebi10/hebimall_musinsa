const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'hebimall'
  });
}

const db = admin.firestore();

// 한국어 문서 ID 목록
const koreanDocIds = ['가방', '상의', '액세서리', '하의'];

// 한국어 → 영어 매핑
const koreanToEnglish = {
  '가방': 'bags',
  '상의': 'tops', 
  '액세서리': 'accessories',
  '하의': 'bottoms'
};

async function checkKoreanDocuments() {
  console.log('🔍 한국어 카테고리 문서 확인 중...');
  
  try {
    for (const koreanId of koreanDocIds) {
      console.log(`\n📂 "${koreanId}" 문서 확인:`);
      
      const koreanDocRef = db.collection('categories').doc(koreanId);
      const koreanDoc = await koreanDocRef.get();
      
      if (koreanDoc.exists) {
        const data = koreanDoc.data();
        console.log(`  ✅ 존재함`);
        console.log(`  데이터:`, JSON.stringify(data, null, 2));
        
        // 하위 상품 확인
        const productsRef = koreanDocRef.collection('products');
        const productsSnapshot = await productsRef.get();
        console.log(`  상품 개수: ${productsSnapshot.size}개`);
        
        if (productsSnapshot.size > 0) {
          console.log(`  상품 목록:`);
          productsSnapshot.docs.forEach((productDoc, index) => {
            const productData = productDoc.data();
            console.log(`    ${index + 1}. ${productData.name} (ID: ${productDoc.id})`);
          });
        }
      } else {
        console.log(`  ❌ 존재하지 않음`);
      }
    }
    
  } catch (error) {
    console.error('❌ 확인 실패:', error);
  }
}

async function migrateProducts() {
  console.log('\n🔄 상품 데이터 마이그레이션 시작...');
  
  try {
    for (const koreanId of koreanDocIds) {
      const englishId = koreanToEnglish[koreanId];
      
      console.log(`\n📦 "${koreanId}" → "${englishId}" 상품 마이그레이션:`);
      
      const koreanDocRef = db.collection('categories').doc(koreanId);
      const englishDocRef = db.collection('categories').doc(englishId);
      
      // 한국어 문서의 상품들 가져오기
      const koreanProductsRef = koreanDocRef.collection('products');
      const koreanProductsSnapshot = await koreanProductsRef.get();
      
      if (koreanProductsSnapshot.empty) {
        console.log(`  ℹ️ 마이그레이션할 상품이 없습니다.`);
        continue;
      }
      
      let migratedCount = 0;
      
      for (const productDoc of koreanProductsSnapshot.docs) {
        const productData = productDoc.data();
        const productId = productDoc.id;
        
        // 영어 카테고리에 같은 ID의 상품이 있는지 확인
        const englishProductRef = englishDocRef.collection('products').doc(productId);
        const englishProductDoc = await englishProductRef.get();
        
        if (englishProductDoc.exists) {
          console.log(`    ⚠️ 중복: "${productData.name}" (ID: ${productId}) - 영어 카테고리에 이미 존재`);
        } else {
          // 영어 카테고리로 상품 복사
          await englishProductRef.set({
            ...productData,
            category: englishId, // 카테고리 필드도 영어로 업데이트
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`    ✅ 마이그레이션: "${productData.name}" (ID: ${productId})`);
          migratedCount++;
        }
      }
      
      console.log(`  총 ${migratedCount}개 상품 마이그레이션 완료`);
    }
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  }
}

async function deleteKoreanDocuments() {
  console.log('\n🗑️ 한국어 카테고리 문서 삭제 시작...');
  
  try {
    for (const koreanId of koreanDocIds) {
      console.log(`\n📂 "${koreanId}" 문서 삭제 중:`);
      
      const koreanDocRef = db.collection('categories').doc(koreanId);
      
      // 먼저 하위 상품들 삭제
      const productsRef = koreanDocRef.collection('products');
      const productsSnapshot = await productsRef.get();
      
      if (!productsSnapshot.empty) {
        console.log(`  🗑️ ${productsSnapshot.size}개 상품 삭제 중...`);
        
        const batch = db.batch();
        productsSnapshot.docs.forEach(productDoc => {
          batch.delete(productDoc.ref);
        });
        
        await batch.commit();
        console.log(`  ✅ 상품 삭제 완료`);
      }
      
      // 카테고리 문서 삭제
      await koreanDocRef.delete();
      console.log(`  ✅ 카테고리 문서 삭제 완료`);
    }
    
    console.log('\n🎉 모든 한국어 카테고리 문서 삭제 완료!');
    
  } catch (error) {
    console.error('❌ 삭제 실패:', error);
    throw error;
  }
}

async function verifyResults() {
  console.log('\n최종 결과 확인...');
  
  try {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();
    
    console.log('\n✅ 현재 카테고리 목록:');
    snapshot.docs.forEach(doc => {
      const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(doc.id);
      console.log(`  ${doc.id} (${doc.data().name}) ${isKorean ? '⚠️ 한국어' : '✅ 영어'}`);
    });
    
    // 한국어 문서 ID가 남아있는지 확인
    const remainingKorean = snapshot.docs.filter(doc => 
      /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(doc.id)
    );
    
    if (remainingKorean.length > 0) {
      console.log(`\n⚠️ ${remainingKorean.length}개의 한국어 문서 ID가 아직 남아있습니다:`);
      remainingKorean.forEach(doc => {
        console.log(`  - ${doc.id}`);
      });
    } else {
      console.log('\n🎉 모든 한국어 문서 ID가 성공적으로 제거되었습니다!');
    }
    
  } catch (error) {
    console.error('❌ 결과 확인 실패:', error);
  }
}

async function main() {
  const action = process.argv[2] || 'check';
  
  try {
    switch (action) {
      case 'check':
        await checkKoreanDocuments();
        break;
      case 'migrate':
        await migrateProducts();
        break;
      case 'delete':
        await deleteKoreanDocuments();
        break;
      case 'verify':
        await verifyResults();
        break;
      case 'all':
        await checkKoreanDocuments();
        await migrateProducts();
        await deleteKoreanDocuments();
        await verifyResults();
        break;
      default:
        console.log('사용법: node remove-korean-docs.js [check|migrate|delete|verify|all]');
        break;
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 작업 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
