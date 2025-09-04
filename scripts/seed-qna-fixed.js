// 브라우저 Firebase SDK를 사용한 QnA 시드 데이터 (수정된 버전)
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// 환경변수에서 Firebase 설정 읽기
require('dotenv').config({ path: '../.env.local' });

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

// QnA 시드 데이터 (간단한 버전)
const qnaData = [
  {
    userId: 'test-user-1',
    userEmail: 'user1@test.com',
    userName: '김헤비',
    category: 'product',
    title: '프리미엄 코튼 티셔츠 사이즈 문의',
    content: '안녕하세요. 프리미엄 코튼 티셔츠 구매를 고려하고 있는데, 평소 M사이즈를 입는데 이 제품도 M사이즈로 주문하면 될까요? 핏이 어떤지 궁금합니다.',
    isSecret: false,
    password: '',
    status: 'waiting',
    views: 5,
    isNotified: true,
    productId: 'product-1',
    productName: '프리미엄 코튼 티셔츠',
    images: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-2',
    userEmail: 'user2@test.com',
    userName: '이쇼핑',
    category: 'delivery',
    title: '배송 지연 문의',
    content: '3일 전에 주문했는데 아직 배송이 시작되지 않았습니다. 언제쯤 배송될 예정인지 알려주세요.',
    isSecret: false,
    password: '',
    status: 'waiting',
    views: 12,
    isNotified: true,
    images: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-3',
    userEmail: 'user3@test.com',
    userName: '박구매',
    category: 'payment',
    title: '카드 결제 오류 문의',
    content: '결제 진행 중 "결제에 실패했습니다"라는 메시지가 나오면서 결제가 안 됩니다. 카드에는 문제가 없는 것 같은데 어떻게 해야 하나요?',
    isSecret: true,
    password: '1234',
    status: 'waiting',
    views: 3,
    isNotified: true,
    images: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-4',
    userEmail: 'user4@test.com',
    userName: '최만족',
    category: 'return',
    title: '교환/반품 절차 문의',
    content: '어제 받은 후드 집업이 생각보다 커서 교환하고 싶습니다. 교환 절차와 비용이 어떻게 되나요?',
    isSecret: false,
    password: '',
    status: 'waiting',
    views: 2,
    isNotified: true,
    productId: 'product-5',
    productName: '오버핏 후드 집업',
    images: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-5',
    userEmail: 'user5@test.com',
    userName: '정단골',
    category: 'product',
    title: '가죽 백팩 품질 문의',
    content: '미니멀 가죽 백팩을 구매하려고 하는데, 실제 가죽 품질이 어떤지 궁금합니다. 사진으로 보기에는 좋아 보이는데 실물은 어떤가요?',
    isSecret: false,
    password: '',
    status: 'waiting',
    views: 15,
    isNotified: true,
    productId: 'product-4',
    productName: '미니멀 가죽 백팩',
    images: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
];

async function seedQnAData() {
  try {
    console.log('🚀 QnA 시드 데이터 생성 시작...');
    
    const qnaCollection = collection(db, 'qna');
    
    for (let i = 0; i < qnaData.length; i++) {
      const data = qnaData[i];
      console.log(`📝 QnA ${i + 1}/${qnaData.length} 생성 중: ${data.title}`);
      
      const docRef = await addDoc(qnaCollection, data);
      console.log(`✅ QnA 생성 완료 - ID: ${docRef.id}`);
    }
    
    console.log(`🎉 총 ${qnaData.length}개의 QnA 시드 데이터 생성 완료!`);
    
  } catch (error) {
    console.error('❌ QnA 시드 데이터 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedQnAData().then(() => {
    process.exit(0);
  });
}

module.exports = { seedQnAData };
