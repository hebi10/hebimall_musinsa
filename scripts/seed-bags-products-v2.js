const { collection, doc, setDoc, writeBatch, serverTimestamp } = require('firebase/firestore');
const { db } = require('./util-firebase-config.js');

// 가방 상품 데이터
const bagsProducts = [
  {
    name: '레더 토트백',
    description: '고급 가죽으로 제작된 실용적인 토트백입니다. 일상과 비즈니스에 모두 어울리는 클래식한 디자인입니다.',
    price: 150000,
    originalPrice: 180000,
    saleRate: 17,
    category: 'bags',
    brand: 'CLASSIC',
    images: [
      '/images/bag-leather-tote-1.jpg',
      '/images/bag-leather-tote-2.jpg'
    ],
    mainImage: '/images/bag-leather-tote-1.jpg',
    colors: ['Black', 'Brown', 'Navy'],
    sizes: ['M', 'L'],
    tags: ['가죽', '토트백', '비즈니스', '데일리'],
    stock: 15,
    rating: 4.6,
    reviewCount: 23,
    isNew: false,
    isSale: true,
    isBest: false,
    status: 'active'
  },
  {
    name: '캔버스 백팩',
    description: '튼튼한 캔버스 소재의 백팩으로 학생부터 직장인까지 실용적으로 사용할 수 있습니다.',
    price: 89000,
    originalPrice: 89000,
    category: 'bags',
    brand: 'EVERYDAY',
    images: [
      '/images/bag-canvas-backpack-1.jpg',
      '/images/bag-canvas-backpack-2.jpg'
    ],
    mainImage: '/images/bag-canvas-backpack-1.jpg',
    colors: ['Khaki', 'Navy', 'Black'],
    sizes: ['One Size'],
    tags: ['캔버스', '백팩', '학생', '직장인'],
    stock: 25,
    rating: 4.4,
    reviewCount: 18,
    isNew: true,
    isSale: false,
    isBest: false,
    status: 'active'
  },
  {
    name: '미니 크로스백',
    description: '간편하게 들고 다닐 수 있는 미니 크로스백입니다. 스마트폰과 작은 소지품을 넣기에 완벽합니다.',
    price: 65000,
    originalPrice: 75000,
    saleRate: 13,
    category: 'bags',
    brand: 'MINIMAL',
    images: [
      '/images/bag-mini-cross-1.jpg',
      '/images/bag-mini-cross-2.jpg'
    ],
    mainImage: '/images/bag-mini-cross-1.jpg',
    colors: ['Pink', 'Beige', 'Black'],
    sizes: ['One Size'],
    tags: ['미니백', '크로스백', '데일리', '심플'],
    stock: 30,
    rating: 4.3,
    reviewCount: 15,
    isNew: false,
    isSale: true,
    isBest: false,
    status: 'active'
  },
  {
    name: '비즈니스 서류가방',
    description: '고급스러운 비즈니스 서류가방으로 노트북과 서류를 안전하게 보관할 수 있습니다.',
    price: 220000,
    originalPrice: 220000,
    category: 'bags',
    brand: 'BUSINESS',
    images: [
      '/images/bag-business-brief-1.jpg',
      '/images/bag-business-brief-2.jpg'
    ],
    mainImage: '/images/bag-business-brief-1.jpg',
    colors: ['Black', 'Brown'],
    sizes: ['15inch', '17inch'],
    tags: ['서류가방', '비즈니스', '노트북', '고급'],
    stock: 8,
    rating: 4.7,
    reviewCount: 12,
    isNew: false,
    isSale: false,
    isBest: true,
    status: 'active'
  },
  {
    name: '여행용 캐리어백',
    description: '여행이나 짧은 출장에 완벽한 휴대용 캐리어백입니다. 다양한 포켓으로 정리정돈이 쉽습니다.',
    price: 180000,
    originalPrice: 200000,
    saleRate: 10,
    category: 'bags',
    brand: 'TRAVEL',
    images: [
      '/images/bag-travel-carry-1.jpg',
      '/images/bag-travel-carry-2.jpg'
    ],
    mainImage: '/images/bag-travel-carry-1.jpg',
    colors: ['Gray', 'Navy', 'Black'],
    sizes: ['M', 'L'],
    tags: ['여행가방', '캐리어', '출장', '다기능'],
    stock: 12,
    rating: 4.5,
    reviewCount: 20,
    isNew: true,
    isSale: true,
    isBest: false,
    status: 'active'
  }
];

async function addBagsProducts() {
  console.log('🎒 가방 상품 추가 시작...\n');

  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const productData of bagsProducts) {
      // 카테고리별 상품 컬렉션에 추가
      const categoryProductRef = doc(collection(db, 'categories', 'bags', 'products'));

      const productWithTimestamp = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(categoryProductRef, productWithTimestamp);
      count++;

      console.log(`📦 ${productData.name} (${productData.brand})`);
      console.log(`   💰 ${productData.price.toLocaleString()}원 ${productData.saleRate ? `(${productData.saleRate}% 할인)` : ''}`);
      console.log(`   📍 categories/bags/products/${categoryProductRef.id}\n`);
    }

    await batch.commit();
    console.log(`✅ ${count}개의 가방 상품이 성공적으로 추가되었습니다!`);

  } catch (error) {
    console.error('❌ 상품 추가 실패:', error);
  }
}

// 스크립트 실행
addBagsProducts().then(() => {
  console.log('\n🎉 가방 상품 추가 완료!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ 스크립트 실행 실패:', error);
  process.exit(1);
});
