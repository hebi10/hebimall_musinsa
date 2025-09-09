const { db } = require('./firebase-config');
const { collection, addDoc, Timestamp } = require('firebase/firestore');

const bagsProducts = [
  {
    name: '클래식 레더 백팩',
    description: '고급 천연가죽으로 제작된 프리미엄 백팩입니다. 비즈니스와 캐주얼 모두에 어울리는 세련된 디자인으로 충분한 수납공간을 제공합니다.',
    price: 189000,
    originalPrice: 230000,
    brand: 'LEATHER MASTER',
    category: 'bags',
    images: ['/images/products/leather-backpack-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'brown', 'navy'],
    stock: 25,
    rating: 4.7,
    reviewCount: 142,
    isNew: true,
    isSale: true,
    saleRate: 18,
    tags: ['신상', '가죽', '백팩', 'SALE', '프리미엄'],
    status: 'active',
    sku: 'HEB-BAG-001',
    details: {
      material: '천연가죽 100%',
      origin: '이탈리아',
      manufacturer: 'LEATHER MASTER',
      precautions: '습기 피해 보관, 가죽 전용 클리너 사용',
      sizes: {
        'ONE SIZE': { width: 32, height: 42, depth: 16, capacity: '20L' }
      }
    }
  },
  {
    name: '미니멀 토트백',
    description: '심플하고 세련된 디자인의 미니멀 토트백입니다. 데일리 사용에 완벽한 크기와 실용적인 구조로 어떤 스타일에도 잘 어울립니다.',
    price: 89000,
    originalPrice: 110000,
    brand: 'MINIMAL BAG',
    category: 'bags',
    images: ['/images/products/minimal-tote-1.jpg'],
    sizes: ['SMALL', 'LARGE'],
    colors: ['black', 'beige', 'gray', 'white'],
    stock: 35,
    rating: 4.5,
    reviewCount: 89,
    isNew: false,
    isSale: true,
    saleRate: 19,
    tags: ['토트백', '미니멀', 'SALE', '데일리'],
    status: 'active',
    sku: 'HEB-BAG-002',
    details: {
      material: '캔버스 60%, 가죽 40%',
      origin: '한국',
      manufacturer: 'MINIMAL BAG',
      precautions: '손세탁 권장',
      sizes: {
        'SMALL': { width: 30, height: 25, depth: 10 },
        'LARGE': { width: 38, height: 32, depth: 12 }
      }
    }
  },
  {
    name: '스포츠 더플백',
    description: '운동이나 여행에 최적화된 대용량 더플백입니다. 내구성 있는 소재와 다양한 수납공간으로 활동적인 라이프스타일에 완벽합니다.',
    price: 65000,
    brand: 'SPORT GEAR',
    category: 'bags',
    images: ['/images/products/sport-duffle-1.jpg'],
    sizes: ['MEDIUM', 'LARGE'],
    colors: ['black', 'navy', 'red'],
    stock: 40,
    rating: 4.6,
    reviewCount: 156,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '스포츠', '더플백', '여행'],
    status: 'active',
    sku: 'HEB-BAG-003',
    details: {
      material: '나일론 100%',
      origin: '베트남',
      manufacturer: 'SPORT GEAR',
      precautions: '세탁기 사용 가능, 저온 건조',
      sizes: {
        'MEDIUM': { width: 50, height: 25, depth: 25, capacity: '35L' },
        'LARGE': { width: 60, height: 30, depth: 30, capacity: '50L' }
      }
    }
  },
  {
    name: '빈티지 메신저백',
    description: '레트로한 감성의 빈티지 메신저백입니다. 캔버스와 가죽의 조화로 완성된 독특한 디자인이 특징입니다.',
    price: 75000,
    originalPrice: 95000,
    brand: 'VINTAGE SOUL',
    category: 'bags',
    images: ['/images/products/vintage-messenger-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['khaki', 'brown', 'black'],
    stock: 28,
    rating: 4.4,
    reviewCount: 73,
    isNew: false,
    isSale: true,
    saleRate: 21,
    tags: ['빈티지', '메신저백', 'SALE', '캔버스'],
    status: 'active',
    sku: 'HEB-BAG-004',
    details: {
      material: '캔버스 70%, 가죽 30%',
      origin: '한국',
      manufacturer: 'VINTAGE SOUL',
      precautions: '드라이클리닝 권장',
      sizes: {
        'ONE SIZE': { width: 35, height: 28, depth: 12 }
      }
    }
  },
  {
    name: '럭셔리 핸드백',
    description: '세련된 디자인의 럭셔리 핸드백입니다. 특별한 날이나 포멀한 자리에 완벽한 고급스러운 아이템입니다.',
    price: 320000,
    originalPrice: 420000,
    brand: 'LUXURY LINE',
    category: 'bags',
    images: ['/images/products/luxury-handbag-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'burgundy', 'navy'],
    stock: 15,
    rating: 4.9,
    reviewCount: 45,
    isNew: true,
    isSale: true,
    saleRate: 24,
    tags: ['신상', '럭셔리', '핸드백', 'SALE', '프리미엄'],
    status: 'active',
    sku: 'HEB-BAG-005',
    details: {
      material: '이탈리아 천연가죽 100%',
      origin: '이탈리아',
      manufacturer: 'LUXURY LINE',
      precautions: '전용 보관함 사용, 습기 차단',
      sizes: {
        'ONE SIZE': { width: 30, height: 22, depth: 15 }
      }
    }
  },
  {
    name: '캐주얼 크로스백',
    description: '일상에서 편리하게 사용할 수 있는 가벼운 크로스백입니다. 콤팩트한 사이즈로 필수품만 깔끔하게 수납 가능합니다.',
    price: 35000,
    brand: 'DAILY STYLE',
    category: 'bags',
    images: ['/images/products/casual-crossbag-1.jpg'],
    sizes: ['SMALL', 'MEDIUM'],
    colors: ['black', 'brown', 'beige', 'pink'],
    stock: 50,
    rating: 4.3,
    reviewCount: 198,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['크로스백', '캐주얼', '데일리', '가벼운'],
    status: 'active',
    sku: 'HEB-BAG-006',
    details: {
      material: '인조가죽 100%',
      origin: '중국',
      manufacturer: 'DAILY STYLE',
      precautions: '물에 젖지 않도록 주의',
      sizes: {
        'SMALL': { width: 20, height: 15, depth: 8 },
        'MEDIUM': { width: 25, height: 18, depth: 10 }
      }
    }
  },
  {
    name: '프리미엄 서류가방',
    description: '비즈니스 전용 프리미엄 서류가방입니다. 노트북과 서류를 안전하게 보관할 수 있는 전문적인 디자인입니다.',
    price: 145000,
    originalPrice: 180000,
    brand: 'BUSINESS PRO',
    category: 'bags',
    images: ['/images/products/premium-briefcase-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'brown'],
    stock: 20,
    rating: 4.8,
    reviewCount: 67,
    isNew: false,
    isSale: true,
    saleRate: 19,
    tags: ['서류가방', '비즈니스', 'SALE', '노트북'],
    status: 'active',
    sku: 'HEB-BAG-007',
    details: {
      material: '천연가죽 100%',
      origin: '한국',
      manufacturer: 'BUSINESS PRO',
      precautions: '가죽 전용 관리용품 사용',
      sizes: {
        'ONE SIZE': { width: 40, height: 30, depth: 10, laptopSize: '15.6인치' }
      }
    }
  },
  {
    name: '에코 숄더백',
    description: '친환경 소재로 제작된 에코 숄더백입니다. 지속가능한 패션을 추구하는 분들에게 추천하는 아이템입니다.',
    price: 55000,
    brand: 'ECO GREEN',
    category: 'bags',
    images: ['/images/products/eco-shoulder-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['natural', 'green', 'brown'],
    stock: 30,
    rating: 4.4,
    reviewCount: 124,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '에코', '숄더백', '친환경'],
    status: 'active',
    sku: 'HEB-BAG-008',
    details: {
      material: '유기농 코튼 80%, 재활용 폴리에스터 20%',
      origin: '한국',
      manufacturer: 'ECO GREEN',
      precautions: '찬물 세탁, 자연건조',
      sizes: {
        'ONE SIZE': { width: 32, height: 28, depth: 12 }
      }
    }
  },
  {
    name: '여행용 캐리어백',
    description: '여행에 최적화된 다기능 캐리어백입니다. 분리 가능한 구조와 다양한 포켓으로 여행의 편리함을 더합니다.',
    price: 95000,
    originalPrice: 125000,
    brand: 'TRAVEL MATE',
    category: 'bags',
    images: ['/images/products/travel-carrier-1.jpg'],
    sizes: ['MEDIUM', 'LARGE'],
    colors: ['black', 'navy', 'gray'],
    stock: 22,
    rating: 4.6,
    reviewCount: 88,
    isNew: true,
    isSale: true,
    saleRate: 24,
    tags: ['신상', '여행', 'SALE', '캐리어', '다기능'],
    status: 'active',
    sku: 'HEB-BAG-009',
    details: {
      material: '폴리에스터 100%',
      origin: '중국',
      manufacturer: 'TRAVEL MATE',
      precautions: '세탁기 사용 가능, 낮은 온도 건조',
      sizes: {
        'MEDIUM': { width: 45, height: 35, depth: 20, capacity: '40L' },
        'LARGE': { width: 55, height: 40, depth: 25, capacity: '60L' }
      }
    }
  },
  {
    name: '디자이너 클러치백',
    description: '독창적인 디자인의 디자이너 클러치백입니다. 파티나 특별한 모임에서 개성을 표현할 수 있는 아트적인 아이템입니다.',
    price: 125000,
    originalPrice: 155000,
    brand: 'DESIGNER HOUSE',
    category: 'bags',
    images: ['/images/products/designer-clutch-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['gold', 'silver', 'black', 'red'],
    stock: 18,
    rating: 4.7,
    reviewCount: 52,
    isNew: false,
    isSale: true,
    saleRate: 19,
    tags: ['디자이너', '클러치', 'SALE', '파티', '아트'],
    status: 'active',
    sku: 'HEB-BAG-010',
    details: {
      material: '인조가죽 70%, 메탈 장식 30%',
      origin: '이탈리아',
      manufacturer: 'DESIGNER HOUSE',
      precautions: '부드러운 천으로 닦기, 직사광선 피함',
      sizes: {
        'ONE SIZE': { width: 25, height: 15, depth: 5 }
      }
    }
  }
];

async function seedBagsProducts() {
  try {
    console.log('👜 가방 카테고리 상품 시드 데이터 생성 시작...');
    
    for (const product of bagsProducts) {
      const now = Timestamp.now();
      // categories/bags/products 중첩 컬렉션에 추가
      const docRef = await addDoc(collection(db, 'categories', 'bags', 'products'), {
        ...product,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ 가방 상품 생성 완료: ${product.name} (categories/bags/products/${docRef.id})`);
    }
    
    console.log('🎉 가방 카테고리 상품 생성 완료!');
    console.log(`총 ${bagsProducts.length}개의 가방 상품이 생성되었습니다.`);
  } catch (error) {
    console.error('❌ 가방 상품 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedBagsProducts()
    .then(() => {
      console.log('가방 상품 시드 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('가방 상품 시드 스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedBagsProducts };
