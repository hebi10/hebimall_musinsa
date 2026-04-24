const { seedBagsProducts } = require('./seed-bags-products');
const { seedOutdoorProducts } = require('./seed-outdoor-products');
const { seedSportsProducts } = require('./seed-sports-products');
const { seedJewelryProducts } = require('./seed-jewelry-products');

async function seedAllNewProducts() {
  try {
    console.log('🚀 새로운 카테고리 상품 시드 데이터 생성 시작...');
    console.log('===============================================');
    
    // 가방 카테고리 상품 생성
    await seedBagsProducts();
    console.log('');
    
    // 아웃도어 카테고리 상품 생성
    await seedOutdoorProducts();
    console.log('');
    
    // 스포츠 카테고리 상품 생성
    await seedSportsProducts();
    console.log('');
    
    // 주얼리 카테고리 상품 생성
    await seedJewelryProducts();
    console.log('');
    
    console.log('===============================================');
    console.log('🎉 모든 카테고리 상품 생성 완료!');
    console.log('생성된 상품 수:');
    console.log('  - 가방: 10개');
    console.log('  - 아웃도어: 10개');
    console.log('  - 스포츠: 10개');
    console.log('  - 주얼리: 10개');
    console.log('  총 40개의 상품이 생성되었습니다.');
    
  } catch (error) {
    console.error('❌ 상품 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedAllNewProducts()
    .then(() => {
      console.log('모든 새 상품 시드 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('새 상품 시드 스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedAllNewProducts };
