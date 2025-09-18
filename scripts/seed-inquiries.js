const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK 초기화
const serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

// 시드 문의 데이터
const seedInquiries = [
  {
    userId: 'test-user-1',
    userEmail: 'customer1@example.com',
    userName: '김고객',
    category: 'delivery',
    title: '배송 지연 문의',
    content: '12월 10일에 주문한 상품이 아직 배송되지 않았습니다. 주문번호는 240210-12345입니다. 언제쯤 받을 수 있을까요? 급하게 필요한 상품이라 걱정됩니다.',
    status: 'answered',
    createdAt: new Date('2024-12-15T10:30:00'),
    updatedAt: new Date('2024-12-15T14:20:00'),
    answer: {
      content: '안녕하세요. 고객님의 주문 상품을 확인해보니 현재 배송 중이며, 내일(12월 16일) 오전 중 도착 예정입니다. 연휴로 인한 배송 지연으로 불편을 드려 죄송합니다. 추가 문의사항이 있으시면 언제든 연락 주세요.',
      answeredBy: '고객센터 김팀장',
      answeredAt: new Date('2024-12-15T14:20:00')
    }
  },
  {
    userId: 'test-user-2',
    userEmail: 'customer2@example.com',
    userName: '이쇼핑',
    category: 'exchange',
    title: '사이즈 교환 문의',
    content: '어제 받은 니트 사이즈가 너무 작습니다. M사이즈로 주문했는데 실제로는 S사이즈 같아요. L사이즈로 교환 가능한가요? 상품택은 아직 제거하지 않았습니다.',
    status: 'answered',
    createdAt: new Date('2024-12-14T15:45:00'),
    updatedAt: new Date('2024-12-14T16:30:00'),
    answer: {
      content: '안녕하세요. 사이즈 불만족으로 인한 교환은 가능합니다. 마이페이지 > 주문내역에서 교환신청을 해주시거나, 고객센터(1588-1234)로 연락 주시면 바로 처리해드리겠습니다. 상품택이 있으시면 무료 교환 가능합니다.',
      answeredBy: '고객센터 박대리',
      answeredAt: new Date('2024-12-14T16:30:00')
    }
  },
  {
    userId: 'test-user-3',
    userEmail: 'customer3@example.com',
    userName: '박패션',
    category: 'product',
    title: '상품 재입고 문의',
    content: 'STYNA 브랜드 화이트 셔츠 (상품번호: HB-SH-001)가 품절되었는데 언제 재입고 되나요? 꼭 구매하고 싶어서 기다리고 있습니다.',
    status: 'waiting',
    createdAt: new Date('2024-12-13T09:20:00'),
    updatedAt: new Date('2024-12-13T09:20:00')
  },
  {
    userId: 'test-user-4',
    userEmail: 'customer4@example.com',
    userName: '최멋쟁',
    category: 'order',
    title: '주문 취소 문의',
    content: '방금 전에 실수로 같은 상품을 두 번 주문했습니다. 하나는 취소하고 싶은데 어떻게 해야 하나요? 아직 결제는 완료되지 않은 상태입니다.',
    status: 'answered',
    createdAt: new Date('2024-12-12T20:15:00'),
    updatedAt: new Date('2024-12-12T20:45:00'),
    answer: {
      content: '안녕하세요. 결제 완료 전이시라면 주문 내역에서 직접 취소가 가능합니다. 마이페이지 > 주문내역에서 해당 주문의 취소 버튼을 클릭해주세요. 이미 결제가 완료되었다면 고객센터로 연락 주시면 즉시 취소 처리해드리겠습니다.',
      answeredBy: '고객센터 이주임',
      answeredAt: new Date('2024-12-12T20:45:00')
    }
  }
];

async function seedInquiries() {
  try {
    console.log('문의 시드 데이터 추가 시작...');

    const batch = db.batch();
    const inquiriesRef = db.collection('inquiries');

    // 기존 문의 데이터 삭제
    const existingInquiries = await inquiriesRef.get();
    existingInquiries.forEach(doc => {
      batch.delete(doc.ref);
    });

    // 새로운 문의 데이터 추가
    seedInquiries.forEach(inquiry => {
      const docRef = inquiriesRef.doc();
      batch.set(docRef, {
        ...inquiry,
        createdAt: admin.firestore.Timestamp.fromDate(inquiry.createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(inquiry.updatedAt),
        answer: inquiry.answer ? {
          ...inquiry.answer,
          answeredAt: admin.firestore.Timestamp.fromDate(inquiry.answer.answeredAt)
        } : undefined
      });
    });

    await batch.commit();
    console.log(`✅ ${seedInquiries.length}개의 문의 데이터가 성공적으로 추가되었습니다.`);

    // 추가된 데이터 확인
    const addedInquiries = await inquiriesRef.get();
    console.log(`📊 총 ${addedInquiries.size}개의 문의가 데이터베이스에 있습니다.`);

    // 카테고리별 통계
    const categoryStats = {};
    addedInquiries.forEach(doc => {
      const data = doc.data();
      const category = data.category;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    console.log('\n📈 카테고리별 문의 통계:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}개`);
    });

  } catch (error) {
    console.error('❌ 문의 시드 데이터 추가 실패:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedInquiries()
    .then(() => {
      console.log('\n🎉 문의 시드 데이터 추가 완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { seedInquiries };
