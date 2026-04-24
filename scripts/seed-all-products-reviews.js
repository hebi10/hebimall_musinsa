const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, Timestamp } = require('firebase/firestore');

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

// Firebase 설정
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

// 카테고리별 맞춤형 리뷰 템플릿
const reviewTemplatesByCategory = {
  accessories: [
    {
      rating: 5,
      title: "정말 만족스러운 액세서리입니다!",
      content: "품질이 정말 좋고 디자인도 세련되네요. 가격 대비 너무 만족스럽고 매일 착용하고 있어요. 포인트로 활용하기 딱 좋습니다!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "완벽한 포인트 아이템!",
      content: "심플한 옷에 이 액세서리 하나만 매치해도 완전히 달라보이네요. 퀄리티도 좋고 착용감도 편안해서 매우 만족합니다.",
      isRecommended: true
    },
    {
      rating: 4,
      title: "가성비 좋은 선택",
      content: "가격대비 품질이 훌륭해요. 마감처리도 깔끔하고 실용적입니다. 다양한 스타일에 잘 어울리는 것 같아요.",
      isRecommended: true
    }
  ],
  bags: [
    {
      rating: 5,
      title: "완벽한 가방이에요!",
      content: "수납공간도 넉넉하고 디자인도 예뻐서 매일 들고 다니고 있어요. 어떤 옷과 매치해도 잘 어울리고 품질도 우수합니다!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "실용성과 디자인 모두 만족",
      content: "가방 안쪽 구조가 정말 잘 되어있어서 물건 정리하기 편해요. 소재도 고급스럽고 오래 사용할 수 있을 것 같습니다.",
      isRecommended: true
    },
    {
      rating: 4,
      title: "데일리용으로 최고",
      content: "크기도 적당하고 가벼워서 부담스럽지 않아요. 색상도 다양한 옷과 잘 맞고 튼튼해 보입니다. 추천해요!",
      isRecommended: true
    }
  ],
  tops: [
    {
      rating: 5,
      title: "핏이 정말 예쁘네요!",
      content: "소재가 부드럽고 착용감이 편안해요. 세탁 후에도 변형이 없고 색상도 선명하게 유지됩니다. 정말 만족스러운 구매입니다!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "스타일링하기 좋아요",
      content: "디자인이 깔끔해서 어떤 하의와도 잘 어울려요. 품질도 좋고 사이즈도 딱 맞아서 매우 만족합니다. 재구매 의향 있어요!",
      isRecommended: true
    },
    {
      rating: 4,
      title: "가성비 최고의 상품",
      content: "이 가격에 이런 품질이라니 놀랐어요. 봉제 상태도 깔끔하고 실물이 사진보다 더 예뻐요. 강력 추천합니다!",
      isRecommended: true
    }
  ],
  bottoms: [
    {
      rating: 5,
      title: "착용감이 정말 편해요!",
      content: "핏이 완벽하고 움직임도 자유로워요. 소재가 신축성이 좋아서 하루 종일 입어도 불편하지 않습니다. 다른 색상도 구매하고 싶어요!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "퀄리티가 훌륭합니다",
      content: "봉제 상태가 정말 좋고 마감처리도 깔끔해요. 어떤 상의와 매치해도 예쁘고 실용적입니다. 적극 추천해요!",
      isRecommended: true
    },
    {
      rating: 4,
      title: "만족스러운 구매",
      content: "사이즈가 딱 맞고 디자인도 심플해서 좋아요. 세탁 후에도 형태가 잘 유지되고 색 빠짐도 없었습니다.",
      isRecommended: true
    }
  ],
  shoes: [
    {
      rating: 5,
      title: "편안하고 예쁜 신발!",
      content: "발이 편하고 디자인도 세련돼서 매일 신고 다니고 있어요. 쿠셔닝이 좋아서 오래 걸어도 피곤하지 않아요. 최고입니다!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "가성비 갑 신발",
      content: "이 가격에 이런 퀄리티라니! 소재도 좋고 마감도 깔끔해요. 다양한 스타일에 잘 어울리고 내구성도 좋아 보입니다.",
      isRecommended: true
    },
    {
      rating: 4,
      title: "데일리 신발로 추천",
      content: "편안하고 스타일리시해서 만족해요. 사이즈도 정확하고 착화감이 좋습니다. 오래 신을 수 있을 것 같아요!",
      isRecommended: true
    }
  ],
  jewelry: [
    {
      rating: 5,
      title: "고급스러운 주얼리!",
      content: "마감이 정말 깔끔하고 고급스러워요. 착용했을 때 피부 트러블도 없고 변색도 없어서 매우 만족합니다. 선물용으로도 좋을 것 같아요!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "세련된 디자인이 매력적",
      content: "심플하면서도 포인트가 되는 디자인이에요. 어떤 옷과도 잘 어울리고 가격 대비 퀄리티가 훌륭합니다. 적극 추천해요!",
      isRecommended: true
    },
    {
      rating: 4,
      title: "만족스러운 품질",
      content: "착용감이 편하고 디자인도 예뻐요. 소재가 좋아서 오래 착용해도 변색이나 손상이 없을 것 같습니다. 좋은 구매였어요!",
      isRecommended: true
    }
  ],
  sports: [
    {
      rating: 5,
      title: "운동할 때 최고예요!",
      content: "기능성이 정말 뛰어나고 착용감도 편해요. 흡습속건 기능이 우수하고 움직임도 자유로워서 운동할 때 불편함이 없어요!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "퍼포먼스 향상에 도움",
      content: "소재가 신축성이 좋고 통기성도 우수해요. 운동 후 세탁도 쉽고 빨리 말라서 실용적입니다. 운동용품으로 강추!",
      isRecommended: true
    },
    {
      rating: 4,
      title: "가성비 좋은 스포츠웨어",
      content: "가격 대비 품질이 훌륭해요. 디자인도 스포티하고 활동성이 좋아서 만족합니다. 다른 색상도 구매 예정이에요!",
      isRecommended: true
    }
  ],
  outdoor: [
    {
      rating: 5,
      title: "아웃도어 활동에 완벽!",
      content: "방수, 방풍 기능이 우수하고 내구성도 뛰어나요. 등산이나 캠핑할 때 정말 유용하고 품질도 브랜드 제품 못지않습니다!",
      isRecommended: true
    },
    {
      rating: 5,
      title: "기능성과 실용성 만점",
      content: "포켓도 많고 실용적이에요. 소재가 튼튼하고 디자인도 깔끔해서 일상에서도 착용하기 좋습니다. 정말 만족스러워요!",
      isRecommended: true
    },
    {
      rating: 4,
      title: "아웃도어 입문자에게 추천",
      content: "가격이 합리적이면서도 기본적인 기능은 다 갖춰있어요. 처음 아웃도어 용품 구매하시는 분들께 추천드립니다!",
      isRecommended: true
    }
  ]
};

