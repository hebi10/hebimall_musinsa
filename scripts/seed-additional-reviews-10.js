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

// 확장된 카테고리별 리뷰 템플릿 (10개씩)
const reviewTemplatesByCategory = {
  accessories: [
    { rating: 5, title: "정말 만족스러운 액세서리입니다!", content: "품질이 정말 좋고 디자인도 세련되네요. 가격 대비 너무 만족스럽고 매일 착용하고 있어요. 포인트로 활용하기 딱 좋습니다!", isRecommended: true },
    { rating: 5, title: "완벽한 포인트 아이템!", content: "심플한 옷에 이 액세서리 하나만 매치해도 완전히 달라보이네요. 퀄리티도 좋고 착용감도 편안해서 매우 만족합니다.", isRecommended: true },
    { rating: 5, title: "디자인이 너무 예뻐요", content: "사진보다 실물이 훨씬 예쁘네요! 마감처리도 깔끔하고 고급스러워 보입니다. 친구들한테도 추천했어요.", isRecommended: true },
    { rating: 5, title: "매일 착용하는 필수템", content: "가벼우면서도 튼튼하고, 어떤 스타일에든 잘 어울려요. 특히 색상이 정말 마음에 들어서 자주 착용하고 있습니다.", isRecommended: true },
    { rating: 5, title: "고급스러운 느낌", content: "생각보다 고급스럽고 세련된 디자인이에요. 가격대비 정말 만족스럽고 오래 사용할 수 있을 것 같아요.", isRecommended: true },
    { rating: 5, title: "선물로도 좋을 듯", content: "포장도 깔끔하게 와서 선물용으로도 좋을 것 같아요. 품질도 좋고 디자인도 무난해서 누구나 좋아할 것 같습니다.", isRecommended: true },
    { rating: 4, title: "가성비 좋은 선택", content: "가격대비 품질이 훌륭해요. 마감처리도 깔끔하고 실용적입니다. 다양한 스타일에 잘 어울리는 것 같아요.", isRecommended: true },
    { rating: 4, title: "만족스러운 구매", content: "전체적으로 만족스러운 제품이에요. 색상도 예쁘고 크기도 적당해서 사용하기 편리합니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 품질", content: "전반적으로 괜찮은 품질이에요. 디자인도 심플하고 깔끔해서 오래 사용할 수 있을 것 같습니다.", isRecommended: true },
    { rating: 3, title: "보통 수준", content: "가격을 생각하면 적당한 수준인 것 같아요. 특별히 나쁘지는 않지만 기대했던 것보다는 조금 아쉬워요.", isRecommended: false }
  ],
  
  bags: [
    { rating: 5, title: "완벽한 가방이에요!", content: "수납공간도 넉넉하고 디자인도 예뻐서 매일 들고 다니고 있어요. 어떤 옷과 매치해도 잘 어울리고 품질도 우수합니다!", isRecommended: true },
    { rating: 5, title: "실용성과 디자인 모두 만족", content: "포켓 구성이 정말 알차고 가방이 가볍면서도 튼튼해요. 디자인도 심플하면서 세련되어서 어디든 들고 가기 좋습니다.", isRecommended: true },
    { rating: 5, title: "수납력이 뛰어나요", content: "생각보다 많이 들어가고 정리도 잘 돼요. 지퍼도 부드럽게 잘 열리고 전체적인 퀄리티가 만족스럽습니다.", isRecommended: true },
    { rating: 5, title: "튼튼하고 실용적", content: "재질이 정말 좋고 튼튼해서 오래 사용할 수 있을 것 같아요. 크기도 적당하고 무게도 가벼워서 편리합니다.", isRecommended: true },
    { rating: 5, title: "스타일리시한 디자인", content: "모던하면서도 클래식한 느낌이 좋아요. 업무용으로도 캐주얼용으로도 잘 어울려서 활용도가 높습니다.", isRecommended: true },
    { rating: 5, title: "가성비 최고", content: "이 가격에 이런 퀄리티라니 정말 놀랍네요. 마감처리도 깔끔하고 디자인도 트렌디해서 만족합니다.", isRecommended: true },
    { rating: 4, title: "전체적으로 만족", content: "크기나 디자인 모두 만족스러워요. 가격 대비 좋은 품질이고 실용적으로 사용하기 좋습니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 가방", content: "생각했던 것보다 괜찮은 품질이에요. 수납공간도 충분하고 디자인도 무난해서 오래 사용할 것 같아요.", isRecommended: true },
    { rating: 4, title: "실용적인 선택", content: "기능적으로는 만족스럽고 가격도 합리적이에요. 다만 색상이 사진과 조금 다르긴 했지만 전체적으로는 만족합니다.", isRecommended: true },
    { rating: 3, title: "무난한 수준", content: "특별히 나쁘지는 않지만 기대했던 것만큼은 아니에요. 가격을 생각하면 적당한 것 같습니다.", isRecommended: false }
  ],

  clothing: [
    { rating: 5, title: "핏이 완벽해요!", content: "사이즈도 딱 맞고 소재도 좋아서 입는 느낌이 정말 편안해요. 디자인도 심플하면서 세련되어서 어디든 입고 가기 좋습니다!", isRecommended: true },
    { rating: 5, title: "소재가 정말 좋네요", content: "촉감이 부드럽고 통기성도 좋아서 하루 종일 입어도 편안해요. 세탁 후에도 형태가 잘 유지되는 것 같아요.", isRecommended: true },
    { rating: 5, title: "디자인이 예뻐요", content: "사진보다 실물이 훨씬 예쁘네요! 컬러도 화사하고 실루엣도 예뻐서 여러 벌 더 주문하고 싶어요.", isRecommended: true },
    { rating: 5, title: "가성비 최고의 옷", content: "이 가격에 이런 퀄리티라니 정말 만족스러워요. 봉제도 깔끔하고 전체적인 마감이 좋습니다.", isRecommended: true },
    { rating: 5, title: "스타일링하기 좋아요", content: "어떤 아이템과 매치해도 잘 어울리고 활용도가 높아요. 특히 컬러가 정말 마음에 들어서 자주 입고 있습니다.", isRecommended: true },
    { rating: 5, title: "편안하고 예뻐요", content: "입는 느낌도 편안하고 디자인도 트렌디해서 정말 만족해요. 친구들한테도 추천했습니다!", isRecommended: true },
    { rating: 4, title: "전체적으로 만족", content: "사이즈나 디자인 모두 만족스러워요. 소재도 괜찮고 가격 대비 좋은 품질인 것 같습니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 품질", content: "생각했던 것보다 괜찮은 품질이에요. 핏도 예쁘고 색상도 마음에 들어서 잘 입고 있습니다.", isRecommended: true },
    { rating: 4, title: "무난한 선택", content: "기본적인 디자인이지만 입기 편하고 활용도가 높아요. 가격도 합리적이라서 만족합니다.", isRecommended: true },
    { rating: 3, title: "보통 수준", content: "특별히 나쁘지는 않지만 기대했던 것만큼은 아니에요. 사이즈가 조금 작은 것 같기도 하고요.", isRecommended: false }
  ],

  jewelry: [
    { rating: 5, title: "반짝반짝 너무 예뻐요!", content: "정말 예쁘고 고급스러워 보여요. 착용감도 편하고 알레르기도 없어서 매일 착용하고 있습니다. 선물로도 추천!", isRecommended: true },
    { rating: 5, title: "품질이 뛰어나요", content: "마감처리가 정말 섬세하고 광택도 좋아서 고급 주얼리 같아요. 가격 대비 너무 만족스럽습니다.", isRecommended: true },
    { rating: 5, title: "세련된 디자인", content: "심플하면서도 고급스러운 디자인이 정말 마음에 들어요. 어떤 옷에든 잘 어울리고 포인트가 되네요.", isRecommended: true },
    { rating: 5, title: "착용감이 편해요", content: "가볍고 편안해서 하루 종일 착용해도 부담스럽지 않아요. 색이 변하지도 않고 품질이 정말 좋습니다.", isRecommended: true },
    { rating: 5, title: "고급스러운 느낌", content: "생각보다 훨씬 고급스럽고 예뻐요. 포장도 깔끔하게 와서 선물용으로도 좋을 것 같습니다.", isRecommended: true },
    { rating: 5, title: "완벽한 액세서리", content: "크기도 적당하고 디자인도 세련되어서 정말 만족해요. 다른 색상도 구매하고 싶어요!", isRecommended: true },
    { rating: 4, title: "예쁜 디자인", content: "전체적으로 예쁘고 품질도 괜찮아요. 가격 대비 만족스럽고 자주 착용하고 있습니다.", isRecommended: true },
    { rating: 4, title: "만족스러운 구매", content: "디자인이 심플하고 예뻐서 마음에 들어요. 품질도 나쁘지 않고 가격도 합리적입니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 품질", content: "생각보다 괜찮은 품질이에요. 광택도 좋고 착용감도 편해서 잘 사용하고 있습니다.", isRecommended: true },
    { rating: 3, title: "보통이에요", content: "나쁘지는 않지만 기대했던 것보다는 조금 아쉬워요. 그래도 가격을 생각하면 적당한 것 같아요.", isRecommended: false }
  ],

  outdoor: [
    { rating: 5, title: "아웃도어 활동에 최고!", content: "등산하면서 사용해봤는데 정말 만족스러워요. 기능성도 뛰어나고 내구성도 좋아서 오래 사용할 수 있을 것 같습니다!", isRecommended: true },
    { rating: 5, title: "기능성이 뛰어나요", content: "방수도 잘 되고 바람도 잘 막아줘서 야외활동할 때 정말 유용해요. 디자인도 스포티하고 멋있습니다.", isRecommended: true },
    { rating: 5, title: "내구성이 좋아요", content: "재질이 튼튼하고 잘 만들어진 것 같아요. 여러 번 사용해봤는데 전혀 손상되지 않고 계속 좋은 상태를 유지하고 있어요.", isRecommended: true },
    { rating: 5, title: "편안하고 실용적", content: "착용감이 편하고 움직임이 자유로워서 운동할 때 정말 좋아요. 디자인도 깔끔하고 기능성도 만족스럽습니다.", isRecommended: true },
    { rating: 5, title: "캠핑에서 대활약", content: "캠핑 갔을 때 사용해봤는데 정말 유용했어요. 품질도 좋고 휴대하기도 편해서 아웃도어 활동에 필수템이 된 것 같아요.", isRecommended: true },
    { rating: 5, title: "사계절 활용 가능", content: "봄, 여름, 가을 모두 사용할 수 있어서 활용도가 높아요. 특히 통기성이 좋아서 운동할 때 쾌적합니다.", isRecommended: true },
    { rating: 4, title: "만족스러운 기능성", content: "전체적으로 기능성이 좋고 가격도 합리적이에요. 야외활동 좋아하시는 분들께 추천드립니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 아웃도어 용품", content: "생각보다 괜찮은 품질이에요. 기본적인 기능은 모두 만족스럽고 디자인도 무난합니다.", isRecommended: true },
    { rating: 4, title: "실용적인 제품", content: "기능적으로는 만족스럽고 내구성도 좋은 편이에요. 가격 대비 괜찮은 선택인 것 같습니다.", isRecommended: true },
    { rating: 3, title: "무난한 수준", content: "기본적인 기능은 하지만 특별한 점은 없어요. 가격을 생각하면 적당한 것 같기도 하고요.", isRecommended: false }
  ],

  shoes: [
    { rating: 5, title: "신발이 정말 편해요!", content: "하루 종일 신어도 발이 안 아프고 쿠셔닝도 좋아서 정말 만족해요. 디자인도 깔끔하고 어떤 옷에든 잘 어울립니다!", isRecommended: true },
    { rating: 5, title: "핏이 완벽해요", content: "사이즈도 딱 맞고 발볼도 편해서 오래 신어도 괜찮아요. 특히 쿠셔닝이 좋아서 걷기가 편합니다.", isRecommended: true },
    { rating: 5, title: "디자인이 세련돼요", content: "모던하면서도 클래식한 느낌이 좋아요. 어떤 스타일에든 잘 매치되고 전체적인 완성도가 높습니다.", isRecommended: true },
    { rating: 5, title: "품질이 뛰어나요", content: "소재도 좋고 마감처리도 깔끔해서 고급스러워 보여요. 오래 신을 수 있을 것 같아서 만족스럽습니다.", isRecommended: true },
    { rating: 5, title: "편안한 착용감", content: "발이 편하고 통기성도 좋아서 하루 종일 신어도 무리가 없어요. 디자인도 트렌디하고 예쁩니다.", isRecommended: true },
    { rating: 5, title: "가성비 최고", content: "이 가격에 이런 퀄리티라니 정말 놀라워요. 편안하고 예뻐서 매일 신고 다니고 있습니다.", isRecommended: true },
    { rating: 4, title: "전체적으로 만족", content: "사이즈나 디자인 모두 만족스러워요. 발도 편하고 가격 대비 좋은 품질인 것 같습니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 신발", content: "생각보다 괜찮은 품질이에요. 편안하고 디자인도 무난해서 자주 신고 있습니다.", isRecommended: true },
    { rating: 4, title: "실용적인 선택", content: "기본적인 디자인이지만 편하고 활용도가 높아요. 가격도 합리적이라서 만족합니다.", isRecommended: true },
    { rating: 3, title: "보통 수준", content: "특별히 나쁘지는 않지만 기대했던 것만큼은 아니에요. 사이즈가 조금 작은 것 같기도 하고요.", isRecommended: false }
  ],

  sports: [
    { rating: 5, title: "운동할 때 최고예요!", content: "운동할 때 사용해봤는데 정말 편하고 기능성도 뛰어나요. 흡한속건 기능도 좋고 움직임도 자유로워서 만족합니다!", isRecommended: true },
    { rating: 5, title: "기능성이 뛰어나요", content: "땀 배출도 잘 되고 신축성도 좋아서 운동할 때 정말 편해요. 디자인도 스포티하고 멋있습니다.", isRecommended: true },
    { rating: 5, title: "퍼포먼스 향상", content: "이 제품 사용한 후로 운동할 때 더 편안하고 집중할 수 있어요. 품질도 좋고 내구성도 뛰어납니다.", isRecommended: true },
    { rating: 5, title: "편안한 착용감", content: "소재가 부드럽고 신축성이 좋아서 운동할 때 전혀 불편하지 않아요. 세탁 후에도 형태가 잘 유지됩니다.", isRecommended: true },
    { rating: 5, title: "스타일도 기능도 완벽", content: "운동할 때뿐만 아니라 일상에서도 입기 좋아요. 디자인이 세련되고 색상도 예뻐서 자주 착용하고 있습니다.", isRecommended: true },
    { rating: 5, title: "헬스장에서 인기", content: "헬스장에서 사용하는데 다른 회원들도 어디서 샀냐고 물어볼 정도로 만족스러워요. 기능성과 디자인 모두 좋습니다.", isRecommended: true },
    { rating: 4, title: "만족스러운 스포츠용품", content: "전체적으로 기능성이 좋고 가격도 합리적이에요. 운동 좋아하시는 분들께 추천드립니다.", isRecommended: true },
    { rating: 4, title: "괜찮은 품질", content: "생각보다 괜찮은 품질이에요. 기본적인 기능은 모두 만족스럽고 디자인도 무난합니다.", isRecommended: true },
    { rating: 4, title: "실용적인 제품", content: "운동할 때 사용하기 좋고 가격 대비 괜찮은 선택인 것 같아요. 내구성도 나쁘지 않습니다.", isRecommended: true },
    { rating: 3, title: "보통이에요", content: "기본적인 기능은 하지만 특별한 점은 없어요. 가격을 생각하면 적당한 것 같기도 하고요.", isRecommended: false }
  ]
};

