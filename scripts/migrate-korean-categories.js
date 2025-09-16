const { getFirestore, collection, doc, getDoc, getDocs, writeBatch, setDoc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

// Firebase 설정
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

// 한국어 -> 영어 카테고리 매핑
const categoryMapping = {
  '가방': 'bags',
  '상의': 'tops', 
  '액세서리': 'accessories',
  '하의': 'bottoms',
  '신발': 'shoes',
  '의류': 'clothing'
};

async function checkKoreanCategories() {
  console.log('🔍 한국어 카테고리 확인 중...\n');
  
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const koreanCategories = [];
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      
      // 한국어 카테고리인지 확인
      if (Object.keys(categoryMapping).includes(categoryId)) {
        const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
        
        koreanCategories.push({
          koreanId: categoryId,
          englishId: categoryMapping[categoryId],
          productCount: productsSnapshot.size,
          products: productsSnapshot.docs
        });
      }
    }
    
    if (koreanCategories.length === 0) {
      console.log('✅ 한국어 카테고리가 없습니다!');
      return;
    }
    
    console.log(`\n❗ ${koreanCategories.length}개의 한국어 카테고리 발견:`);
    koreanCategories.forEach(cat => {
      console.log(`   ${cat.koreanId} → ${cat.englishId} (${cat.productCount}개 상품)`);
    });
    
    return koreanCategories;
    
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

async function migrateKoreanToEnglish() {
  console.log('🔄 한국어 카테고리를 영어로 마이그레이션 시작...\n');
  
  try {
    const koreanCategories = await checkKoreanCategories();
    
    if (!koreanCategories || koreanCategories.length === 0) {
      console.log('✅ 마이그레이션할 한국어 카테고리가 없습니다.');
      return;
    }
    
    for (const category of koreanCategories) {
      console.log(`\n📦 ${category.koreanId} → ${category.englishId} 마이그레이션 중...`);
      
      if (category.productCount === 0) {
        console.log('   상품이 없어서 건너뛰기');
        continue;
      }
      
      const batch = writeBatch(db);
      let batchCount = 0;
      
      // 각 상품을 영어 카테고리로 복사
      for (const productDoc of category.products) {
        const productData = productDoc.data();
        const productId = productDoc.id;
        
        // 상품의 category 필드도 영어로 업데이트
        const updatedProductData = {
          ...productData,
          category: category.englishId
        };
        
        // 영어 카테고리에 상품 추가
        const englishCategoryRef = doc(db, 'categories', category.englishId, 'products', productId);
        batch.set(englishCategoryRef, updatedProductData);
        batchCount++;
        
        console.log(`   ✅ ${productData.name} → categories/${category.englishId}/products/${productId}`);
        
        // 배치 제한 확인
        if (batchCount >= 400) {
          await batch.commit();
          console.log(`   💾 ${batchCount}개 상품 저장 완료`);
          batchCount = 0;
        }
      }
      
      // 남은 배치 커밋
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   💾 ${batchCount}개 상품 저장 완료`);
      }
      
      console.log(`✅ ${category.koreanId} → ${category.englishId} 마이그레이션 완료!`);
    }
    
    console.log('\n🎉 모든 마이그레이션 완료!');
    console.log('\n⚠️  다음 단계: 한국어 카테고리 삭제');
    console.log('   수동으로 Firebase 콘솔에서 한국어 카테고리를 삭제하거나');
    console.log('   deleteKoreanCategories() 함수를 실행하세요.');
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  }
}

async function deleteKoreanCategories() {
  console.log('🗑️  한국어 카테고리 삭제 시작...\n');
  
  try {
    const koreanCategoryIds = Object.keys(categoryMapping);
    
    for (const koreanId of koreanCategoryIds) {
      try {
        // 카테고리 내 모든 상품 삭제
        const productsSnapshot = await getDocs(collection(db, 'categories', koreanId, 'products'));
        
        if (productsSnapshot.size > 0) {
          console.log(`📂 ${koreanId}: ${productsSnapshot.size}개 상품 삭제 중...`);
          
          const batch = writeBatch(db);
          let batchCount = 0;
          
          for (const productDoc of productsSnapshot.docs) {
            batch.delete(productDoc.ref);
            batchCount++;
            
            if (batchCount >= 400) {
              await batch.commit();
              batchCount = 0;
            }
          }
          
          if (batchCount > 0) {
            await batch.commit();
          }
        }
        
        // 카테고리 문서 자체 삭제 (Firebase에서는 하위 컬렉션이 있어도 상위 문서 삭제 가능)
        console.log(`🗑️  ${koreanId} 카테고리 삭제 완료`);
        
      } catch (error) {
        console.log(`   ⚠️ ${koreanId} 삭제 중 오류: ${error.message}`);
      }
    }
    
    console.log('\n✅ 한국어 카테고리 삭제 완료!');
    
  } catch (error) {
    console.error('❌ 삭제 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'check') {
    checkKoreanCategories();
  } else if (action === 'migrate') {
    migrateKoreanToEnglish();
  } else if (action === 'delete') {
    deleteKoreanCategories();
  } else {
    console.log('사용법:');
    console.log('  node scripts/migrate-korean-categories.js check   - 한국어 카테고리 확인');
    console.log('  node scripts/migrate-korean-categories.js migrate - 영어로 마이그레이션');
    console.log('  node scripts/migrate-korean-categories.js delete  - 한국어 카테고리 삭제');
  }
}

module.exports = {
  checkKoreanCategories,
  migrateKoreanToEnglish,
  deleteKoreanCategories,
  categoryMapping
};
