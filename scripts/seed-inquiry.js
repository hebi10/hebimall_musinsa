// Inquiry 시드 데이터 생성
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

// 문의 시드 데이터
const inquiryData = [
  {
    userId: 'test-user-1',
    userEmail: 'user1@test.com',
    userName: '김헤비',
    category: 'order',
    title: '주문 취소 요청',
    content: '어제 주문한 상품을 취소하고 싶습니다. 결제는 완료되었지만 아직 배송 전인 상태라 취소가 가능할 것 같은데, 어떻게 진행하면 될까요?',
    status: 'waiting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-2',
    userEmail: 'user2@test.com',
    userName: '이쇼핑',
    category: 'delivery',
    title: '배송지 변경 문의',
    content: '배송지를 변경하고 싶은데 가능한가요? 이미 발송된 상태인 것 같은데 변경이 어렵다면 택배사에 직접 연락해야 하나요?',
    status: 'answered',
    answer: {
      content: '안녕하세요. 확인 결과 아직 발송 전 상태로 배송지 변경이 가능합니다. 고객센터로 연락주시면 즉시 변경 처리해드리겠습니다.',
      answeredBy: '헤비몰 고객센터',
      answeredAt: serverTimestamp(),
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-3',
    userEmail: 'user3@test.com',
    userName: '박구매',
    category: 'exchange',
    title: '사이즈 교환 문의',
    content: '주문한 신발이 작아서 한 치수 큰 것으로 교환하고 싶습니다. 교환 비용과 절차를 알려주세요.',
    status: 'waiting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-1',
    userEmail: 'user1@test.com',
    userName: '김헤비',
    category: 'product',
    title: '상품 재입고 문의',
    content: '관심있게 보던 상품이 품절되었는데 언제쯤 재입고될 예정인가요? 재입고 알림 신청은 어떻게 하나요?',
    status: 'answered',
    answer: {
      content: '해당 상품은 다음 주 화요일 재입고 예정입니다. 상품 페이지에서 재입고 알림 신청하시면 입고 시 바로 알려드리겠습니다.',
      answeredBy: '헤비몰 상품팀',
      answeredAt: serverTimestamp(),
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    userId: 'test-user-4',
    userEmail: 'user4@test.com',
    userName: '최만족',
    category: 'account',
    title: '회원정보 수정 문의',
    content: '휴대폰 번호가 바뀌어서 회원정보를 수정하려고 하는데 인증이 안 됩니다. 어떻게 해야 하나요?',
    status: 'waiting',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
];

async function seedInquiryData() {
  try {
    console.log('🚀 Inquiry 시드 데이터 생성 시작...');
    
    const inquiryCollection = collection(db, 'inquiries');
    
    for (let i = 0; i < inquiryData.length; i++) {
      const data = inquiryData[i];
      console.log(`📝 Inquiry ${i + 1}/${inquiryData.length} 생성 중: ${data.title}`);
      
      const docRef = await addDoc(inquiryCollection, data);
      console.log(`✅ Inquiry 생성 완료 - ID: ${docRef.id}`);
    }
    
    console.log(`🎉 총 ${inquiryData.length}개의 Inquiry 시드 데이터 생성 완료!`);
    
  } catch (error) {
    console.error('❌ Inquiry 시드 데이터 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedInquiryData().then(() => {
    process.exit(0);
  });
}

module.exports = { seedInquiryData };