// 기본 리뷰 템플릿 (카테고리가 매칭되지 않을 경우)
const defaultReviewTemplates = [
  { rating: 5, title: "정말 만족스러운 제품!", content: "품질이 정말 좋고 디자인도 마음에 들어요. 가격 대비 너무 만족스럽고 오래 사용할 수 있을 것 같습니다!", isRecommended: true },
  { rating: 5, title: "완벽한 선택이었어요", content: "기대했던 것보다 훨씬 좋네요. 퀄리티도 뛰어나고 실용적이어서 매우 만족합니다.", isRecommended: true },
  { rating: 5, title: "추천하고 싶은 제품", content: "정말 좋은 제품이에요. 친구들한테도 추천했을 정도로 만족스럽습니다. 다시 구매할 의향 있어요!", isRecommended: true },
  { rating: 5, title: "기대 이상", content: "생각했던 것보다 훨씬 좋아서 놀랐어요. 품질도 좋고 디자인도 세련되어서 만족합니다.", isRecommended: true },
  { rating: 5, title: "가성비 최고", content: "이 가격에 이런 퀄리티라니 정말 놀라워요. 마감처리도 깔끔하고 전체적으로 만족스럽습니다.", isRecommended: true },
  { rating: 5, title: "우수한 품질", content: "재질도 좋고 만듦새도 탄탄해서 오래 사용할 수 있을 것 같아요. 정말 만족스러운 구매였습니다.", isRecommended: true },
  { rating: 4, title: "전체적으로 만족", content: "전반적으로 만족스러운 제품이에요. 가격 대비 좋은 품질이고 실용적으로 사용하기 좋습니다.", isRecommended: true },
  { rating: 4, title: "괜찮은 선택", content: "생각보다 괜찮은 품질이에요. 디자인도 무난하고 기능적으로도 만족스럽습니다.", isRecommended: true },
  { rating: 4, title: "만족스러운 구매", content: "기대했던 수준은 충분히 만족시켜주는 제품이에요. 가격도 합리적이라서 만족합니다.", isRecommended: true },
  { rating: 3, title: "무난한 수준", content: "특별히 나쁘지는 않지만 기대했던 것만큼은 아니에요. 가격을 생각하면 적당한 것 같아요.", isRecommended: false }
];

// 랜덤 사용자 이름 생성
const userNames = [
  '김*진', '이*수', '박*영', '최*민', '정*호', '강*서', '윤*아', '임*우', '한*진', '오*희',
  '서*영', '권*호', '황*미', '안*준', '송*현', '유*빈', '심*웅', '문*정', '양*석', '구*영',
  '신*희', '조*민', '장*호', '노*진', '백*수', '홍*아', '고*우', '남*영', '변*호', '도*진',
  '배*미', '소*현', '원*호', '석*민', '추*영', '봉*진', '사*우', '태*희', '하*성', '피*영'
];

// 리뷰 ID 생성 함수
function generateReviewId() {
  return Math.random().toString(36).substr(2, 20);
}

// 랜덤 요소 선택 함수
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 상품별 리뷰 생성 함수
function generateReviewsForProduct(product, categoryName) {
  console.log(`  📝 ${product.name} - 리뷰 10개 생성 중...`);
  
  // 해당 카테고리의 리뷰 템플릿 가져오기
  const templates = reviewTemplatesByCategory[categoryName] || defaultReviewTemplates;
  
  const reviews = [];
  
  // 10개의 리뷰 생성
  for (let i = 0; i < 10; i++) {
    const template = templates[i] || getRandomElement(templates);
    const reviewId = generateReviewId();
    const userName = getRandomElement(userNames);
    
    // 생성 시간을 조금씩 다르게 설정 (최근 2개월 내)
    const daysAgo = Math.floor(Math.random() * 60); // 0-60일 전
    const hoursAgo = Math.floor(Math.random() * 24); // 0-23시간 전
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(createdAt.getHours() - hoursAgo);
    
    const review = {
      id: reviewId,
      productId: product.id,
      userId: `user_${Math.random().toString(36).substr(2, 8)}`,
      userName: userName,
      rating: template.rating,
      title: template.title,
      content: template.content,
      images: [],
      size: product.sizes && product.sizes.length > 0 ? getRandomElement(product.sizes) : null,
      color: product.colors && product.colors.length > 0 ? getRandomElement(product.colors) : null,
      height: null,
      weight: null,
      isRecommended: template.isRecommended,
      status: 'active',
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(createdAt)
    };
    
    reviews.push(review);
  }
  
  return reviews;
}

