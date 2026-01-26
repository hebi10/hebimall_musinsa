const { db } = require('./util-firebase-config');
const { collection, addDoc, Timestamp } = require('firebase/firestore');

const sportsProducts = [
  {
    name: '프로 런닝화',
    description: '전문 러너를 위한 고성능 런닝화입니다. 최첨단 쿠셔닝 기술과 경량 소재로 최고의 달리기 경험을 제공합니다.',
    price: 185000,
    originalPrice: 230000,
    brand: 'RUN ELITE',
    category: 'sports',
    images: ['/images/products/pro-running-shoes-1.jpg'],
    sizes: ['240', '250', '260', '270', '280', '290'],
    colors: ['black', 'white', 'blue', 'red'],
    stock: 42,
    rating: 4.9,
    reviewCount: 278,
    isNew: true,
    isSale: true,
    saleRate: 20,
    tags: ['신상', '런닝화', 'SALE', '프로', '쿠셔닝'],
    status: 'active',
    sku: 'HEB-SPT-001',
    details: {
      material: '플라이니트, 에어 쿠션, 카본 플레이트',
      origin: '베트남',
      manufacturer: 'RUN ELITE',
      precautions: '운동 후 통풍 건조, 세탁기 사용 금지',
      sizes: {
        '240': { length: 24, width: 9, drop: '8mm' },
        '250': { length: 25, width: 9.5, drop: '8mm' },
        '260': { length: 26, width: 10, drop: '8mm' },
        '270': { length: 27, width: 10.5, drop: '8mm' },
        '280': { length: 28, width: 11, drop: '8mm' },
        '290': { length: 29, width: 11.5, drop: '8mm' }
      }
    }
  },
  {
    name: '요가 매트 프리미엄',
    description: '천연고무 소재의 프리미엄 요가 매트입니다. 뛰어난 그립감과 쿠셔닝으로 안전하고 편안한 요가 수련을 도와줍니다.',
    price: 89000,
    originalPrice: 120000,
    brand: 'YOGA MASTER',
    category: 'sports',
    images: ['/images/products/premium-yoga-mat-1.jpg'],
    sizes: ['6mm', '8mm'],
    colors: ['purple', 'pink', 'blue', 'green', 'black'],
    stock: 35,
    rating: 4.8,
    reviewCount: 195,
    isNew: false,
    isSale: true,
    saleRate: 26,
    tags: ['요가매트', 'SALE', '천연고무', '프리미엄', '그립'],
    status: 'active',
    sku: 'HEB-SPT-002',
    details: {
      material: '천연고무 100%',
      origin: '인도',
      manufacturer: 'YOGA MASTER',
      precautions: '직사광선 피해 보관, 중성세제로 세척',
      sizes: {
        '6mm': { length: 183, width: 61, thickness: 6, weight: '1.8kg' },
        '8mm': { length: 183, width: 61, thickness: 8, weight: '2.2kg' }
      }
    }
  },
  {
    name: '헬스 덤벨 세트',
    description: '홈트레이닝과 헬스장에서 모두 사용 가능한 조절식 덤벨 세트입니다. 다양한 무게 조절로 효과적인 근력운동이 가능합니다.',
    price: 295000,
    originalPrice: 380000,
    brand: 'STRENGTH PRO',
    category: 'sports',
    images: ['/images/products/adjustable-dumbbell-1.jpg'],
    sizes: ['20kg×2', '30kg×2'],
    colors: ['black', 'silver'],
    stock: 15,
    rating: 4.7,
    reviewCount: 142,
    isNew: true,
    isSale: true,
    saleRate: 22,
    tags: ['신상', '덤벨', 'SALE', '홈트레이닝', '조절식'],
    status: 'active',
    sku: 'HEB-SPT-003',
    details: {
      material: '주철, 고무 코팅',
      origin: '중국',
      manufacturer: 'STRENGTH PRO',
      precautions: '안전한 장소에 보관, 정기적 볼트 점검',
      sizes: {
        '20kg×2': { maxWeight: '20kg', minWeight: '2.5kg', pieces: '2개' },
        '30kg×2': { maxWeight: '30kg', minWeight: '2.5kg', pieces: '2개' }
      }
    }
  },
  {
    name: '프로 축구화',
    description: '프로 선수들이 사용하는 고성능 축구화입니다. 탁월한 볼 터치감과 그립력으로 경기력 향상에 도움을 줍니다.',
    price: 165000,
    brand: 'SOCCER KING',
    category: 'sports',
    images: ['/images/products/pro-soccer-cleats-1.jpg'],
    sizes: ['240', '250', '260', '270', '280'],
    colors: ['white', 'black', 'red', 'blue'],
    stock: 28,
    rating: 4.6,
    reviewCount: 89,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '축구화', '프로', '그립', '터치감'],
    status: 'active',
    sku: 'HEB-SPT-004',
    details: {
      material: '마이크로파이버, TPU 스터드',
      origin: '인도네시아',
      manufacturer: 'SOCCER KING',
      precautions: '사용 후 흙 제거, 자연 건조',
      sizes: {
        '240': { length: 24, width: 9, studType: 'FG' },
        '250': { length: 25, width: 9.5, studType: 'FG' },
        '260': { length: 26, width: 10, studType: 'FG' },
        '270': { length: 27, width: 10.5, studType: 'FG' },
        '280': { length: 28, width: 11, studType: 'FG' }
      }
    }
  },
  {
    name: '스포츠 트레이닝복 세트',
    description: '고성능 스포츠 트레이닝복 세트입니다. 흡습속건 기능과 4-way 스트레치로 모든 운동에서 최고의 퍼포먼스를 발휘합니다.',
    price: 125000,
    originalPrice: 160000,
    brand: 'ACTIVE WEAR',
    category: 'sports',
    images: ['/images/products/training-set-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['black', 'gray', 'navy', 'red'],
    stock: 45,
    rating: 4.5,
    reviewCount: 203,
    isNew: false,
    isSale: true,
    saleRate: 22,
    tags: ['트레이닝복', 'SALE', '흡습속건', '스트레치', '세트'],
    status: 'active',
    sku: 'HEB-SPT-005',
    details: {
      material: '폴리에스터 85%, 스판덱스 15%',
      origin: '한국',
      manufacturer: 'ACTIVE WEAR',
      precautions: '찬물 세탁, 섬유유연제 사용 금지',
      sizes: {
        'S': { chest: 50, length: 70, waist: 30 },
        'M': { chest: 53, length: 73, waist: 32 },
        'L': { chest: 56, length: 76, waist: 34 },
        'XL': { chest: 59, length: 79, waist: 36 },
        'XXL': { chest: 62, length: 82, waist: 38 }
      }
    }
  },
  {
    name: '테니스 라켓 프로',
    description: '프로 테니스 선수들이 사용하는 고급 테니스 라켓입니다. 완벽한 밸런스와 파워로 게임의 품질을 한 단계 높여줍니다.',
    price: 245000,
    originalPrice: 320000,
    brand: 'TENNIS ELITE',
    category: 'sports',
    images: ['/images/products/pro-tennis-racket-1.jpg'],
    sizes: ['그립2', '그립3', '그립4'],
    colors: ['black', 'white', 'red'],
    stock: 20,
    rating: 4.8,
    reviewCount: 67,
    isNew: true,
    isSale: true,
    saleRate: 23,
    tags: ['신상', '테니스라켓', 'SALE', '프로', '밸런스'],
    status: 'active',
    sku: 'HEB-SPT-006',
    details: {
      material: '카본파이버, 그래핀',
      origin: '프랑스',
      manufacturer: 'TENNIS ELITE',
      precautions: '습도 조절, 정기적 스트링 교체',
      sizes: {
        '그립2': { weight: '300g', headSize: '100sq', grip: '4 1/4' },
        '그립3': { weight: '300g', headSize: '100sq', grip: '4 3/8' },
        '그립4': { weight: '300g', headSize: '100sq', grip: '4 1/2' }
      }
    }
  },
  {
    name: '수영 고글 프로',
    description: '수영 전문가를 위한 고성능 수영 고글입니다. 김서림 방지 코팅과 UV 차단 기능으로 최적의 수영 환경을 제공합니다.',
    price: 35000,
    originalPrice: 45000,
    brand: 'SWIM PRO',
    category: 'sports',
    images: ['/images/products/pro-swim-goggles-1.jpg'],
    sizes: ['ONE SIZE'],
    colors: ['blue', 'black', 'clear', 'pink'],
    stock: 60,
    rating: 4.7,
    reviewCount: 234,
    isNew: false,
    isSale: true,
    saleRate: 22,
    tags: ['수영고글', 'SALE', '김서림방지', 'UV차단', '프로'],
    status: 'active',
    sku: 'HEB-SPT-007',
    details: {
      material: '실리콘, 폴리카보네이트 렌즈',
      origin: '일본',
      manufacturer: 'SWIM PRO',
      precautions: '렌즈 손상 주의, 찬물 세척',
      sizes: {
        'ONE SIZE': { lensWidth: '6cm', bridgeWidth: '1.5cm', features: 'UV400, 김서림방지' }
      }
    }
  },
  {
    name: '농구화 하이탑',
    description: '농구 경기를 위한 전문 하이탑 농구화입니다. 발목 보호와 뛰어난 그립력으로 코트에서 최고의 퍼포먼스를 발휘합니다.',
    price: 145000,
    originalPrice: 180000,
    brand: 'BASKETBALL PRO',
    category: 'sports',
    images: ['/images/products/basketball-shoes-1.jpg'],
    sizes: ['240', '250', '260', '270', '280', '290'],
    colors: ['white', 'black', 'red', 'blue'],
    stock: 32,
    rating: 4.6,
    reviewCount: 156,
    isNew: false,
    isSale: true,
    saleRate: 19,
    tags: ['농구화', 'SALE', '하이탑', '발목보호', '그립'],
    status: 'active',
    sku: 'HEB-SPT-008',
    details: {
      material: '합성가죽, 에어 쿠션',
      origin: '중국',
      manufacturer: 'BASKETBALL PRO',
      precautions: '실내 코트 전용, 정기적 청소',
      sizes: {
        '240': { length: 24, width: 9, height: '13cm' },
        '250': { length: 25, width: 9.5, height: '13cm' },
        '260': { length: 26, width: 10, height: '13cm' },
        '270': { length: 27, width: 10.5, height: '13cm' },
        '280': { length: 28, width: 11, height: '13cm' },
        '290': { length: 29, width: 11.5, height: '13cm' }
      }
    }
  },
  {
    name: '사이클링 헬멧',
    description: '안전성과 통기성을 모두 갖춘 사이클링 전용 헬멧입니다. 경량 설계와 우수한 충격 흡수력으로 안전한 라이딩을 보장합니다.',
    price: 85000,
    brand: 'CYCLE SAFE',
    category: 'sports',
    images: ['/images/products/cycling-helmet-1.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['black', 'white', 'red', 'blue'],
    stock: 38,
    rating: 4.8,
    reviewCount: 178,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '사이클링', '헬멧', '안전', '통기성'],
    status: 'active',
    sku: 'HEB-SPT-009',
    details: {
      material: 'EPS 폼, 폴리카보네이트',
      origin: '대만',
      manufacturer: 'CYCLE SAFE',
      precautions: '충격 시 교체, 직사광선 피해 보관',
      sizes: {
        'S': { circumference: '51-55cm', weight: '220g', vents: '18개' },
        'M': { circumference: '55-59cm', weight: '235g', vents: '18개' },
        'L': { circumference: '59-63cm', weight: '250g', vents: '18개' }
      }
    }
  },
  {
    name: '골프 드라이버',
    description: '프로 골퍼들이 선택하는 고성능 드라이버입니다. 최신 기술이 적용된 클럽헤드로 비거리와 정확성을 동시에 향상시킵니다.',
    price: 485000,
    originalPrice: 620000,
    brand: 'GOLF MASTER',
    category: 'sports',
    images: ['/images/products/golf-driver-1.jpg'],
    sizes: ['9.5도', '10.5도', '12도'],
    colors: ['black', 'silver', 'blue'],
    stock: 12,
    rating: 4.9,
    reviewCount: 89,
    isNew: true,
    isSale: true,
    saleRate: 22,
    tags: ['신상', '골프', '드라이버', 'SALE', '프로', '비거리'],
    status: 'active',
    sku: 'HEB-SPT-010',
    details: {
      material: '티타늄 합금, 카본파이버 샤프트',
      origin: '일본',
      manufacturer: 'GOLF MASTER',
      precautions: '습기 방지, 정기적 클리닝',
      sizes: {
        '9.5도': { loft: '9.5°', flex: 'S', length: '45.5인치' },
        '10.5도': { loft: '10.5°', flex: 'R', length: '45.5인치' },
        '12도': { loft: '12°', flex: 'A', length: '45.5인치' }
      }
    }
  }
];

async function seedSportsProducts() {
  try {
    console.log('⚽ 스포츠 카테고리 상품 시드 데이터 생성 시작...');
    
    for (const product of sportsProducts) {
      const now = Timestamp.now();
      // categories/sports/products 중첩 컬렉션에 추가
      const docRef = await addDoc(collection(db, 'categories', 'sports', 'products'), {
        ...product,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ 스포츠 상품 생성 완료: ${product.name} (categories/sports/products/${docRef.id})`);
    }
    
    console.log('🎉 스포츠 카테고리 상품 생성 완료!');
    console.log(`총 ${sportsProducts.length}개의 스포츠 상품이 생성되었습니다.`);
  } catch (error) {
    console.error('❌ 스포츠 상품 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedSportsProducts()
    .then(() => {
      console.log('스포츠 상품 시드 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('스포츠 상품 시드 스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedSportsProducts };
