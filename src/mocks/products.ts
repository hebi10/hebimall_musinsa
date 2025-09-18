import { Product } from "@/shared/types/product";

export const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: '프리미엄 코튼 티셔츠',
    description: '부드러운 코튼 소재로 제작된 프리미엄 티셔츠입니다.',
    price: 29900,
    originalPrice: 39900,
    brand: 'STYNA',
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
    id: 'product-2',
    name: '슬림핏 데님 청바지',
    description: '편안한 착용감과 완벽한 핏을 자랑하는 슬림핏 데님 청바지입니다.',
    price: 79900,
    originalPrice: 99900,
    brand: 'DENIM BRAND',
    category: '하의',
    images: [
      '/images/products/jeans-1.jpg',
      '/images/products/jeans-2.jpg',
      '/images/products/jeans-3.jpg'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['blue', 'black', 'gray'],
    stock: 30,
    rating: 4.3,
    reviewCount: 95,
    isNew: false,
    isSale: true,
    saleRate: 20,
    tags: ['베스트', 'SALE'],
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-10'),
    status: 'active',
    sku: 'HEB-JN-002',
    details: {
      material: '코튼 98%, 스판덱스 2%',
      origin: '한국',
      manufacturer: 'DENIM BRAND',
      precautions: '뒤집어서 세탁, 표백제 사용 금지',
      sizes: {
        '28': { waist: 28, thigh: 24, length: 106 },
        '30': { waist: 30, thigh: 25, length: 108 },
        '32': { waist: 32, thigh: 26, length: 110 },
        '34': { waist: 34, thigh: 27, length: 112 },
        '36': { waist: 36, thigh: 28, length: 114 }
      }
    }
  },
  {
    id: 'product-3',
    name: '클래식 스니커즈',
    description: '어떤 스타일에도 잘 어울리는 심플하고 클래식한 디자인의 스니커즈입니다.',
    price: 89900,
    brand: 'SHOE BRAND',
    category: '신발',
    images: [
      '/images/products/sneakers-1.jpg',
      '/images/products/sneakers-2.jpg',
      '/images/products/sneakers-3.jpg',
      '/images/products/sneakers-4.jpg'
    ],
    sizes: ['240', '250', '260', '270', '280'],
    colors: ['white', 'black', 'navy'],
    stock: 25,
    rating: 4.7,
    reviewCount: 203,
    isNew: true,
    isSale: false,
    tags: ['신상', '베스트'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
    status: 'active',
    sku: 'HEB-SN-003',
    details: {
      material: '캔버스, 고무',
      origin: '베트남',
      manufacturer: 'SHOE BRAND',
      precautions: '직사광선 피해서 보관, 물세탁 금지',
      sizes: {
        '240': { length: 24.0 },
        '250': { length: 25.0 },
        '260': { length: 26.0 },
        '270': { length: 27.0 },
        '280': { length: 28.0 }
      }
    }
  },
  {
    id: 'product-4',
    name: '미니멀 가죽 백팩',
    description: '도시적이고 미니멀한 디자인의 가죽 백팩으로 일상과 비즈니스 모두에 적합합니다.',
    price: 159900,
    originalPrice: 199900,
    brand: 'STYNA',
    category: '액세서리',
    images: [
      '/images/products/backpack-1.jpg',
      '/images/products/backpack-2.jpg',
      '/images/products/backpack-3.jpg'
    ],
    sizes: ['ONE SIZE'],
    colors: ['black', 'brown', 'navy'],
    stock: 15,
    rating: 4.8,
    reviewCount: 67,
    isNew: true,
    isSale: true,
    saleRate: 20,
    tags: ['신상', 'SALE', '인기'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    status: 'active',
    sku: 'HEB-BP-004',
    details: {
      material: '천연가죽 100%',
      origin: '이탈리아',
      manufacturer: 'STYNA',
      precautions: '가죽 전용 클리너 사용, 직사광선 피해서 보관',
      sizes: {
        'ONE SIZE': { length: 30, width: 20, height: 40 }
      }
    }
  },
  {
    id: 'product-5',
    name: '오버핏 후드 집업',
    description: '트렌디한 오버핏과 편안한 착용감을 제공하는 후드 집업입니다.',
    price: 59900,
    originalPrice: 79900,
    brand: 'STYNA',
    category: '상의',
    images: [
      '/images/products/hoodie-1.jpg',
      '/images/products/hoodie-2.jpg',
      '/images/products/hoodie-3.jpg'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['black', 'gray', 'beige', 'navy'],
    stock: 40,
    rating: 4.4,
    reviewCount: 156,
    isNew: false,
    isSale: true,
    saleRate: 25,
    tags: ['베스트', 'SALE'],
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-01-05'),
    status: 'active',
    sku: 'HEB-HD-005',
    details: {
      material: '코튼 80%, 폴리에스터 20%',
      origin: '한국',
      manufacturer: 'STYNA',
      precautions: '중성세제 사용, 다림질 시 낮은 온도',
      sizes: {
        M: { chest: 58, length: 72, shoulder: 50 },
        L: { chest: 61, length: 75, shoulder: 52 },
        XL: { chest: 64, length: 78, shoulder: 54 },
        XXL: { chest: 67, length: 81, shoulder: 56 }
      }
    }
  },
  {
    id: 'product-6',
    name: '와이드 코튼 팬츠',
    description: '여유로운 핏과 자연스러운 실루엣의 와이드 코튼 팬츠입니다.',
    price: 69900,
    brand: 'STYNA',
    category: '하의',
    images: [
      '/images/products/pants-1.jpg',
      '/images/products/pants-2.jpg',
      '/images/products/pants-3.jpg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['beige', 'black', 'khaki', 'white'],
    stock: 35,
    rating: 4.2,
    reviewCount: 89,
    isNew: true,
    isSale: false,
    tags: ['신상', '편안함'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
    status: 'active',
    sku: 'HEB-PT-006',
    details: {
      material: '코튼 100%',
      origin: '한국',
      manufacturer: 'STYNA',
      precautions: '찬물 세탁, 자연건조',
      sizes: {
        S: { waist: 68, thigh: 30, length: 100 },
        M: { waist: 72, thigh: 32, length: 102 },
        L: { waist: 76, thigh: 34, length: 104 },
        XL: { waist: 80, thigh: 36, length: 106 }
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
  { id: 'hebimall', name: 'STYNA', productCount: 450 },
  { id: 'denim-brand', name: 'DENIM BRAND', productCount: 230 },
  { id: 'shoe-brand', name: 'SHOE BRAND', productCount: 180 },
];