// 메인 실행 함수
async function seedAllProductsReviews() {
  try {
    console.log('🚀 모든 상품에 리뷰 10개씩 추가 시작...\n');
    
    let totalProducts = 0;
    let totalReviewsCreated = 0;
    let batchCount = 0;
    
    // 모든 카테고리 조회
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryName = categoryDoc.id;
      console.log(`\n📁 카테고리: ${categoryName}`);
      
      // 해당 카테고리의 모든 상품 조회
      const productsSnapshot = await getDocs(collection(db, 'categories', categoryName, 'products'));
      console.log(`  - 상품 수: ${productsSnapshot.size}개`);
      
      if (productsSnapshot.size === 0) {
        console.log(`  ⚠️ ${categoryName} 카테고리에 상품이 없습니다.`);
        continue;
      }
      
      // 각 상품에 대해 리뷰 생성
      for (const productDoc of productsSnapshot.docs) {
        const productData = { id: productDoc.id, ...productDoc.data() };
        totalProducts++;
        
        // 상품별 리뷰 10개 생성
        const reviews = generateReviewsForProduct(productData, categoryName);
        
        // 리뷰를 Firestore에 저장
        for (const review of reviews) {
          try {
            await setDoc(doc(db, 'reviews', review.id), review);
            totalReviewsCreated++;
            
            // 진행 상황 표시 (100개마다)
            if (totalReviewsCreated % 100 === 0) {
              console.log(`    💾 리뷰 저장 진행률: ${totalReviewsCreated}개 완료`);
            }
          } catch (error) {
            console.error(`    ❌ 리뷰 저장 실패 (${review.id}):`, error.message);
          }
        }
        
        // 배치 단위로 처리 상황 로그
        batchCount++;
        if (batchCount % 10 === 0) {
          console.log(`    🔄 ${batchCount}개 상품 처리 완료 (총 ${totalReviewsCreated}개 리뷰 생성)`);
        }
      }
    }
    
    console.log(`\n🎉 리뷰 생성 완료!`);
    console.log(`📊 최종 결과:`);
    console.log(`  - 처리된 상품: ${totalProducts}개`);
    console.log(`  - 생성된 리뷰: ${totalReviewsCreated}개`);
    console.log(`  - 상품당 평균 리뷰: ${(totalReviewsCreated / totalProducts).toFixed(1)}개`);
    
    // 평점 분포 확인
    console.log(`\n📈 평점 분포 (예상):`);
    console.log(`  - 5점: 약 ${Math.round(totalReviewsCreated * 0.6)}개 (60%)`);
    console.log(`  - 4점: 약 ${Math.round(totalReviewsCreated * 0.3)}개 (30%)`);
    console.log(`  - 3점: 약 ${Math.round(totalReviewsCreated * 0.1)}개 (10%)`);
    
  } catch (error) {
    console.error('❌ 리뷰 생성 실패:', error);
  }
}

// 스크립트 실행
seedAllProductsReviews();