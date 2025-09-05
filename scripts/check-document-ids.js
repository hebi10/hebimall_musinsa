const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'hebimall'
  });
}

const db = admin.firestore();

async function checkCategoryDocumentIds() {
  console.log('📂 카테고리 문서 ID 확인 중...');
  
  try {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();
    
    console.log('\n카테고리 문서 ID 목록:');
    const koreanDocs = [];
    const englishDocs = [];
    
    snapshot.docs.forEach(doc => {
      const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(doc.id);
      console.log(`- 문서 ID: "${doc.id}"`);
      console.log(`  이름: "${doc.data().name}"`);
      console.log(`  한국어 문서 ID: ${isKorean ? '✅ YES' : '❌ NO'}`);
      console.log('');
      
      if (isKorean) {
        koreanDocs.push({
          id: doc.id,
          name: doc.data().name,
          data: doc.data()
        });
      } else {
        englishDocs.push({
          id: doc.id,
          name: doc.data().name,
          data: doc.data()
        });
      }
    });
    
    console.log('🔍 분석 결과:');
    console.log(`- 한국어 문서 ID: ${koreanDocs.length}개`);
    console.log(`- 영어 문서 ID: ${englishDocs.length}개`);
    
    if (koreanDocs.length > 0) {
      console.log('\n⚠️ 한국어 문서 ID 발견:');
      koreanDocs.forEach(doc => {
        console.log(`  "${doc.id}" → 이름: "${doc.name}"`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 확인 실패:', error);
    process.exit(1);
  }
}

checkCategoryDocumentIds();