// 기본 리뷰 템플릿 (카테고리별 템플릿이 없는 경우)
const defaultReviewTemplates = [
  {
    rating: 5,
    title: "정말 만족스러운 상품입니다!",
    content: "품질이 정말 좋고 배송도 빨라서 만족합니다. 사이즈도 딱 맞고 색상도 사진과 동일해요. 적극 추천합니다!",
    isRecommended: true
  },
  {
    rating: 5,
    title: "완전 대만족!",
    content: "가격 대비 품질이 훌륭해요. 디자인도 깔끔하고 실용적입니다. 주변 사람들에게도 추천하고 있어요!",
    isRecommended: true
  },
  {
    rating: 4,
    title: "좋은 상품이에요",
    content: "전체적으로 만족스럽습니다. 품질도 좋고 가격도 합리적이에요. 재구매 의향이 있습니다!",
    isRecommended: true
  }
];

// 사용자 이름 목록
const userNames = [
  "김민지", "이준호", "박서연", "정우진", "최예원",
  "한동현", "송지아", "임태영", "양소희", "조현우",
  "윤채영", "서지훈", "안유진", "배준석", "권민아",
  "문예은", "강태민", "신혜린", "오세영", "장윤서",
  "홍준혁", "구민정", "남태현", "백소영", "노성민",
  "도하영", "류진우", "명지원", "변서준", "사예린"
];

