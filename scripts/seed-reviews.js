const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');
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

// 샘플 리뷰 데이터
const sampleReviews = [
  {
    productId: "0sSJJGiI64BRgADrYNw3",
    userId: "user1",
    userName: "김민수",
    rating: 5,
    title: "정말 만족스러운 상품입니다!",
    content: "품질이 정말 좋고 배송도 빨라서 만족합니다. 사이즈도 딱 맞고 색상도 사진과 동일해요. 추천합니다!",
    images: [],
    size: "L",
    color: "블랙",
    height: 175,
    weight: 70,
    isRecommended: true
  },
  {
    productId: "0sSJJGiI64BRgADrYNw3",
    userId: "user2", 
    userName: "이수진",
    rating: 4,
    title: "좋은 상품이에요",
    content: "전체적으로 만족스럽습니다. 다만 배송이 조금 늦었어요. 그래도 상품 자체는 좋습니다.",
    images: [],
    size: "M",
    color: "화이트",
    isRecommended: true
  },
  {
    productId: "0sSJJGiI64BRgADrYNw3",
    userId: "user3",
    userName: "박철민",
    rating: 3,
    title: "보통입니다",
    content: "가격 대비 괜찮은 편이지만 특별한 것은 없어요. 무난한 선택인 것 같습니다.",
    images: [],
    size: "XL", 
    color: "그레이",
    isRecommended: false
  },
  {
    productId: "0sSJJGiI64BRgADrYNw3",
    userId: "user4",
    userName: "정미영",
    rating: 5,
    title: "재구매 의사 있어요!",
    content: "처음 주문했는데 정말 만족스럽습니다. 소재도 좋고 핏도 예뻐요. 다른 색상도 주문할 예정이에요.",
    images: [],
    size: "S",
    color: "네이비",
    height: 160,
    weight: 50,
    isRecommended: true
  },
  {
    productId: "0sSJJGiI64BRgADrYNw3",
    userId: "user5",
    userName: "최준호",
    rating: 4,
    title: "가성비 좋아요",
    content: "이 가격에 이 품질이면 정말 만족스럽습니다. 약간 큰 감이 있지만 전체적으로 좋아요.",
    images: [],
    size: "L",
    color: "베이지",
    height: 180,
    weight: 75,
    isRecommended: true
  },
  {
    productId: "other-product-1",
    userId: "user6",
    userName: "한지민",
    rating: 5,
    title: "완벽한 상품!",
    content: "기대 이상이었어요. 디자인도 예쁘고 품질도 훌륭합니다. 강력 추천!",
    images: [],
    size: "M",
    color: "화이트",
    isRecommended: true
  },
  {
    productId: "other-product-1",
    userId: "user7",
    userName: "송민준",
    rating: 3,
    title: "그럭저럭",
    content: "나쁘지 않지만 특별하지도 않은 상품입니다. 기본적인 기능은 다 합니다.",
    images: [],
    size: "L",
    color: "블랙",
    isRecommended: false
  },
  {
    productId: "other-product-2",
    userId: "user8",
    userName: "윤서영",
    rating: 4,
    title: "예쁘고 실용적이에요",
    content: "디자인이 마음에 들어서 구매했는데 실용성도 좋네요. 만족합니다.",
    images: [],
    size: "S",
    color: "핑크",
    height: 165,
    weight: 55,
    isRecommended: true
  }
];

async function seedReviews() {
  try {
    console.log('리뷰 데이터 시딩 시작...');

    for (const reviewData of sampleReviews) {
      // reviews/{reviewId} 구조로 저장 (productId는 각 리뷰 문서에 포함)
      const reviewsCollection = collection(db, 'reviews');
      const reviewRef = doc(reviewsCollection);
      
      await setDoc(reviewRef, {
        ...reviewData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`✅ 리뷰 생성 완료 - 리뷰 ID: ${reviewRef.id}, 상품: ${reviewData.productId}`);
    }

    console.log('🎉 리뷰 데이터 시딩 완료!');
    process.exit(0);

  } catch (error) {
    console.error('❌ 리뷰 데이터 시딩 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedReviews();
}

module.exports = { seedReviews };
