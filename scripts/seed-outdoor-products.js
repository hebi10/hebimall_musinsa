const { db } = require('./firebase-config');
const { collection, addDoc, Timestamp } = require('firebase/firestore');

const outdoorProducts = [
  {
    name: '프로 등산 백팩',
    description: '전문 등산가를 위한 고성능 백팩입니다. 방수 기능과 체계적인 수납 구조로 장거리 트레킹에 최적화되어 있습니다.',
    price: 245000,
    originalPrice: 320000,
    brand: 'MOUNTAIN PRO',
    category: 'outdoor',
    images: ['/images/products/mountain-backpack-1.jpg'],
    sizes: ['50L', '65L', '80L'],
    colors: ['forest green', 'black', 'navy'],
    stock: 18,
    rating: 4.8,
    reviewCount: 156,
    isNew: true,
    isSale: true,
    saleRate: 23,
    tags: ['신상', '등산', '백팩', 'SALE', '방수', '프로'],
    status: 'active',
    sku: 'HEB-OUT-001',
    details: {
      material: '립스톱 나일론, 방수 코팅',
      origin: '한국',
      manufacturer: 'MOUNTAIN PRO',
      precautions: '손세탁 권장, 지퍼 관리 필수',
      sizes: {
        '50L': { weight: '2.1kg', capacity: '50L' },
        '65L': { weight: '2.4kg', capacity: '65L' },
        '80L': { weight: '2.8kg', capacity: '80L' }
      }
    }
  },
  {
    name: '4계절 다운 재킷',
    description: '프리미엄 구스다운으로 충전된 4계절 재킷입니다. 경량이면서도 뛰어난 보온성을 제공하는 아웃도어 필수 아이템입니다.',
    price: 189000,
    originalPrice: 240000,
    brand: 'OUTDOOR MASTER',
    category: 'outdoor',
    images: ['/images/products/down-jacket-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['black', 'navy', 'red', 'olive'],
    stock: 32,
    rating: 4.9,
    reviewCount: 234,
    isNew: false,
    isSale: true,
    saleRate: 21,
    tags: ['다운', '재킷', 'SALE', '4계절', '경량'],
    status: 'active',
    sku: 'HEB-OUT-002',
    details: {
      material: '나일론 100%, 구스다운 90%',
      origin: '한국',
      manufacturer: 'OUTDOOR MASTER',
      precautions: '드라이클리닝만 가능, 압축 보관 금지',
      sizes: {
        'S': { chest: 52, length: 70, sleeve: 63 },
        'M': { chest: 55, length: 73, sleeve: 65 },
        'L': { chest: 58, length: 76, sleeve: 67 },
        'XL': { chest: 61, length: 79, sleeve: 69 },
        'XXL': { chest: 64, length: 82, sleeve: 71 }
      }
    }
  },
  {
    name: '방수 트레킹 부츠',
    description: '거친 산악지형에서도 안전한 방수 트레킹 부츠입니다. 뛰어난 그립력과 발목 보호 기능으로 전문가들이 인정하는 제품입니다.',
    price: 165000,
    brand: 'TRAIL KING',
    category: 'outdoor',
    images: ['/images/products/trekking-boots-1.jpg'],
    sizes: ['240', '250', '260', '270', '280', '290'],
    colors: ['brown', 'black', 'gray'],
    stock: 28,
    rating: 4.7,
    reviewCount: 189,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '트레킹', '부츠', '방수', '등산화'],
    status: 'active',
    sku: 'HEB-OUT-003',
    details: {
      material: '천연가죽, 고어텍스, 비브람 아웃솔',
      origin: '이탈리아',
      manufacturer: 'TRAIL KING',
      precautions: '사용 후 통풍건조, 가죽 관리 필수',
      sizes: {
        '240': { length: 24, width: 9 },
        '250': { length: 25, width: 9.5 },
        '260': { length: 26, width: 10 },
        '270': { length: 27, width: 10.5 },
        '280': { length: 28, width: 11 },
        '290': { length: 29, width: 11.5 }
      }
    }
  },
  {
    name: '멀티 기능 텐트',
    description: '2-3인용 멀티 기능 텐트로 캠핑과 백패킹에 모두 적합합니다. 간편한 설치와 우수한 방수성능을 자랑합니다.',
    price: 135000,
    originalPrice: 180000,
    brand: 'CAMP MASTER',
    category: 'outdoor',
    images: ['/images/products/multi-tent-1.jpg'],
    sizes: ['2인용', '3인용'],
    colors: ['green', 'orange', 'blue'],
    stock: 22,
    rating: 4.6,
    reviewCount: 95,
    isNew: false,
    isSale: true,
    saleRate: 25,
    tags: ['텐트', '캠핑', 'SALE', '백패킹', '방수'],
    status: 'active',
    sku: 'HEB-OUT-004',
    details: {
      material: '폴리에스터 립스톱, 알루미늄 폴',
      origin: '중국',
      manufacturer: 'CAMP MASTER',
      precautions: '완전 건조 후 보관, 날카로운 물체 주의',
      sizes: {
        '2인용': { length: 210, width: 150, height: 110, weight: '2.5kg' },
        '3인용': { length: 230, width: 180, height: 120, weight: '3.2kg' }
      }
    }
  },
  {
    name: '울트라라이트 슬리핑백',
    description: '초경량 소재로 제작된 3계절용 슬리핑백입니다. 백패킹과 장거리 트레킹에서 무게 부담을 최소화한 프리미엄 제품입니다.',
    price: 95000,
    originalPrice: 125000,
    brand: 'LIGHT GEAR',
    category: 'outdoor',
    images: ['/images/products/ultralight-sleeping-1.jpg'],
    sizes: ['REGULAR', 'LONG'],
    colors: ['blue', 'green', 'gray'],
    stock: 35,
    rating: 4.5,
    reviewCount: 127,
    isNew: true,
    isSale: true,
    saleRate: 24,
    tags: ['신상', '슬리핑백', 'SALE', '울트라라이트', '백패킹'],
    status: 'active',
    sku: 'HEB-OUT-005',
    details: {
      material: '다운 90%, 나일론 립스톱',
      origin: '한국',
      manufacturer: 'LIGHT GEAR',
      precautions: '압축보관 가능, 정기적 풀어서 보관',
      sizes: {
        'REGULAR': { length: 190, width: 75, weight: '850g', temp: '-5°C' },
        'LONG': { length: 210, width: 80, weight: '920g', temp: '-5°C' }
      }
    }
  },
  {
    name: '고성능 헤드램프',
    description: '야간 활동과 동굴 탐험에 필수인 고성능 헤드램프입니다. 장시간 사용 가능한 배터리와 방수 기능을 갖춘 프로급 제품입니다.',
    price: 85000,
    brand: 'NIGHT VISION',
    category: 'outdoor',
    images: ['/images/products/headlamp-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'red', 'blue'],
    stock: 45,
    rating: 4.8,
    reviewCount: 203,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['헤드램프', '야간', '등산', '방수', 'LED'],
    status: 'active',
    sku: 'HEB-OUT-006',
    details: {
      material: '알루미늄 합금, 실리콘',
      origin: '독일',
      manufacturer: 'NIGHT VISION',
      precautions: '배터리 분리 보관, 방수등급 IPX7',
      sizes: {
        'ONE SIZE': { weight: '95g', brightness: '1000루멘', runtime: '50시간' }
      }
    }
  },
  {
    name: '프리미엄 등산스틱',
    description: '카본파이버 소재의 프리미엄 등산스틱입니다. 초경량이면서도 강도가 높아 전문 등산가들이 선호하는 최고급 제품입니다.',
    price: 125000,
    originalPrice: 165000,
    brand: 'CARBON TREK',
    category: 'outdoor',
    images: ['/images/products/carbon-poles-1.jpg'],
    sizes: ['100-135cm', '110-145cm'],
    colors: ['black', 'silver', 'red'],
    stock: 30,
    rating: 4.9,
    reviewCount: 78,
    isNew: true,
    isSale: true,
    saleRate: 24,
    tags: ['신상', '등산스틱', 'SALE', '카본', '프리미엄'],
    status: 'active',
    sku: 'HEB-OUT-007',
    details: {
      material: '카본파이버 100%',
      origin: '한국',
      manufacturer: 'CARBON TREK',
      precautions: '충격 주의, 건조한 곳 보관',
      sizes: {
        '100-135cm': { weight: '220g/pair', sections: '3단' },
        '110-145cm': { weight: '240g/pair', sections: '3단' }
      }
    }
  },
  {
    name: '멀티툴 서바이벌 키트',
    description: '아웃도어 활동에 필수인 멀티툴 서바이벌 키트입니다. 나이프, 톱, 가위 등 다양한 도구가 하나로 통합된 컴팩트한 제품입니다.',
    price: 65000,
    brand: 'SURVIVAL GEAR',
    category: 'outdoor',
    images: ['/images/products/multitool-kit-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['black', 'camo', 'orange'],
    stock: 40,
    rating: 4.6,
    reviewCount: 142,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['멀티툴', '서바이벌', '캠핑', '나이프'],
    status: 'active',
    sku: 'HEB-OUT-008',
    details: {
      material: '스테인리스 스틸, 알루미늄',
      origin: '스위스',
      manufacturer: 'SURVIVAL GEAR',
      precautions: '날카로운 부분 주의, 정기적 오일링',
      sizes: {
        'ONE SIZE': { weight: '180g', tools: '17가지', length: '11cm' }
      }
    }
  },
  {
    name: '방수 드라이백 세트',
    description: '완전 방수 드라이백 세트로 물가 활동과 래프팅에 필수입니다. 다양한 크기로 구성되어 효율적인 짐 정리가 가능합니다.',
    price: 45000,
    originalPrice: 60000,
    brand: 'WATER PROOF',
    category: 'outdoor',
    images: ['/images/products/drybag-set-1.jpg'],
    sizes: ['5L+10L+20L', '10L+20L+40L'],
    colors: ['yellow', 'blue', 'red'],
    stock: 38,
    rating: 4.4,
    reviewCount: 167,
    isNew: false,
    isSale: true,
    saleRate: 25,
    tags: ['드라이백', '방수', 'SALE', '래프팅', '세트'],
    status: 'active',
    sku: 'HEB-OUT-009',
    details: {
      material: 'PVC 타폴린 500D',
      origin: '중국',
      manufacturer: 'WATER PROOF',
      precautions: '날카로운 물체와 접촉 금지',
      sizes: {
        '5L+10L+20L': { pieces: '3개', weight: '420g' },
        '10L+20L+40L': { pieces: '3개', weight: '680g' }
      }
    }
  },
  {
    name: '아웃도어 쿠킹 세트',
    description: '캠핑과 백패킹용 올인원 쿠킹 세트입니다. 컴팩트한 사이즈에 요리에 필요한 모든 도구가 포함된 실용적인 제품입니다.',
    price: 75000,
    originalPrice: 95000,
    brand: 'CAMP COOK',
    category: 'outdoor',
    images: ['/images/products/cooking-set-1.jpg'],
    sizes: ['1-2인용', '2-4인용'],
    colors: ['silver', 'black', 'blue'],
    stock: 25,
    rating: 4.7,
    reviewCount: 89,
    isNew: true,
    isSale: true,
    saleRate: 21,
    tags: ['신상', '쿠킹세트', 'SALE', '캠핑', '백패킹'],
    status: 'active',
    sku: 'HEB-OUT-010',
    details: {
      material: '알루미늄 합금, 스테인리스 스틸',
      origin: '한국',
      manufacturer: 'CAMP COOK',
      precautions: '사용 후 완전 건조, 중성세제 사용',
      sizes: {
        '1-2인용': { pieces: '8개', weight: '650g' },
        '2-4인용': { pieces: '12개', weight: '980g' }
      }
    }
  }
];

async function seedOutdoorProducts() {
  try {
    console.log('🏔️ 아웃도어 카테고리 상품 시드 데이터 생성 시작...');
    
    for (const product of outdoorProducts) {
      const now = Timestamp.now();
      // categories/outdoor/products 중첩 컬렉션에 추가
      const docRef = await addDoc(collection(db, 'categories', 'outdoor', 'products'), {
        ...product,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ 아웃도어 상품 생성 완료: ${product.name} (categories/outdoor/products/${docRef.id})`);
    }
    
    console.log('🎉 아웃도어 카테고리 상품 생성 완료!');
    console.log(`총 ${outdoorProducts.length}개의 아웃도어 상품이 생성되었습니다.`);
  } catch (error) {
    console.error('❌ 아웃도어 상품 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedOutdoorProducts()
    .then(() => {
      console.log('아웃도어 상품 시드 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('아웃도어 상품 시드 스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedOutdoorProducts };
