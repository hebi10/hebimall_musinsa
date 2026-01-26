const { db } = require('./util-firebase-config');
const { collection, addDoc, Timestamp } = require('firebase/firestore');

const products = [
  // 의류 카테고리
  {
    name: '베이직 코튼 티셔츠',
    description: '부드러운 코튼 소재로 제작된 베이직 티셔츠입니다. 일상 착용에 편안하고 스타일리시한 디자인입니다.',
    price: 29000,
    originalPrice: 35000,
    brand: 'STYNA',
    category: 'clothing',
    images: ['/images/products/tshirt-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'white', 'navy'],
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    isNew: true,
    isSale: true,
    saleRate: 17,
    tags: ['베스트', '신상', 'SALE', '코튼', '베이직'],
    status: 'active',
    sku: 'HEB-TS-001',
    details: {
      material: '코튼 100%',
      origin: '한국',
      manufacturer: 'STYNA',
      precautions: '찬물 세탁, 건조기 사용 금지',
      sizes: {
        S: { chest: 50, length: 67, shoulder: 44 },
        M: { chest: 53, length: 70, shoulder: 46 },
        L: { chest: 56, length: 73, shoulder: 48 },
        XL: { chest: 59, length: 76, shoulder: 50 }
      }
    }
  },
  {
    name: '오버핏 후드 스웨트셔츠',
    description: '편안한 오버핏으로 스타일리시한 후드 스웨트셔츠입니다. 캐주얼한 일상 룩에 완벽한 아이템입니다.',
    price: 65000,
    originalPrice: 79000,
    brand: 'STREET WEAR',
    category: 'clothing',
    images: ['/images/products/hoodie-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'gray', 'navy'],
    stock: 30,
    rating: 4.8,
    reviewCount: 89,
    isNew: false,
    isSale: true,
    saleRate: 18,
    tags: ['인기', 'SALE', '후드', '오버핏'],
    status: 'active',
    sku: 'HEB-HD-002',
    details: {
      material: '코튼 80%, 폴리에스터 20%',
      origin: '한국',
      manufacturer: 'STREET WEAR',
      precautions: '단독세탁, 표백제 사용 금지',
      sizes: {
        S: { chest: 55, length: 70, shoulder: 48 },
        M: { chest: 58, length: 73, shoulder: 50 },
        L: { chest: 61, length: 76, shoulder: 52 },
        XL: { chest: 64, length: 79, shoulder: 54 }
      }
    }
  },
  {
    name: '슬림핏 정장 셔츠',
    description: '깔끔한 슬림핏 정장 셔츠로 비즈니스 룩을 완성하세요. 고급스러운 소재와 완벽한 핏을 자랑합니다.',
    price: 45000,
    brand: 'FORMAL',
    category: 'clothing',
    images: ['/images/products/shirt-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['white', 'blue', 'gray'],
    stock: 25,
    rating: 4.3,
    reviewCount: 67,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['정장', '비즈니스', '슬림핏'],
    status: 'active',
    sku: 'HEB-SH-003',
    details: {
      material: '면 65%, 폴리에스터 35%',
      origin: '한국',
      manufacturer: 'FORMAL',
      precautions: '다림질 시 중온 사용',
      sizes: {
        S: { chest: 50, length: 75, shoulder: 42 },
        M: { chest: 53, length: 78, shoulder: 44 },
        L: { chest: 56, length: 81, shoulder: 46 },
        XL: { chest: 59, length: 84, shoulder: 48 }
      }
    }
  },
  {
    name: '스키니핏 청바지',
    description: '편안한 착용감의 스키니핏 청바지입니다. 스트레치 소재로 활동성이 뛰어납니다.',
    price: 55000,
    originalPrice: 69000,
    brand: 'DENIM CO',
    category: 'clothing',
    images: ['/images/products/jeans-1.jpg'],
    sizes: ['28', '30', '32', '34'],
    colors: ['blue', 'black'],
    stock: 40,
    rating: 4.4,
    reviewCount: 156,
    isNew: false,
    isSale: true,
    saleRate: 20,
    tags: ['베스트', 'SALE', '청바지', '스키니'],
    status: 'active',
    sku: 'HEB-JN-004',
    details: {
      material: '코튼 98%, 스판덱스 2%',
      origin: '한국',
      manufacturer: 'DENIM CO',
      precautions: '뒤집어서 세탁',
      sizes: {
        '28': { waist: 28, thigh: 24, length: 106 },
        '30': { waist: 30, thigh: 25, length: 108 },
        '32': { waist: 32, thigh: 26, length: 110 },
        '34': { waist: 34, thigh: 27, length: 112 }
      }
    }
  },
  
  // 신발 카테고리
  {
    name: '클래식 스니커즈',
    description: '어떤 스타일에도 잘 어울리는 클래식 스니커즈입니다. 편안한 착용감과 세련된 디자인을 겸비했습니다.',
    price: 89000,
    brand: 'SHOE BRAND',
    category: 'shoes',
    images: ['/images/products/sneakers-1.jpg'],
    sizes: ['240', '250', '260', '270', '280'],
    colors: ['white', 'black', 'navy'],
    stock: 35,
    rating: 4.6,
    reviewCount: 203,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '인기', '스니커즈', '클래식'],
    status: 'active',
    sku: 'HEB-SN-005',
    details: {
      material: '천연가죽, 고무',
      origin: '베트남',
      manufacturer: 'SHOE BRAND',
      precautions: '직사광선 피해 보관',
      sizes: {
        '240': { width: 9, height: 5 },
        '250': { width: 9.5, height: 5.5 },
        '260': { width: 10, height: 6 },
        '270': { width: 10.5, height: 6.5 },
        '280': { width: 11, height: 7 }
      }
    }
  },
  {
    name: '런닝화',
    description: '편안한 쿠셔닝으로 운동에 최적화된 런닝화입니다. 통기성과 안정성을 모두 갖춘 프리미엄 제품입니다.',
    price: 120000,
    originalPrice: 149000,
    brand: 'SPORTS',
    category: 'shoes',
    images: ['/images/products/running-1.jpg'],
    sizes: ['240', '250', '260', '270', '280'],
    colors: ['black', 'white', 'red'],
    stock: 28,
    rating: 4.7,
    reviewCount: 98,
    isNew: true,
    isSale: true,
    saleRate: 19,
    tags: ['신상', '운동', 'SALE', '런닝'],
    status: 'active',
    sku: 'HEB-RN-006',
    details: {
      material: '메쉬, 합성수지',
      origin: '베트남',
      manufacturer: 'SPORTS',
      precautions: '운동 후 통풍 보관',
      sizes: {
        '240': { width: 9, height: 5 },
        '250': { width: 9.5, height: 5.5 },
        '260': { width: 10, height: 6 },
        '270': { width: 10.5, height: 6.5 },
        '280': { width: 11, height: 7 }
      }
    }
  },
  
  // 가방 카테고리
  {
    name: '캐주얼 백팩',
    description: '일상에서 사용하기 좋은 심플한 디자인의 백팩입니다. 충분한 수납공간과 편안한 착용감을 제공합니다.',
    price: 45000,
    brand: 'BAG BRAND',
    category: 'bags',
    images: ['/images/products/backpack-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'navy', 'gray'],
    stock: 22,
    rating: 4.2,
    reviewCount: 45,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['일상', '캐주얼', '백팩'],
    status: 'active',
    sku: 'HEB-BP-007',
    details: {
      material: '나일론, 폴리에스터',
      origin: '중국',
      manufacturer: 'BAG BRAND',
      precautions: '손세탁 권장',
      sizes: {
        'ONE SIZE': { width: 30, height: 45, depth: 15 }
      }
    }
  },
  {
    name: '레더 토트백',
    description: '고급 천연가죽으로 제작된 우아한 토트백입니다. 비즈니스와 일상 모두에 어울리는 세련된 디자인입니다.',
    price: 89000,
    originalPrice: 120000,
    brand: 'LEATHER CO',
    category: 'bags',
    images: ['/images/products/tote-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'brown', 'beige'],
    stock: 18,
    rating: 4.8,
    reviewCount: 72,
    isNew: false,
    isSale: true,
    saleRate: 26,
    tags: ['가죽', '토트백', 'SALE', '프리미엄'],
    status: 'active',
    sku: 'HEB-TB-008',
    details: {
      material: '천연가죽 100%',
      origin: '이탈리아',
      manufacturer: 'LEATHER CO',
      precautions: '습기 피해 보관, 가죽 전용 클리너 사용',
      sizes: {
        'ONE SIZE': { width: 35, height: 30, depth: 12 }
      }
    }
  },
  
  // 액세서리 카테고리
  {
    name: '레더 벨트',
    description: '고급 천연가죽으로 제작된 클래식 벨트입니다. 어떤 스타일에도 잘 어울리는 필수 아이템입니다.',
    price: 35000,
    brand: 'LEATHER CO',
    category: 'accessories',
    images: ['/images/products/belt-1.jpg'],
    sizes: ['90', '95', '100', '105'],
    colors: ['black', 'brown'],
    stock: 18,
    rating: 4.5,
    reviewCount: 67,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['가죽', '클래식', '벨트'],
    status: 'active',
    sku: 'HEB-BT-009',
    details: {
      material: '천연가죽 100%',
      origin: '이탈리아',
      manufacturer: 'LEATHER CO',
      precautions: '습기 피해 보관',
      sizes: {
        '90': { length: 90, width: 3 },
        '95': { length: 95, width: 3 },
        '100': { length: 100, width: 3 },
        '105': { length: 105, width: 3 }
      }
    }
  },
  {
    name: '클래식 모자',
    description: '심플하고 세련된 디자인의 클래식 모자입니다. 사계절 착용 가능한 베이직 아이템입니다.',
    price: 25000,
    brand: 'HAT BRAND',
    category: 'accessories',
    images: ['/images/products/hat-1.jpg'],
    sizes: ['FREE'],
    colors: ['black', 'navy', 'beige'],
    stock: 30,
    rating: 4.3,
    reviewCount: 84,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['모자', '클래식', '베이직'],
    status: 'active',
    sku: 'HEB-HT-010',
    details: {
      material: '코튼 100%',
      origin: '한국',
      manufacturer: 'HAT BRAND',
      precautions: '형태 유지를 위해 조심스럽게 보관',
      sizes: {
        'FREE': { width: 58, height: 12 }
      }
    }
  }
];

async function seedProducts() {
  try {
    console.log('📦 상품 시드 데이터 생성 시작...');
    
    for (const product of products) {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ 상품 생성 완료: ${product.name} (${docRef.id})`);
    }
    
    console.log('🎉 모든 상품 생성 완료!');
    console.log(`총 ${products.length}개의 상품이 생성되었습니다.`);
  } catch (error) {
    console.error('❌ 상품 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedProducts };
