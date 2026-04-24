const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, updateDoc, writeBatch } = require('firebase/firestore');

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

class CategoryMigrationService {
  
  // 1. 누락된 카테고리 생성
  static async createMissingCategories() {
    console.log(' 누락된 카테고리 생성...\n');
    
    const categories = [
      { id: 'accessories', name: '액세서리' },
      { id: 'bags', name: '가방' },
      { id: 'bottoms', name: '하의' },
      { id: 'clothing', name: '의류' },
      { id: 'shoes', name: '신발' },
      { id: 'tops', name: '상의' }
    ];

    for (const category of categories) {
      try {
        await setDoc(doc(db, 'categories', category.id), {
          name: category.name,
          slug: category.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ 카테고리 생성: ${category.id} (${category.name})`);
      } catch (error) {
        console.error(`❌ 카테고리 생성 실패: ${category.id}`, error);
      }
    }
  }

  // 2. 상품 카테고리 재분류
  static async recategorizeProducts() {
    console.log('\n📦 상품 카테고리 재분류...\n');
    
    // clothing 상품들을 tops/bottoms로 분류하는 로직
    const clothingMapping = {
      '오버핏 후드 스웨트셔츠': 'tops',
      '슬림핏 정장 셔츠': 'tops',
      '스키니핏 청바지': 'bottoms',
      '베이직 코튼 티셔츠': 'tops'
    };

    const batch = writeBatch(db);
    let batchCount = 0;

    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;
      let newCategory = productData.category;

      // clothing 상품 재분류
      if (productData.category === 'clothing') {
        newCategory = clothingMapping[productData.name] || 'tops';
        console.log(`🔄 ${productData.name}: clothing → ${newCategory}`);
        
        // products 컬렉션 업데이트
        const productRef = doc(db, 'products', productId);
        batch.update(productRef, { category: newCategory });
        batchCount++;
      }

      // 기존 중첩 컬렉션에서 제거하고 새 위치에 추가
      if (productData.category !== newCategory) {
        // 기존 위치에서 삭제
        const oldCategoryProductRef = doc(db, 'categories', productData.category, 'products', productId);
        batch.delete(oldCategoryProductRef);
        batchCount++;

        // 새 위치에 추가
        const newCategoryProductRef = doc(db, 'categories', newCategory, 'products', productId);
        batch.set(newCategoryProductRef, {
          ...productData,
          category: newCategory,
          globalProductId: productId,
          updatedAt: new Date()
        });
        batchCount++;
      }

      // 배치 크기 제한
      if (batchCount >= 400) {
        await batch.commit();
        console.log(`✅ ${batchCount}개 업데이트 완료`);
        batchCount = 0;
      }
    }

    // 남은 배치 커밋
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ 마지막 ${batchCount}개 업데이트 완료`);
    }
  }

  // 3. 중첩 컬렉션 재구성
  static async rebuildNestedCollections() {
    console.log('\n🔄 중첩 컬렉션 재구성...\n');
    
    const batch = writeBatch(db);
    let batchCount = 0;

    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;
      const categorySlug = productData.category;

      // 카테고리별 상품 컬렉션에 추가
      const categoryProductRef = doc(db, 'categories', categorySlug, 'products', productId);
      
      batch.set(categoryProductRef, {
        ...productData,
        globalProductId: productId,
        migratedAt: new Date()
      });
      batchCount++;

      console.log(`📦 ${productData.name} → categories/${categorySlug}/products/${productId}`);

      if (batchCount >= 400) {
        await batch.commit();
        console.log(`✅ ${batchCount}개 중첩 컬렉션 생성 완료`);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ 마지막 ${batchCount}개 중첩 컬렉션 생성 완료`);
    }
  }

  // 4. 검증
  static async validateStructure() {
    console.log('\n✅ 구조 검증...\n');
    
    // 카테고리 확인
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(' 카테고리 목록:');
    categoriesSnapshot.docs.forEach(doc => {
      const data = doc.data();
    });

    // 상품 분포 확인
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const categoryCount = {};
    
    productsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      categoryCount[data.category] = (categoryCount[data.category] || 0) + 1;
    });

    console.log('\n상품 분포:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}개`);
    });

    // 중첩 컬렉션 확인
    console.log('\n🗂️ 중첩 컬렉션 확인:');
    const targetCategories = ['accessories', 'bags', 'bottoms', 'shoes', 'tops'];
    
    for (const category of targetCategories) {
      try {
        const categoryProductsSnapshot = await getDocs(
          collection(db, 'categories', category, 'products')
        );
        console.log(`   categories/${category}/products/: ${categoryProductsSnapshot.size}개`);
      } catch (error) {
        console.log(`   categories/${category}/products/: 0개 (컬렉션 없음)`);
      }
    }
  }

  // 전체 마이그레이션 실행
  static async runFullMigration() {
    console.log('🚀 카테고리 구조 수정 시작\n');
    console.log('=' .repeat(60));

    try {
      // 1단계: 누락된 카테고리 생성
      await this.createMissingCategories();
      
      // 2단계: 상품 재분류
      await this.recategorizeProducts();
      
      // 3단계: 중첩 컬렉션 재구성
      await this.rebuildNestedCollections();
      
      // 4단계: 검증
      await this.validateStructure();
      
      console.log('\n' + '=' .repeat(60));
      console.log('🎉 카테고리 구조 수정 완료!');
      console.log('\n✅ 이제 사용 가능한 카테고리:');
      console.log('   • /categories/accessories (액세서리)');
      console.log('   • /categories/bags (가방)');
      console.log('   • /categories/bottoms (하의)');
      console.log('   • /categories/shoes (신발)');
      console.log('   • /categories/tops (상의)');

    } catch (error) {
      console.error('\n❌ 마이그레이션 실패:', error);
    }
  }
}

// 실행
if (require.main === module) {
  CategoryMigrationService.runFullMigration()
    .then(() => process.exit(0))
    .catch(console.error);
}
