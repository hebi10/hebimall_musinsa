// QnA 시드 데이터 스크립트 (클라이언트 SDK 사용)
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

const qnaData = [
  {
    userId: 'user001',
    userEmail: 'customer1@example.com',
    userName: '김철수',
    category: 'delivery',
    title: '배송이 지연되고 있는데 언제 받을 수 있나요?',
    content: '주문번호 ORD-240101-001 건으로 배송 예정일이 3일 지났는데 아직 도착하지 않았습니다. 확인 부탁드립니다.',
    images: [],
    isSecret: false,
    password: '',
    status: 'answered',
    views: 15,
    isNotified: true,
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-16T14:20:00'),
    productId: 'prod001',
    productName: '프리미엄 무선 이어폰',
    answer: {
      adminId: 'admin001',
      adminName: '고객서비스팀',
      content: '안녕하세요. 배송 지연으로 불편을 드려 죄송합니다.\n\n확인 결과, 택배사 물량 증가로 인한 지연이 발생했습니다. 내일(1월 17일) 오전 중 배송 예정이며, 배송비 전액 환불 처리해드렸습니다.\n\n추가 문의사항이 있으시면 언제든 연락 주세요.',
      answeredAt: new Date('2024-01-16T14:20:00'),
    },
  },
  {
    userId: 'user002',
    userEmail: 'customer2@example.com',
    userName: '이영희',
    category: 'product',
    title: '상품 색상이 사진과 다른데 교환 가능한가요?',
    content: '주문한 블루 컬러 가방이 실제로는 네이비에 가까운 색상으로 왔습니다. 사진과 너무 달라서 교환하고 싶은데 가능한지 문의드립니다.',
    images: ['https://example.com/product-color-diff1.jpg', 'https://example.com/product-color-diff2.jpg'],
    isSecret: false,
    password: '',
    status: 'answered',
    views: 8,
    isNotified: true,
    createdAt: new Date('2024-01-14T16:45:00'),
    updatedAt: new Date('2024-01-15T09:15:00'),
    productId: 'prod002',
    productName: '캐주얼 숄더백',
    answer: {
      adminId: 'admin002',
      adminName: '상품관리팀',
      content: '안녕하세요. 상품 색상 차이로 불편을 드려 죄송합니다.\n\n색상 차이가 확실히 있는 것으로 확인되어 무료 교환 처리해드리겠습니다. 원하시는 색상으로 새 상품을 보내드리고, 기존 상품은 택배기사가 수거해갈 예정입니다.\n\n교환 접수가 완료되었으며, 2-3일 내 새 상품이 배송됩니다.',
      answeredAt: new Date('2024-01-15T09:15:00'),
    },
  },
  {
    userId: 'user003',
    userEmail: 'customer3@example.com',
    userName: '박민수',
    category: 'payment',
    title: '결제 오류로 중복 결제되었습니다',
    content: '신용카드로 결제 진행 중 오류가 발생했는데, 확인해보니 같은 금액이 2번 결제되었습니다. 환불 처리 부탁드립니다.',
    images: ['https://example.com/payment-receipt1.jpg', 'https://example.com/payment-receipt2.jpg'],
    isSecret: true,
    password: 'pass123',
    status: 'answered',
    views: 3,
    isNotified: true,
    createdAt: new Date('2024-01-13T11:20:00'),
    updatedAt: new Date('2024-01-14T10:30:00'),
    productId: 'prod003',
    productName: '스마트워치',
    answer: {
      adminId: 'admin001',
      adminName: '결제지원팀',
      content: '안녕하세요. 중복 결제 건으로 문의 주셔서 감사합니다.\n\n확인 결과, 시스템 오류로 인한 중복 결제가 맞습니다. 중복 결제된 금액은 3-5영업일 내 자동 환불 처리됩니다.\n\n환불 완료 시 SMS로 안내드리겠습니다. 불편을 드려 죄송합니다.',
      answeredAt: new Date('2024-01-14T10:30:00'),
    },
  },
  {
    userId: 'user004',
    userEmail: 'customer4@example.com',
    userName: '최우진',
    category: 'general',
    title: '회원 등급 혜택에 대해 문의드립니다',
    content: '골드 회원인데 할인 혜택이 적용되지 않는 것 같습니다. 골드 회원 혜택이 정확히 어떤 것들이 있는지 알려주세요.',
    images: [],
    isSecret: false,
    password: '',
    status: 'waiting',
    views: 12,
    isNotified: false,
    createdAt: new Date('2024-01-16T14:30:00'),
    updatedAt: new Date('2024-01-16T14:30:00'),
    productId: null,
    productName: null,
  },
  {
    userId: 'user005',
    userEmail: 'customer5@example.com',
    userName: '정수연',
    category: 'product',
    title: '상품 사용법을 알고 싶어요',
    content: '구매한 커피머신 사용법이 복잡해서 잘 모르겠습니다. 동영상 매뉴얼이나 자세한 설명서가 있나요?',
    images: [],
    isSecret: false,
    password: '',
    status: 'answered',
    views: 6,
    isNotified: true,
    createdAt: new Date('2024-01-12T09:15:00'),
    updatedAt: new Date('2024-01-13T11:45:00'),
    productId: 'prod004',
    productName: '프리미엄 커피머신 deluxe',
    answer: {
      adminId: 'admin003',
      adminName: '제품지원팀',
      content: '안녕하세요. 커피머신 사용법 문의 주셔서 감사합니다.\n\n동영상 매뉴얼은 다음 링크에서 확인하실 수 있습니다:\nhttps://hebimall.com/manuals/coffee-machine-guide\n\n또한 카카오톡 상담을 통해 실시간으로 사용법 안내도 받으실 수 있습니다. 추가 문의사항이 있으시면 언제든 연락 주세요!',
      answeredAt: new Date('2024-01-13T11:45:00'),
    },
  },
  {
    userId: 'user006',
    userEmail: 'customer6@example.com',
    userName: '김하늘',
    category: 'delivery',
    title: '배송지 변경이 가능한가요?',
    content: '오늘 오전에 주문했는데 배송지를 잘못 입력했습니다. 아직 출고 전이라면 배송지 변경이 가능한지 문의드립니다.',
    images: [],
    isSecret: false,
    password: '',
    status: 'waiting',
    views: 2,
    isNotified: false,
    createdAt: new Date('2024-01-16T16:45:00'),
    updatedAt: new Date('2024-01-16T16:45:00'),
    productId: 'prod005',
    productName: '무선 키보드 마우스 세트',
  },
];

async function seedQnAData() {
  try {
    console.log('QnA 데이터 시딩 시작...');

    for (const qna of qnaData) {
      await addDoc(collection(db, 'qna'), qna);
    }
    
    console.log('QnA 데이터 시딩 완료!');
    console.log(`총 ${qnaData.length}개의 QnA가 추가되었습니다.`);
    
    // 통계 출력
    const stats = {};
    qnaData.forEach(qna => {
      stats[qna.category] = (stats[qna.category] || 0) + 1;
    });
    
    console.log('\n카테고리별 통계:');
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}개`);
    });
    
    const statusStats = {};
    qnaData.forEach(qna => {
      statusStats[qna.status] = (statusStats[qna.status] || 0) + 1;
    });
    
    console.log('\n상태별 통계:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}개`);
    });
    
  } catch (error) {
    console.error('QnA 데이터 시딩 중 오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedQnAData().then(() => {
    process.exit(0);
  });
}

module.exports = { seedQnAData };
