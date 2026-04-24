const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'hebimall'
  });
}

const db = admin.firestore();

// 가방 카테고리 데이터
const bagsCategory = {
  id: 'bags',
  name: 'Bags',
  description: '실용성과 스타일을 겸비한 가방 컬렉션',
  icon: '👜',
  color: '#ffc107',
  order: 3,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// 가방 상품 데이터 (10개)
const bagsProducts = [
  { name: '가죽 토트백', brand: 'LEATHER', price: 129000, originalPrice: 159000, rating: 4.7, reviewCount: 145, description: '고급 가죽 토트백', mainImage: '/images/products/leather-tote.jpg', isSale: true, saleRate: 19 },
  { name: '백팩', brand: 'DAILY', price: 65000, originalPrice: null, rating: 4.5, reviewCount: 234, description: '일상용 편안한 백팩', mainImage: '/images/products/backpack.jpg', isSale: false, saleRate: 0 },
  { name: '크로스백', brand: 'SMALL', price: 45000, originalPrice: 59000, rating: 4.3, reviewCount: 189, description: '실용적인 크로스백', mainImage: '/images/products/crossbag.jpg', isSale: true, saleRate: 24 },
  { name: '클러치백', brand: 'EVENING', price: 89000, originalPrice: null, rating: 4.6, reviewCount: 78, description: '이브닝용 클러치백', mainImage: '/images/products/clutch.jpg', isSale: false, saleRate: 0 },
  { name: '숄더백', brand: 'CLASSIC', price: 95000, originalPrice: 120000, rating: 4.8, reviewCount: 167, description: '클래식 숄더백', mainImage: '/images/products/shoulder-bag.jpg', isSale: true, saleRate: 21 },
  { name: '미니백', brand: 'MINI', price: 35000, originalPrice: null, rating: 4.2, reviewCount: 156, description: '귀여운 미니백', mainImage: '/images/products/mini-bag.jpg', isSale: false, saleRate: 0 },
  { name: '비즈니스 가방', brand: 'BUSINESS', price: 149000, originalPrice: 189000, rating: 4.9, reviewCount: 89, description: '전문적인 비즈니스 가방', mainImage: '/images/products/business-bag.jpg', isSale: true, saleRate: 21 },
  { name: '웨이스트백', brand: 'SPORT', price: 39000, originalPrice: null, rating: 4.1, reviewCount: 123, description: '활동적인 웨이스트백', mainImage: '/images/products/waist-bag.jpg', isSale: false, saleRate: 0 },
  { name: '여행용 캐리어', brand: 'TRAVEL', price: 199000, originalPrice: 249000, rating: 4.7, reviewCount: 134, description: '견고한 여행용 캐리어', mainImage: '/images/products/suitcase.jpg', isSale: true, saleRate: 20 },
  { name: '버킷백', brand: 'TRENDY', price: 75000, originalPrice: null, rating: 4.4, reviewCount: 198, description: '트렌디한 버킷백', mainImage: '/images/products/bucket-bag.jpg', isSale: false, saleRate: 0 }
];

async function createBagsCategory() {
  console.log('👜 가방 카테고리 생성 시작...\n');

  try {
    // 1. 가방 카테고리 문서 생성
    const categoryRef = db.collection('categories').doc('bags');
    await categoryRef.set(bagsCategory);
    console.log('✅ 가방 카테고리 문서 생성 완료');

    // 2. 가방 상품들 추가
    console.log('\n📦 가방 상품 추가 중...');
    
    let addedCount = 0;
    
    for (const product of bagsProducts) {
      const productRef = categoryRef.collection('products').doc();
      
      const productData = {
        ...product,
        category: 'bags',
        stock: Math.floor(Math.random() * 50) + 10, // 10-59 랜덤 재고
        isNew: Math.random() > 0.7, // 30% 확률로 신상품
        tags: ['bags', product.brand.toLowerCase()],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await productRef.set(productData);
      console.log(`  ✅ ${product.name} 추가 완료`);
      addedCount++;
    }

    console.log('\n🎉 가방 카테고리 및 상품 생성 완료!');
    console.log(`카테고리: bags`);
    console.log(`📦 상품 수: ${addedCount}개`);
    console.log(`🔗 경로: /categories/bags/products`);

  } catch (error) {
    console.error('❌ 생성 실패:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  createBagsCategory()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}