// 사이즈 옵션 (카테고리별)
const sizeOptions = {
  tops: ["XS", "S", "M", "L", "XL"],
  bottoms: ["XS", "S", "M", "L", "XL"],
  shoes: ["230", "235", "240", "245", "250", "255", "260", "265", "270", "275"],
  accessories: ["FREE"],
  bags: ["FREE"],
  jewelry: ["FREE"],
  sports: ["XS", "S", "M", "L", "XL"],
  outdoor: ["XS", "S", "M", "L", "XL"]
};

// 색상 옵션
const colorOptions = ["블랙", "화이트", "그레이", "네이비", "베이지", "브라운", "카키", "버건디", "올리브", "크림"];

// 랜덤 선택 함수
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 랜덤 날짜 생성 (최근 6개월)
function getRandomDate() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
}

// 모든 상품 조회
async function getAllProducts() {
  console.log('📋 모든 상품 조회 중...');
  
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  let allProducts = [];
  
  for (const categoryDoc of categoriesSnapshot.docs) {
    const categoryId = categoryDoc.id;
    
    try {
      const productsSnapshot = await getDocs(collection(db, 'categories', categoryId, 'products'));
      
      productsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        allProducts.push({
          id: doc.id,
          name: data.name,
          category: categoryId,
          brand: data.brand || '브랜드'
        });
      });
      
      console.log(`  📂 ${categoryId}: ${productsSnapshot.size}개 상품`);
    } catch (error) {
      console.log(`  ⚠️ ${categoryId} 조회 실패: ${error.message}`);
    }
  }
  
  return allProducts;
}

// 상품에 리뷰 3개 추가
async function addReviewsToProduct(product) {
  console.log(`\n🔍 상품: ${product.name} (${product.id})`);
  
  // 카테고리별 리뷰 템플릿 선택
  const templates = reviewTemplatesByCategory[product.category] || defaultReviewTemplates;
  
  for (let i = 0; i < 3; i++) {
    const template = templates[i];
    const createdAt = getRandomDate();
    
    // 카테고리에 맞는 사이즈 선택
    const sizes = sizeOptions[product.category] || ["FREE"];
    
    const reviewData = {
      productId: product.id,
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      userName: getRandomItem(userNames),
      rating: template.rating,
      title: template.title,
      content: template.content,
      images: [],
      size: getRandomItem(sizes),
      color: getRandomItem(colorOptions),
      height: Math.floor(Math.random() * 30) + 160, // 160-190cm
      weight: Math.floor(Math.random() * 40) + 50,  // 50-90kg
      isRecommended: template.isRecommended,
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(createdAt)
    };

    try {
      // reviews 컬렉션에 직접 저장 (ReviewService와 동일한 구조)
      const reviewsCollection = collection(db, 'reviews');
      const reviewRef = doc(reviewsCollection);
      
      await setDoc(reviewRef, reviewData);
      
      console.log(`  ✅ 리뷰 ${i + 1}/3: ${template.title} (⭐${template.rating})`);
    } catch (error) {
      console.log(`  ❌ 리뷰 ${i + 1}/3 생성 실패: ${error.message}`);
    }
  }
}

// 메인 함수
async function seedAllProductsReviews() {
  try {
    console.log('🎯 모든 상품에 리뷰 추가 시작...\n');
    
    // 모든 상품 조회
    const allProducts = await getAllProducts();
    console.log(`\n총 ${allProducts.length}개 상품 발견`);
    console.log(`🎪 총 ${allProducts.length * 3}개의 리뷰를 생성합니다!\n`);
    
    let processedCount = 0;
    let successCount = 0;
    
    // 각 상품에 리뷰 3개씩 추가
    for (const product of allProducts) {
      try {
        await addReviewsToProduct(product);
        successCount++;
      } catch (error) {
        console.log(`❌ 상품 ${product.name} 리뷰 추가 실패: ${error.message}`);
      }
      
      processedCount++;
      
      // 진행률 표시
      if (processedCount % 10 === 0) {
        console.log(`\n📈 진행률: ${processedCount}/${allProducts.length} (${Math.round(processedCount/allProducts.length*100)}%)`);
      }
      
      // API 제한을 위한 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 리뷰 생성 완료!`);
    console.log(`✅ 성공: ${successCount}개 상품`);
    console.log(`❌ 실패: ${allProducts.length - successCount}개 상품`);
    console.log(`총 리뷰 수: ${successCount * 3}개`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ 리뷰 시딩 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedAllProductsReviews();
}

module.exports = { seedAllProductsReviews };