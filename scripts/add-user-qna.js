// 현재 로그인한 사용자용 QnA 추가 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

// 사용자 ID를 인자로 받아서 QnA 생성
async function addUserQnA(userId, userEmail, userName) {
  const qnaData = [
    {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      category: 'product',
      title: '상품 사이즈 문의드립니다',
      content: '구매하려는 상품의 정확한 사이즈를 알고 싶습니다. 사이즈표와 실제 치수가 다른 경우가 있나요?',
      images: [],
      isSecret: false,
      password: '',
      status: 'answered',
      views: 5,
      isNotified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      productId: 'prod001',
      productName: '프리미엄 티셔츠',
      answer: {
        content: '안녕하세요. 해당 상품은 실측 기준으로 사이즈표를 작성하고 있습니다. L사이즈 기준 가슴단면 55cm, 총장 70cm입니다.',
        answeredBy: '고객서비스팀',
        answeredAt: new Date(),
        isAdmin: true,
      },
    },
    {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      category: 'delivery',
      title: '배송 관련 문의',
      content: '주문한 상품의 배송 현황을 확인하고 싶습니다. 언제쯤 받을 수 있을까요?',
      images: [],
      isSecret: false,
      password: '',
      status: 'waiting',
      views: 2,
      isNotified: true,
      createdAt: new Date(Date.now() - 86400000), // 1일 전
      updatedAt: new Date(Date.now() - 86400000),
      productId: null,
      productName: null,
    },
    {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      category: 'payment',
      title: '결제 문의',
      content: '결제 과정에서 오류가 발생했는데 확인 부탁드립니다.',
      images: [],
      isSecret: true,
      password: 'mypassword123',
      status: 'answered',
      views: 1,
      isNotified: true,
      createdAt: new Date(Date.now() - 172800000), // 2일 전
      updatedAt: new Date(Date.now() - 86400000),
      productId: null,
      productName: null,
      answer: {
        content: '결제 오류가 확인되어 재처리해드렸습니다. 주문이 정상적으로 완료되었습니다.',
        answeredBy: '결제지원팀',
        answeredAt: new Date(Date.now() - 86400000),
        isAdmin: true,
      },
    }
  ];

  try {
    console.log(`사용자 ${userName}(${userId})의 QnA 데이터 추가 시작...`);

    for (const qna of qnaData) {
      await addDoc(collection(db, 'qna'), qna);
      console.log(`QnA 추가됨: ${qna.title}`);
    }

    console.log('사용자 QnA 데이터 추가 완료!');
    console.log(`총 ${qnaData.length}개의 QnA가 추가되었습니다.`);
    
  } catch (error) {
    console.error('QnA 데이터 추가 중 오류 발생:', error);
  }
}

// 명령행 인자로 사용자 정보 받기
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('사용법: node add-user-qna.js [userId] [userEmail] [userName]');
  console.log('예: node add-user-qna.js "abc123" "user@example.com" "홍길동"');
  process.exit(1);
}

const [userId, userEmail, userName] = args;

// 스크립트 실행
if (require.main === module) {
  addUserQnA(userId, userEmail, userName).then(() => {
    process.exit(0);
  });
}

module.exports = { addUserQnA };
