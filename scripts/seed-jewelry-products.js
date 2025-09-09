const { db } = require('./firebase-config');
const { collection, addDoc, Timestamp } = require('firebase/firestore');

const jewelryProducts = [
  {
    name: '18K 골드 체인 목걸이',
    description: '고급스러운 18K 골드로 제작된 클래식 체인 목걸이입니다. 세련되고 우아한 디자인으로 어떤 스타일에도 완벽하게 어울립니다.',
    price: 485000,
    originalPrice: 620000,
    brand: 'LUXURY GOLD',
    category: 'jewelry',
    images: ['/images/products/gold-chain-necklace-1.jpg'],
    sizes: ['40cm', '45cm', '50cm'],
    colors: ['gold', 'rose gold', 'white gold'],
    stock: 15,
    rating: 4.9,
    reviewCount: 89,
    isNew: true,
    isSale: true,
    saleRate: 22,
    tags: ['신상', '목걸이', '18K골드', 'SALE', '럭셔리'],
    status: 'active',
    sku: 'HEB-JWL-001',
    details: {
      material: '18K 골드 (75% 순금)',
      origin: '이탈리아',
      manufacturer: 'LUXURY GOLD',
      precautions: '보석함 보관, 화학물질 접촉 금지',
      sizes: {
        '40cm': { length: '40cm', weight: '8.5g', thickness: '2mm' },
        '45cm': { length: '45cm', weight: '9.8g', thickness: '2mm' },
        '50cm': { length: '50cm', weight: '11.2g', thickness: '2mm' }
      }
    }
  },
  {
    name: '다이아몬드 스터드 귀걸이',
    description: '화려한 다이아몬드 스터드 귀걸이입니다. GIA 인증 다이아몬드로 최고의 품질과 브릴리언트한 광채를 자랑합니다.',
    price: 1250000,
    originalPrice: 1580000,
    brand: 'DIAMOND ELITE',
    category: 'jewelry',
    images: ['/images/products/diamond-stud-earrings-1.jpg'],
    sizes: ['0.5ct', '1.0ct', '1.5ct'],
    colors: ['white gold', 'yellow gold', 'rose gold'],
    stock: 8,
    rating: 5.0,
    reviewCount: 34,
    isNew: true,
    isSale: true,
    saleRate: 21,
    tags: ['신상', '귀걸이', '다이아몬드', 'SALE', 'GIA인증'],
    status: 'active',
    sku: 'HEB-JWL-002',
    details: {
      material: '18K 골드, GIA 인증 다이아몬드',
      origin: '벨기에',
      manufacturer: 'DIAMOND ELITE',
      precautions: '초음파 세정 권장, 보험 가입 필수',
      sizes: {
        '0.5ct': { totalCarat: '0.5ct', clarity: 'VS1', color: 'G' },
        '1.0ct': { totalCarat: '1.0ct', clarity: 'VS1', color: 'G' },
        '1.5ct': { totalCarat: '1.5ct', clarity: 'VS1', color: 'G' }
      }
    }
  },
  {
    name: '실버 팔찌 세트',
    description: '세련된 925 스털링 실버 팔찌 세트입니다. 3개의 서로 다른 디자인으로 다양한 스타일링이 가능합니다.',
    price: 89000,
    originalPrice: 120000,
    brand: 'SILVER STYLE',
    category: 'jewelry',
    images: ['/images/products/silver-bracelet-set-1.jpg'],
    sizes: ['16cm', '18cm', '20cm'],
    colors: ['silver', 'gold plated'],
    stock: 25,
    rating: 4.6,
    reviewCount: 156,
    isNew: false,
    isSale: true,
    saleRate: 26,
    tags: ['팔찌', '실버', 'SALE', '세트', '925실버'],
    status: 'active',
    sku: 'HEB-JWL-003',
    details: {
      material: '925 스털링 실버',
      origin: '한국',
      manufacturer: 'SILVER STYLE',
      precautions: '실버 전용 세정제 사용, 산성 물질 접촉 금지',
      sizes: {
        '16cm': { length: '16cm', pieces: '3개', adjustable: 'yes' },
        '18cm': { length: '18cm', pieces: '3개', adjustable: 'yes' },
        '20cm': { length: '20cm', pieces: '3개', adjustable: 'yes' }
      }
    }
  },
  {
    name: '진주 목걸이 클래식',
    description: '우아한 담수진주로 제작된 클래식 목걸이입니다. 자연스러운 진주의 광택과 완벽한 둥근 형태가 고급스러움을 연출합니다.',
    price: 165000,
    originalPrice: 220000,
    brand: 'PEARL BEAUTY',
    category: 'jewelry',
    images: ['/images/products/pearl-necklace-1.jpg'],
    sizes: ['42cm', '45cm', '48cm'],
    colors: ['white', 'cream', 'pink'],
    stock: 18,
    rating: 4.8,
    reviewCount: 203,
    isNew: false,
    isSale: true,
    saleRate: 25,
    tags: ['진주', '목걸이', 'SALE', '클래식', '담수진주'],
    status: 'active',
    sku: 'HEB-JWL-004',
    details: {
      material: '담수진주, 실버 클래스프',
      origin: '중국',
      manufacturer: 'PEARL BEAUTY',
      precautions: '화장품 접촉 후 닦기, 별도 보관',
      sizes: {
        '42cm': { length: '42cm', pearlSize: '7-8mm', count: '60개' },
        '45cm': { length: '45cm', pearlSize: '7-8mm', count: '65개' },
        '48cm': { length: '48cm', pearlSize: '7-8mm', count: '70개' }
      }
    }
  },
  {
    name: '시티즌 오토매틱 시계',
    description: '정밀한 오토매틱 무브먼트의 시티즌 시계입니다. 클래식한 디자인과 신뢰할 수 있는 성능으로 시간의 가치를 느껴보세요.',
    price: 385000,
    originalPrice: 480000,
    brand: 'CITIZEN',
    category: 'jewelry',
    images: ['/images/products/citizen-automatic-watch-1.jpg'],
    sizes: ['38mm', '40mm', '42mm'],
    colors: ['black', 'white', 'blue'],
    stock: 22,
    rating: 4.7,
    reviewCount: 142,
    isNew: true,
    isSale: true,
    saleRate: 20,
    tags: ['신상', '시계', '오토매틱', 'SALE', '시티즌'],
    status: 'active',
    sku: 'HEB-JWL-005',
    details: {
      material: '스테인리스 스틸, 사파이어 크리스탈',
      origin: '일본',
      manufacturer: 'CITIZEN',
      precautions: '자기장 피함, 정기적 점검',
      sizes: {
        '38mm': { caseSize: '38mm', thickness: '11mm', waterResist: '100M' },
        '40mm': { caseSize: '40mm', thickness: '11mm', waterResist: '100M' },
        '42mm': { caseSize: '42mm', thickness: '11mm', waterResist: '100M' }
      }
    }
  },
  {
    name: '커플 반지 세트',
    description: '사랑하는 연인을 위한 커플 반지 세트입니다. 심플하면서도 의미 있는 디자인으로 특별한 순간을 더욱 빛나게 합니다.',
    price: 125000,
    originalPrice: 165000,
    brand: 'LOVE RING',
    category: 'jewelry',
    images: ['/images/products/couple-ring-set-1.jpg'],
    sizes: ['13호', '15호', '17호', '19호'],
    colors: ['silver', 'gold', 'rose gold'],
    stock: 30,
    rating: 4.5,
    reviewCount: 267,
    isNew: false,
    isSale: true,
    saleRate: 24,
    tags: ['커플반지', 'SALE', '세트', '연인', '의미있는'],
    status: 'active',
    sku: 'HEB-JWL-006',
    details: {
      material: '925 스털링 실버',
      origin: '한국',
      manufacturer: 'LOVE RING',
      precautions: '사이즈 조절 가능, 각인 서비스 제공',
      sizes: {
        '13호': { innerDiameter: '16.5mm', width: '3mm', pieces: '2개' },
        '15호': { innerDiameter: '17.8mm', width: '3mm', pieces: '2개' },
        '17호': { innerDiameter: '18.9mm', width: '3mm', pieces: '2개' },
        '19호': { innerDiameter: '19.8mm', width: '3mm', pieces: '2개' }
      }
    }
  },
  {
    name: '에메랄드 펜던트',
    description: '신비로운 에메랄드가 세팅된 엘레간트한 펜던트입니다. 자연의 깊은 녹색이 만들어내는 고급스러운 아름다움을 경험하세요.',
    price: 765000,
    originalPrice: 950000,
    brand: 'EMERALD LUXURY',
    category: 'jewelry',
    images: ['/images/products/emerald-pendant-1.jpg'],
    sizes: ['1ct', '1.5ct', '2ct'],
    colors: ['white gold', 'yellow gold'],
    stock: 10,
    rating: 4.9,
    reviewCount: 45,
    isNew: true,
    isSale: true,
    saleRate: 19,
    tags: ['신상', '펜던트', '에메랄드', 'SALE', '럭셔리'],
    status: 'active',
    sku: 'HEB-JWL-007',
    details: {
      material: '18K 골드, 천연 에메랄드',
      origin: '콜롬비아',
      manufacturer: 'EMERALD LUXURY',
      precautions: '초음파 세정 금지, 온도 변화 주의',
      sizes: {
        '1ct': { emeraldWeight: '1ct', clarity: 'VS', setting: '프롱 세팅' },
        '1.5ct': { emeraldWeight: '1.5ct', clarity: 'VS', setting: '프롱 세팅' },
        '2ct': { emeraldWeight: '2ct', clarity: 'VS', setting: '프롱 세팅' }
      }
    }
  },
  {
    name: '아쿠아마린 귀걸이',
    description: '청량한 아쿠아마린 보석이 세팅된 우아한 귀걸이입니다. 바다의 맑은 색상이 착용자에게 신선하고 세련된 매력을 선사합니다.',
    price: 235000,
    originalPrice: 295000,
    brand: 'AQUA JEWEL',
    category: 'jewelry',
    images: ['/images/products/aquamarine-earrings-1.jpg'],
    sizes: ['SMALL', 'MEDIUM', 'LARGE'],
    colors: ['white gold', 'silver'],
    stock: 20,
    rating: 4.6,
    reviewCount: 78,
    isNew: false,
    isSale: true,
    saleRate: 20,
    tags: ['귀걸이', '아쿠아마린', 'SALE', '보석', '우아한'],
    status: 'active',
    sku: 'HEB-JWL-008',
    details: {
      material: '925 스털링 실버, 아쿠아마린',
      origin: '브라질',
      manufacturer: 'AQUA JEWEL',
      precautions: '충격 주의, 초음파 세정 가능',
      sizes: {
        'SMALL': { stoneSize: '6mm', totalLength: '2cm', weight: '3g' },
        'MEDIUM': { stoneSize: '8mm', totalLength: '2.5cm', weight: '4g' },
        'LARGE': { stoneSize: '10mm', totalLength: '3cm', weight: '5g' }
      }
    }
  },
  {
    name: '로즈골드 체인 팔찌',
    description: '따뜻한 색감의 로즈골드 체인 팔찌입니다. 여성스럽고 세련된 디자인으로 일상과 특별한 날 모두에 완벽한 액세서리입니다.',
    price: 145000,
    originalPrice: 185000,
    brand: 'ROSE GOLD',
    category: 'jewelry',
    images: ['/images/products/rose-gold-bracelet-1.jpg'],
    sizes: ['16cm', '18cm', '20cm'],
    colors: ['rose gold'],
    stock: 28,
    rating: 4.7,
    reviewCount: 189,
    isNew: false,
    isSale: true,
    saleRate: 22,
    tags: ['팔찌', '로즈골드', 'SALE', '여성스러운', '체인'],
    status: 'active',
    sku: 'HEB-JWL-009',
    details: {
      material: '18K 로즈골드',
      origin: '이탈리아',
      manufacturer: 'ROSE GOLD',
      precautions: '산성 물질 접촉 금지, 보석함 보관',
      sizes: {
        '16cm': { length: '16cm', weight: '6.5g', adjustable: 'yes' },
        '18cm': { length: '18cm', weight: '7.2g', adjustable: 'yes' },
        '20cm': { length: '20cm', weight: '8.0g', adjustable: 'yes' }
      }
    }
  },
  {
    name: '사파이어 칵테일 반지',
    description: '블루 사파이어가 화려하게 세팅된 칵테일 반지입니다. 파티나 특별한 모임에서 시선을 사로잡는 대담하고 우아한 디자인입니다.',
    price: 985000,
    originalPrice: 1250000,
    brand: 'SAPPHIRE ROYAL',
    category: 'jewelry',
    images: ['/images/products/sapphire-cocktail-ring-1.jpg'],
    sizes: ['13호', '15호', '17호'],
    colors: ['white gold', 'yellow gold'],
    stock: 12,
    rating: 4.8,
    reviewCount: 67,
    isNew: true,
    isSale: true,
    saleRate: 21,
    tags: ['신상', '반지', '사파이어', 'SALE', '칵테일링'],
    status: 'active',
    sku: 'HEB-JWL-010',
    details: {
      material: '18K 골드, 스리랑카 사파이어',
      origin: '스리랑카',
      manufacturer: 'SAPPHIRE ROYAL',
      precautions: '보험 가입 권장, 전문 세팅 점검',
      sizes: {
        '13호': { sapphireWeight: '3ct', innerDiameter: '16.5mm', setting: '할로 세팅' },
        '15호': { sapphireWeight: '3ct', innerDiameter: '17.8mm', setting: '할로 세팅' },
        '17호': { sapphireWeight: '3ct', innerDiameter: '18.9mm', setting: '할로 세팅' }
      }
    }
  }
];

async function seedJewelryProducts() {
  try {
    console.log('💎 주얼리 카테고리 상품 시드 데이터 생성 시작...');
    
    for (const product of jewelryProducts) {
      const now = Timestamp.now();
      // categories/jewelry/products 중첩 컬렉션에 추가
      const docRef = await addDoc(collection(db, 'categories', 'jewelry', 'products'), {
        ...product,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ 주얼리 상품 생성 완료: ${product.name} (categories/jewelry/products/${docRef.id})`);
    }
    
    console.log('🎉 주얼리 카테고리 상품 생성 완료!');
    console.log(`총 ${jewelryProducts.length}개의 주얼리 상품이 생성되었습니다.`);
  } catch (error) {
    console.error('❌ 주얼리 상품 생성 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  seedJewelryProducts()
    .then(() => {
      console.log('주얼리 상품 시드 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('주얼리 상품 시드 스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { seedJewelryProducts };
