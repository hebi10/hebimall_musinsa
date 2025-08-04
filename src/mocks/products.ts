import { Product } from '../types/product';

export const recommendedProducts = Array.from({ length: 12 }, (_, i) => ({
  id: `rec-${i + 1}`,
  name: `추천 상품 ${i + 1}`,
  brand: '브랜드명',
  price: 29900 + (i * 10000),
  originalPrice: i % 2 === 0 ? 39900 + (i * 10000) : undefined,
  isNew: i < 3,
  isSale: i % 2 === 0,
  rating: 4.5,
  reviewCount: 128 + i * 20,
}));

export const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: '프리미엄 코튼 티셔츠',
    description: '부드러운 코튼 소재로 제작된 프리미엄 티셔츠입니다.',
    price: 29900,
    originalPrice: 39900,
    brand: 'HEBIMALL',
    category: '상의',
    images: [
      '/images/products/tshirt-1.jpg',
      '/images/products/tshirt-2.jpg',
      '/images/products/tshirt-3.jpg',
      '/images/products/tshirt-4.jpg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'white', 'navy', 'gray'],
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    isNew: true,
    isSale: true,
    saleRate: 25,
    tags: ['베스트', '신상', 'SALE'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    status: 'active',
    sku: 'HEB-TS-001',
    details: {
      material: '코튼 100%',
      origin: '한국',
      manufacturer: 'HEBIMALL',
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
    id: 'product-2',
    name: '오버핏 맨투맨',
    description: '트렌디한 오버핏으로 제작된 맨투맨입니다.',
    price: 34900,
    originalPrice: 42900,
    brand: 'URBANWEAR',
    category: '상의',
    images: [
      '/images/products/sweatshirt-1.jpg',
      '/images/products/sweatshirt-2.jpg'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['gray', 'black', 'blue'],
    stock: 37,
    rating: 4.2,
    reviewCount: 93,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '오버핏'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-05'),
    status: 'active',
    sku: 'URB-MT-002',
    details: {
      material: '폴리에스터 70%, 코튼 30%',
      origin: '중국',
      manufacturer: 'URBANWEAR',
      precautions: '30도 이하 세탁, 다림질 금지',
      sizes: {
        M: { chest: 58, length: 71, shoulder: 53 },
        L: { chest: 61, length: 74, shoulder: 55 },
        XL: { chest: 64, length: 77, shoulder: 57 }
      }
    }
  },
  {
    id: 'product-3',
    name: '스탠다드 슬랙스',
    description: '깔끔한 핏의 데일리 슬랙스입니다.',
    price: 41900,
    originalPrice: 49900,
    brand: 'HEBIMALL',
    category: '하의',
    images: [
      '/images/products/slacks-1.jpg',
      '/images/products/slacks-2.jpg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'beige', 'navy'],
    stock: 23,
    rating: 4.8,
    reviewCount: 210,
    isNew: false,
    isSale: true,
    saleRate: 16,
    tags: ['베스트', 'SALE'],
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2024-01-01'),
    status: 'active',
    sku: 'HEB-SL-003',
    details: {
      material: '폴리에스터 80%, 레이온 20%',
      origin: '베트남',
      manufacturer: 'HEBIMALL',
      precautions: '드라이클리닝 권장',
      sizes: {
        S: { waist: 38, length: 98, thigh: 28 },
        M: { waist: 40, length: 100, thigh: 30 },
        L: { waist: 42, length: 102, thigh: 32 },
        XL: { waist: 44, length: 104, thigh: 34 }
      }
    }
  },
  {
    id: 'product-4',
    name: '에센셜 집업 후드',
    description: '간절기용 얇은 원단의 집업 후드입니다.',
    price: 39900,
    originalPrice: 49900,
    brand: 'FLEXWEAR',
    category: '상의',
    images: [
      '/images/products/hoodie-1.jpg'
    ],
    sizes: ['M', 'L'],
    colors: ['navy', 'khaki', 'white'],
    stock: 41,
    rating: 4.0,
    reviewCount: 61,
    isNew: false,
    isSale: true,
    saleRate: 20,
    tags: ['SALE', '봄신상'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-18'),
    status: 'active',
    sku: 'FLX-HD-004',
    details: {
      material: '코튼 60%, 폴리 40%',
      origin: '한국',
      manufacturer: 'FLEXWEAR',
      precautions: '30도 이하 세탁, 탈수 약하게',
      sizes: {
        M: { chest: 56, length: 68, shoulder: 48 },
        L: { chest: 59, length: 71, shoulder: 50 }
      }
    }
  },
  {
    id: 'product-5',
    name: '코듀로이 와이드 팬츠',
    description: '부드러운 촉감의 코듀로이 팬츠입니다.',
    price: 45900,
    originalPrice: 55900,
    brand: 'URBANWEAR',
    category: '하의',
    images: [
      '/images/products/corduroy-1.jpg',
      '/images/products/corduroy-2.jpg'
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['brown', 'ivory', 'black'],
    stock: 30,
    rating: 4.4,
    reviewCount: 74,
    isNew: true,
    isSale: true,
    saleRate: 18,
    tags: ['신상', '와이드핏'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
    status: 'active',
    sku: 'URB-CD-005',
    details: {
      material: '코튼 100%',
      origin: '방글라데시',
      manufacturer: 'URBANWEAR',
      precautions: '단독세탁, 건조기 금지',
      sizes: {
        S: { waist: 37, length: 97, thigh: 32 },
        M: { waist: 39, length: 100, thigh: 34 },
        L: { waist: 41, length: 103, thigh: 36 }
      }
    }
  },
  {
    id: 'product-6',
    name: '에코 레더 자켓',
    description: '스타일리시한 합성가죽 소재의 레더 자켓입니다.',
    price: 99000,
    originalPrice: 129000,
    brand: 'STREETLAB',
    category: '아우터',
    images: [
      '/images/products/leatherjacket-1.jpg'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['black'],
    stock: 13,
    rating: 4.6,
    reviewCount: 51,
    isNew: false,
    isSale: true,
    saleRate: 23,
    tags: ['SALE', '간절기', '스테디셀러'],
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-01-05'),
    status: 'active',
    sku: 'STL-LJ-006',
    details: {
      material: '합성가죽',
      origin: '중국',
      manufacturer: 'STREETLAB',
      precautions: '가죽 전문 클리너 권장',
      sizes: {
        M: { chest: 54, length: 67, shoulder: 46 },
        L: { chest: 57, length: 70, shoulder: 48 },
        XL: { chest: 60, length: 73, shoulder: 50 }
      }
    }
  },
  {
    id: 'product-7',
    name: '스탠다드 데님 팬츠',
    description: '매일 입기 좋은 스탠다드핏 데님 팬츠입니다.',
    price: 49900,
    originalPrice: 59900,
    brand: 'HEBIMALL',
    category: '하의',
    images: [
      '/images/products/denim-1.jpg',
      '/images/products/denim-2.jpg'
    ],
    sizes: ['28', '30', '32', '34'],
    colors: ['blue', 'lightblue', 'black'],
    stock: 56,
    rating: 4.7,
    reviewCount: 187,
    isNew: false,
    isSale: false,
    saleRate: 0,
    tags: ['베스트', '데님'],
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-11'),
    status: 'active',
    sku: 'HEB-DN-007',
    details: {
      material: '면 100%',
      origin: '베트남',
      manufacturer: 'HEBIMALL',
      precautions: '뒤집어서 세탁, 표백제 금지',
      sizes: {
        28: { waist: 37, length: 98, thigh: 29 },
        30: { waist: 39, length: 100, thigh: 31 },
        32: { waist: 41, length: 102, thigh: 33 },
        34: { waist: 43, length: 104, thigh: 35 }
      }
    }
  },
  {
    id: 'product-8',
    name: '아노락 윈드브레이커',
    description: '활동성이 좋은 아노락 스타일의 윈드브레이커입니다.',
    price: 64900,
    originalPrice: 74900,
    brand: 'FLEXWEAR',
    category: '아우터',
    images: [
      '/images/products/anorak-1.jpg'
    ],
    sizes: ['M', 'L'],
    colors: ['white', 'green', 'navy'],
    stock: 22,
    rating: 4.1,
    reviewCount: 45,
    isNew: true,
    isSale: true,
    saleRate: 13,
    tags: ['신상', '아노락'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-03'),
    status: 'active',
    sku: 'FLX-AN-008',
    details: {
      material: '폴리 100%',
      origin: '베트남',
      manufacturer: 'FLEXWEAR',
      precautions: '단독세탁, 건조기 금지',
      sizes: {
        M: { chest: 59, length: 72, shoulder: 48 },
        L: { chest: 62, length: 75, shoulder: 50 }
      }
    }
  },
  {
    id: 'product-9',
    name: '클래식 울 코트',
    description: '고급 울 소재의 클래식 더블코트입니다.',
    price: 129000,
    originalPrice: 169000,
    brand: 'URBANWEAR',
    category: '아우터',
    images: [
      '/images/products/woolcoat-1.jpg',
      '/images/products/woolcoat-2.jpg'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['charcoal', 'beige', 'brown'],
    stock: 7,
    rating: 4.9,
    reviewCount: 35,
    isNew: false,
    isSale: true,
    saleRate: 24,
    tags: ['겨울', 'SALE', '코트'],
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-02'),
    status: 'active',
    sku: 'URB-WC-009',
    details: {
      material: '울 80%, 나일론 20%',
      origin: '한국',
      manufacturer: 'URBANWEAR',
      precautions: '드라이클리닝',
      sizes: {
        M: { chest: 55, length: 104, shoulder: 46 },
        L: { chest: 58, length: 107, shoulder: 48 },
        XL: { chest: 61, length: 110, shoulder: 50 }
      }
    }
  },
  {
    id: 'product-10',
    name: '라운드 니트 스웨터',
    description: '간절기 필수, 심플한 디자인의 라운드 니트입니다.',
    price: 35900,
    originalPrice: 45900,
    brand: 'HEBIMALL',
    category: '상의',
    images: [
      '/images/products/knit-1.jpg'
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['beige', 'gray', 'pink'],
    stock: 44,
    rating: 4.3,
    reviewCount: 61,
    isNew: true,
    isSale: false,
    saleRate: 0,
    tags: ['신상', '니트'],
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-27'),
    status: 'active',
    sku: 'HEB-KN-010',
    details: {
      material: '아크릴 70%, 울 30%',
      origin: '중국',
      manufacturer: 'HEBIMALL',
      precautions: '손세탁 권장',
      sizes: {
        S: { chest: 49, length: 65, shoulder: 43 },
        M: { chest: 52, length: 68, shoulder: 45 },
        L: { chest: 55, length: 71, shoulder: 47 }
      }
    }
  }
];


export const mockCategories = [
  { id: 'tops', name: '상의', productCount: 1250 },
  { id: 'bottoms', name: '하의', productCount: 890 },
  { id: 'shoes', name: '신발', productCount: 640 },
  { id: 'accessories', name: '액세서리', productCount: 320 },
];

export const mockBrands = [
  { id: 'hebimall', name: 'HEBIMALL', productCount: 450 },
  { id: 'denim-brand', name: 'DENIM BRAND', productCount: 230 },
  { id: 'shoe-brand', name: 'SHOE BRAND', productCount: 180 },
];
