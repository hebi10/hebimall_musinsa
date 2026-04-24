const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, getDoc } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clothingProducts = [
  {
    name: "프리미엄 울 코트",
    price: 320000,
    discountPrice: 280000,
    brand: "STYNA PREMIUM",
    description: "최고급 울 소재로 제작된 겨울 코트입니다. 따뜻하면서도 세련된 디자인으로 어떤 스타일에도 잘 어울립니다.",
    image: "/tshirt-1.jpg",
    category: "clothing",
    subcategory: "outerwear",
    stock: 25,
    rating: 4.8,
    reviewCount: 43,
    sales: 89,
    isNew: false,
    details: {
      material: "울 90%, 캐시미어 10%",
      origin: "이탈리아",
      manufacturer: "스티나몰 프리미엄",
      precautions: "드라이클리닝 전용",
      size: "S, M, L, XL",
      color: "블랙, 네이비, 베이지",
      care: "전문 세탁소 이용"
    }
  },
  {
    name: "캐주얼 데님 재킷",
    price: 89000,
    discountPrice: 69000,
    brand: "URBAN STYLE",
    description: "편안하고 스타일리시한 데님 재킷입니다. 일상 코디에 완벽한 아이템입니다.",
    image: "/shirt-2.jpg",
    category: "clothing",
    subcategory: "outerwear",
    stock: 40,
    rating: 4.5,
    reviewCount: 67,
    sales: 156,
    isNew: true,
    details: {
      material: "코튼 100%",
      origin: "한국",
      manufacturer: "어반스타일",
      precautions: "찬물 세탁",
      size: "S, M, L, XL, XXL",
      color: "인디고, 라이트블루, 블랙",
      care: "찬물 손세탁 권장"
    }
  },
  {
    name: "니트 스웨터",
    price: 65000,
    discountPrice: 52000,
    brand: "COZY KNIT",
    description: "부드럽고 따뜻한 니트 스웨터입니다. 겨울철 필수 아이템으로 다양한 스타일링이 가능합니다.",
    image: "/tshirt-1.jpg",
    category: "clothing",
    subcategory: "knitwear",
    stock: 35,
    rating: 4.6,
    reviewCount: 89,
    sales: 234,
    isNew: false,
    details: {
      material: "아크릴 70%, 울 30%",
      origin: "한국",
      manufacturer: "코지니트",
      precautions: "울 세제 사용",
      size: "S, M, L",
      color: "크림, 네이비, 그레이, 와인",
      care: "손세탁 또는 울 코스"
    }
  },
  {
    name: "슬림핏 정장 셔츠",
    price: 45000,
    discountPrice: 35000,
    brand: "BUSINESS PRO",
    description: "깔끔한 슬림핏 정장 셔츠입니다. 비즈니스 미팅이나 공식적인 자리에 완벽합니다.",
    image: "/shirt-2.jpg",
    category: "clothing",
    subcategory: "shirts",
    stock: 50,
    rating: 4.7,
    reviewCount: 123,
    sales: 345,
    isNew: false,
    details: {
      material: "코튼 80%, 폴리에스터 20%",
      origin: "한국",
      manufacturer: "비즈니스프로",
      precautions: "다림질 필요",
      size: "90, 95, 100, 105, 110",
      color: "화이트, 라이트블루, 핑크",
      care: "일반 세탁"
    }
  },
  {
    name: "캐주얼 후드티",
    price: 39000,
    discountPrice: 29000,
    brand: "STREET WEAR",
    description: "편안한 착용감의 캐주얼 후드티입니다. 일상복으로 완벽한 선택입니다.",
    image: "/tshirt-1.jpg",
    category: "clothing",
    subcategory: "hoodies",
    stock: 60,
    rating: 4.4,
    reviewCount: 156,
    sales: 267,
    isNew: true,
    details: {
      material: "코튼 85%, 폴리에스터 15%",
      origin: "한국",
      manufacturer: "스트리트웨어",
      precautions: "색상별 분리세탁",
      size: "S, M, L, XL",
      color: "블랙, 그레이, 네이비, 화이트",
      care: "찬물 세탁"
    }
  },
  {
    name: "치노 팬츠",
    price: 55000,
    discountPrice: 45000,
    brand: "CLASSIC FIT",
    description: "클래식한 치노 팬츠입니다. 캐주얼과 비즈니스 캐주얼 모두에 활용 가능합니다.",
    image: "/shirt-2.jpg",
    category: "clothing",
    subcategory: "pants",
    stock: 30,
    rating: 4.5,
    reviewCount: 78,
    sales: 189,
    isNew: false,
    details: {
      material: "코튼 98%, 엘라스테인 2%",
      origin: "베트남",
      manufacturer: "클래식핏",
      precautions: "밝은 색상 분리세탁",
      size: "28, 30, 32, 34, 36",
      color: "베이지, 네이비, 블랙, 카키",
      care: "일반 세탁"
    }
  },
  {
    name: "면 반팔 티셔츠",
    price: 25000,
    discountPrice: 19000,
    brand: "BASIC COTTON",
    description: "부드러운 면 소재의 기본 반팔 티셔츠입니다. 어떤 스타일에도 잘 어울리는 베이직 아이템입니다.",
    image: "/tshirt-1.jpg",
    category: "clothing",
    subcategory: "t-shirts",
    stock: 80,
    rating: 4.3,
    reviewCount: 234,
    sales: 456,
    isNew: false,
    details: {
      material: "코튼 100%",
      origin: "한국",
      manufacturer: "베이직코튼",
      precautions: "색상별 분리세탁",
      size: "S, M, L, XL, XXL",
      color: "화이트, 블랙, 그레이, 네이비, 레드",
      care: "일반 세탁"
    }
  },
  {
    name: "스포츠 트랙 재킷",
    price: 75000,
    discountPrice: 59000,
    brand: "ACTIVE SPORT",
    description: "운동과 일상 모두에 적합한 스포츠 트랙 재킷입니다. 통기성과 편안함을 동시에 제공합니다.",
    image: "/shirt-2.jpg",
    category: "clothing",
    subcategory: "sportswear",
    stock: 45,
    rating: 4.6,
    reviewCount: 92,
    sales: 178,
    isNew: true,
    details: {
      material: "폴리에스터 85%, 엘라스테인 15%",
      origin: "한국",
      manufacturer: "액티브스포츠",
      precautions: "섬유유연제 사용 금지",
      size: "S, M, L, XL",
      color: "블랙, 네이비, 그레이",
      care: "찬물 세탁"
    }
  },
  {
    name: "린넨 셔츠",
    price: 68000,
    discountPrice: 54000,
    brand: "SUMMER LINEN",
    description: "시원하고 통기성 좋은 린넨 셔츠입니다. 여름철에 완벽한 아이템입니다.",
    image: "/tshirt-1.jpg",
    category: "clothing",
    subcategory: "shirts",
    stock: 25,
    rating: 4.4,
    reviewCount: 67,
    sales: 134,
    isNew: false,
    details: {
      material: "린넨 100%",
      origin: "프랑스",
      manufacturer: "서머리넨",
      precautions: "주름 방지를 위해 걸어서 건조",
      size: "S, M, L, XL",
      color: "화이트, 베이지, 라이트블루",
      care: "찬물 손세탁 권장"
    }
  },
  {
    name: "카고 쇼츠",
    price: 42000,
    discountPrice: 32000,
    brand: "OUTDOOR GEAR",
    description: "실용적이고 스타일리시한 카고 쇼츠입니다. 여름철 아웃도어 활동에 최적화되어 있습니다.",
    image: "/shirt-2.jpg",
    category: "clothing",
    subcategory: "shorts",
    stock: 35,
    rating: 4.5,
    reviewCount: 89,
    sales: 198,
    isNew: true,
    details: {
      material: "코튼 65%, 폴리에스터 35%",
      origin: "한국",
      manufacturer: "아웃도어기어",
      precautions: "지퍼 닫고 세탁",
      size: "S, M, L, XL",
      color: "카키, 베이지, 블랙",
      care: "일반 세탁"
    }
  }
];

async function addClothingProducts() {
  console.log('👕 의류 카테고리에 상품 10개 추가 시작\n');
  
  try {
    // 먼저 clothing 카테고리 확인
    const categoryDoc = await getDoc(doc(db, 'categories', 'clothing'));
    if (categoryDoc.exists()) {
      console.log(` 카테고리 확인: ${categoryDoc.data().name}`);
    }
    
    let addedCount = 0;
    
    for (const product of clothingProducts) {
      try {
        const docRef = await addDoc(
          collection(db, 'categories', 'clothing', 'products'),
          {
            ...product,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        
        console.log(`✅ ${product.name} 추가 완료 (ID: ${docRef.id})`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ ${product.name} 추가 실패:`, error.message);
      }
    }
    
    console.log(`\n🎉 총 ${addedCount}개 상품이 의류 카테고리에 추가되었습니다!`);
    
  } catch (error) {
    console.error('❌ 상품 추가 실패:', error);
  }
  
  process.exit(0);
}

addClothingProducts().catch(console.error);
