const { seedCategories } = require('./seed-categories-fixed');
const { seedProducts } = require('./seed-products-fixed');

async function seedAll() {
  try {
    console.log('🚀 전체 시드 데이터 생성 시작...\n');
    
    // 1. 카테고리 생성
    console.log('1️⃣ 카테고리 데이터 생성 중...');
    await seedCategories();
    console.log('✅ 카테고리 생성 완료!\n');
    
    // 2. 상품 생성
    console.log('2️⃣ 상품 데이터 생성 중...');
    await seedProducts();
    console.log('✅ 상품 생성 완료!\n');
    
    console.log('🎉 모든 시드 데이터 생성이 완료되었습니다!');
    console.log('📋 생성된 데이터:');
    console.log('   - 카테고리: 7개');
    console.log('   - 상품: 10개');
    console.log('');
    console.log('이제 다음 URL에서 확인할 수 있습니다:');
    console.log('   - 전체 카테고리: http://localhost:3001/categories');
    console.log('   - 의류 카테고리: http://localhost:3001/categories/clothing');
    console.log('   - 신발 카테고리: http://localhost:3001/categories/shoes');
    console.log('   - 가방 카테고리: http://localhost:3001/categories/bags');
    
  } catch (error) {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('\n스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedAll };
