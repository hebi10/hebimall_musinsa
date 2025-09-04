const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, writeBatch, Timestamp, getDoc } = require("firebase/firestore");

// 환경변수 로드
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

class ProductMigrationService {
  
  // 1단계: 현재 구조 분석
  static async analyzeCurrentStructure() {
    console.log('\n🔍 현재 Firebase 구조 분석...\n');

    try {
      // 전체 상품 수 확인
      const productsSnapshot = await getDocs(collection(db, 'products'));
      console.log(`📦 전체 상품 개수: ${productsSnapshot.size}`);

      // 카테고리별 상품 분석
      const categoryCount = {};
      const categoryStructure = {};
      
      for (const docSnap of productsSnapshot.docs) {
        const product = docSnap.data();
        const category = product.category;
        
        if (!categoryCount[category]) {
          categoryCount[category] = 0;
        }
        categoryCount[category]++;
        
        if (!categoryStructure[category]) {
          categoryStructure[category] = [];
        }
        categoryStructure[category].push({
          id: docSnap.id,
          name: product.name,
          price: product.price
        });
      }

      console.log('\n📊 카테고리별 상품 분포:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count}개`);
      });

      // 카테고리 컬렉션 확인
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      console.log(`\n📁 카테고리 컬렉션: ${categoriesSnapshot.size}개`);

      return {
        totalProducts: productsSnapshot.size,
        categoryCount,
        categoryStructure,
        totalCategories: categoriesSnapshot.size
      };

    } catch (error) {
      console.error('❌ 구조 분석 실패:', error);
      throw error;
    }
  }

  // 2단계: 중첩 구조로 마이그레이션
  static async migrateToNestedStructure() {
    console.log('\n🔄 중첩 구조로 마이그레이션 시작...\n');

    try {
      const batch = writeBatch(db);
      let batchCount = 0;
      const maxBatchSize = 400; // Firebase 배치 제한

      // 전체 상품 조회
      const productsSnapshot = await getDocs(collection(db, 'products'));
      
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const productId = productDoc.id;
        const categorySlug = productData.category;

        // 카테고리별 상품 컬렉션에 추가
        const categoryProductRef = doc(db, 'categories', categorySlug, 'products', productId);

        // 전체 상품 ID 참조 추가
        const categoryProductData = {
          ...productData,
          globalProductId: productId,
          migratedAt: Timestamp.now()
        };

        batch.set(categoryProductRef, categoryProductData);
        batchCount++;

        // Firebase 배치 제한에 도달하면 커밋
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`✅ ${batchCount}개 상품 마이그레이션 완료`);
          
          // 새 배치 시작
          const newBatch = writeBatch(db);
          Object.assign(batch, newBatch);
          batchCount = 0;
        }

        console.log(`📦 ${productData.name} -> categories/${categorySlug}/products/${productId}`);
      }

      // 남은 배치 커밋
      if (batchCount > 0) {
        await batch.commit();
        console.log(`✅ 마지막 ${batchCount}개 상품 마이그레이션 완료`);
      }

      console.log('\n🎉 마이그레이션 성공적으로 완료!');

    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 3단계: 마이그레이션 검증
  static async validateMigration() {
    console.log('\n🔍 마이그레이션 검증 중...\n');

    try {
      // 전체 상품 수 확인
      const originalProductsSnapshot = await getDocs(collection(db, 'products'));
      const originalCount = originalProductsSnapshot.size;

      // 카테고리별 상품 수 확인
      let migratedCount = 0;
      const categoryValidation = {};

      for (const productDoc of originalProductsSnapshot.docs) {
        const productData = productDoc.data();
        const categorySlug = productData.category;
        const productId = productDoc.id;

        // 카테고리별 컬렉션에서 확인
        const categoryProductDoc = await getDoc(doc(db, 'categories', categorySlug, 'products', productId));

        if (categoryProductDoc.exists()) {
          migratedCount++;
          
          if (!categoryValidation[categorySlug]) {
            categoryValidation[categorySlug] = 0;
          }
          categoryValidation[categorySlug]++;
        } else {
          console.log(`❌ 누락된 상품: ${productData.name} (${categorySlug})`);
        }
      }

      console.log(`📊 검증 결과:`);
      console.log(`  - 원본 상품 수: ${originalCount}`);
      console.log(`  - 마이그레이션된 상품 수: ${migratedCount}`);
      console.log(`  - 성공률: ${((migratedCount / originalCount) * 100).toFixed(2)}%`);

      console.log('\n📋 카테고리별 마이그레이션 결과:');
      Object.entries(categoryValidation).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count}개`);
      });

      if (migratedCount === originalCount) {
        console.log('\n✅ 마이그레이션 검증 완료! 모든 데이터가 성공적으로 이전되었습니다.');
      } else {
        console.log('\n⚠️ 일부 데이터 누락 발견. 다시 확인해주세요.');
      }

      return {
        originalCount,
        migratedCount,
        successRate: (migratedCount / originalCount) * 100,
        categoryValidation
      };

    } catch (error) {
      console.error('❌ 검증 실패:', error);
      throw error;
    }
  }

  // 4단계: 구조 예시 조회
  static async showStructureExample() {
    console.log('\n📋 새로운 구조 예시:\n');

    try {
      // 카테고리 목록 조회
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      let count = 0;
      for (const categoryDoc of categoriesSnapshot.docs) {
        if (count >= 3) break; // 처음 3개만
        
        const categoryId = categoryDoc.id;
        const categoryData = categoryDoc.data();
        
        console.log(`📁 categories/${categoryId}`);
        console.log(`   이름: ${categoryData.name}`);
        
        // 해당 카테고리의 상품들 조회
        const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));

        if (productsSnapshot.size > 0) {
          console.log('   📦 products:');
          let productCount = 0;
          for (const productDoc of productsSnapshot.docs) {
            if (productCount >= 3) break; // 처음 3개만
            
            const productData = productDoc.data();
            console.log(`      - ${productDoc.id}: ${productData.name} (₩${productData.price?.toLocaleString()})`);
            productCount++;
          }
        }
        console.log('');
        count++;
      }

    } catch (error) {
      console.error('❌ 구조 예시 조회 실패:', error);
    }
  }

  // 전체 마이그레이션 실행
  static async runFullMigration() {
    console.log('🚀 Firebase 상품 구조 마이그레이션 시작\n');
    console.log('=' .repeat(60));

    try {
      // 1단계: 현재 구조 분석
      const analysis = await this.analyzeCurrentStructure();
      
      // 사용자 확인
      console.log('\n❓ 위 구조를 중첩 컬렉션으로 마이그레이션하시겠습니까?');
      console.log('   기존: products/ -> 새로운: categories/{id}/products/{id}');
      
      // 2단계: 마이그레이션 실행
      await this.migrateToNestedStructure();
      
      // 3단계: 검증
      const validation = await this.validateMigration();
      
      // 4단계: 구조 예시
      await this.showStructureExample();
      
      console.log('\n' + '=' .repeat(60));
      console.log('🎉 마이그레이션 프로세스 완료!');
      console.log('\n✅ 이제 다음 구조로 상품에 접근할 수 있습니다:');
      console.log('   • 전체 상품: products/{productId}');
      console.log('   • 카테고리별 상품: categories/{categoryId}/products/{productId}');

      return {
        analysis,
        validation,
        success: true
      };

    } catch (error) {
      console.error('\n❌ 마이그레이션 프로세스 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 롤백 (필요시)
  static async rollbackMigration() {
    console.log('\n🔄 마이그레이션 롤백 시작...\n');

    try {
      const batch = writeBatch(db);
      let batchCount = 0;
      const maxBatchSize = 400;
      
      // 전체 상품 조회
      const productsSnapshot = await getDocs(collection(db, 'products'));
      
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const categorySlug = productData.category;
        const productId = productDoc.id;

        // 카테고리별 상품 삭제
        const categoryProductRef = doc(db, 'categories', categorySlug, 'products', productId);
        batch.delete(categoryProductRef);
        batchCount++;
        
        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`🗑️ ${batchCount}개 중첩 상품 삭제 완료`);
          
          const newBatch = writeBatch(db);
          Object.assign(batch, newBatch);
          batchCount = 0;
        }
        
        console.log(`🗑️ categories/${categorySlug}/products/${productId} 삭제`);
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`🗑️ 마지막 ${batchCount}개 중첩 상품 삭제 완료`);
      }

      console.log('\n✅ 롤백 완료!');

    } catch (error) {
      console.error('❌ 롤백 실패:', error);
      throw error;
    }
  }
}

// 스크립트 실행
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  switch (command) {
    case 'analyze':
      await ProductMigrationService.analyzeCurrentStructure();
      break;
    case 'migrate':
      await ProductMigrationService.runFullMigration();
      break;
    case 'validate':
      await ProductMigrationService.validateMigration();
      break;
    case 'example':
      await ProductMigrationService.showStructureExample();
      break;
    case 'rollback':
      await ProductMigrationService.rollbackMigration();
      break;
    default:
      console.log('사용법:');
      console.log('  node migrate-products-client.js [analyze|migrate|validate|example|rollback]');
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProductMigrationService;
