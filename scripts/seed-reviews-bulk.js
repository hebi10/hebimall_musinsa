const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBUv3D8_Z5G7sSUCi9YvQwKgJf3NKgQYjo",
  authDomain: "hebimall.firebaseapp.com",
  projectId: "hebimall",
  storageBucket: "hebimall.firebasestorage.app",
  messagingSenderId: "461569816406",
  appId: "1:461569816406:web:3d7c59c4a9cd44f0b93b14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 상품 ID 목록
const productIds = [
  '0sSJJGiI64BRgADrYNw3', // 미니멀 벨트
  '7TpTv73QB4UlHuTt38EP', // 선글라스 UV차단
  'G1m7xmydmjtooRL9F74v', // 레더 손목 시계
  'RnlLQSPRhcJvqLg5l2nq', // 니트 비니
  'XIBNY2olry6D8lY2bHMl', // 실버 체인 목걸이
  'E390uPLbm3djmERVH9D1', // 클래식 화이트 스니커즈
  'aImZa4TlSD2E6ytCqu9R', // 러닝 스포츠 신발
  'j7IDrEeVoxnH5jo3tI5Y', // 하이킹 부츠
  'o68voh4IoCyKsovouiPm', // 캔버스 캐주얼 신발
  'product-3'              // 클래식 스니커즈
];

// 샘플 리뷰 템플릿
const reviewTemplates = [
  {
    rating: 5,
    title: "정말 만족스러운 상품입니다!",
    content: "품질이 정말 좋고 배송도 빨라서 만족합니다. 사이즈도 딱 맞고 색상도 사진과 동일해요. 추천합니다!",
    isRecommended: true
  },
  {
    rating: 5,
    title: "완전 대만족!",
    content: "가격 대비 품질이 훌륭해요. 디자인도 깔끔하고 실용적입니다. 재구매 의향 있어요!",
    isRecommended: true
  },
  {
    rating: 4,
    title: "좋은 상품이에요",
    content: "전체적으로 만족스럽습니다. 다만 배송이 조금 늦었어요. 그래도 상품 자체는 좋습니다.",
    isRecommended: true
  },
  {
    rating: 4,
    title: "괜찮은 선택",
    content: "기대했던 것보다 좋네요. 마감처리도 깔끔하고 착용감도 편안합니다.",
    isRecommended: true
  },
  {
    rating: 4,
    title: "만족스러워요",
    content: "사진과 실제 상품이 거의 동일해요. 품질도 좋고 가격도 합리적입니다.",
    isRecommended: true
  },
  {
    rating: 3,
    title: "보통입니다",
    content: "가격 대비 괜찮은 편이지만 특별한 것은 없어요. 무난한 선택인 것 같습니다.",
    isRecommended: false
  },
  {
    rating: 3,
    title: "그럭저럭",
    content: "기대보다는 조금 아쉽지만 쓸만해요. 가격을 생각하면 적당한 것 같습니다.",
    isRecommended: false
  },
  {
    rating: 2,
    title: "아쉬운 부분이 있어요",
    content: "품질이 기대에 못 미쳤어요. 사진과 실제가 좀 달라서 실망스럽습니다.",
    isRecommended: false
  },
  {
    rating: 4,
    title: "품질 좋아요",
    content: "소재가 좋고 마감도 깔끔해요. 스타일링하기 좋은 아이템인 것 같습니다.",
    isRecommended: true
  },
  {
    rating: 5,
    title: "강력 추천!",
    content: "이 가격에 이런 품질이라니! 정말 만족스럽고 주변 사람들에게도 추천하고 있어요.",
    isRecommended: true
  }
];

// 사용자 이름 목록
const userNames = [
  "김민수", "이수진", "박철민", "정미경", "최영호",
  "한지원", "송준영", "임다은", "양성호", "조현아",
  "윤태준", "서지혜", "안준호", "배소영", "권민재",
  "문예진", "강동현", "신유리", "오세훈", "장은비"
];

// 사이즈 옵션
const sizes = ["XS", "S", "M", "L", "XL", "230", "240", "250", "260", "270", "FREE"];
const colors = ["블랙", "화이트", "그레이", "네이비", "베이지", "브라운", "카키", "버건디"];

// 랜덤 선택 함수
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 랜덤 날짜 생성 (최근 3개월)
function getRandomDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTime);
}

async function seedReviews() {
  try {
    console.log('대량 리뷰 데이터 시딩 시작...');
    console.log(`${productIds.length}개 상품에 각각 10개씩 총 ${productIds.length * 10}개 리뷰 생성`);

    let totalReviews = 0;

    for (const productId of productIds) {
      console.log(`\n상품 ${productId}에 리뷰 생성 중...`);
      
      for (let i = 0; i < 10; i++) {
        const template = reviewTemplates[i];
        const createdAt = getRandomDate();
        
        const reviewData = {
          productId,
          userId: `user_${Math.random().toString(36).substr(2, 9)}`,
          userName: getRandomItem(userNames),
          rating: template.rating,
          title: template.title,
          content: template.content,
          images: [],
          size: getRandomItem(sizes),
          color: getRandomItem(colors),
          height: Math.floor(Math.random() * 30) + 160, // 160-190cm
          weight: Math.floor(Math.random() * 40) + 50,  // 50-90kg
          isRecommended: template.isRecommended,
          createdAt: Timestamp.fromDate(createdAt),
          updatedAt: Timestamp.fromDate(createdAt)
        };

        // reviews/{productId}/reviews/{reviewId} 구조로 저장
        const reviewsCollection = collection(db, `reviews/${productId}/reviews`);
        const reviewRef = doc(reviewsCollection);
        
        await setDoc(reviewRef, reviewData);
        totalReviews++;
        
        process.stdout.write(`  리뷰 ${i + 1}/10 생성 완료\r`);
      }
      
      console.log(`\n  ✅ 상품 ${productId}: 10개 리뷰 생성 완료`);
    }

    console.log(`\n🎉 리뷰 데이터 시딩 완료! 총 ${totalReviews}개 리뷰 생성됨`);
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
