const admin = require('firebase-admin');

// Mock events data
const mockEvents = [
  {
    id: 'event-1',
    title: '신규 회원 가입 이벤트',
    description: '첫 구매 시 20% 할인 쿠폰 증정!',
    content: `
      <h2>🎉 신규 회원 가입 이벤트</h2>
      <p>HEBIMALL에 오신 것을 환영합니다!</p>
      <p>신규 회원가입 후 첫 구매 시 <strong style="color: #ff6b6b;">20% 할인 쿠폰</strong>을 드립니다.</p>
      
      <h3>💎 이벤트 혜택</h3>
      <ul>
        <li>신규 회원 가입 시 즉시 20% 할인 쿠폰 지급</li>
        <li>첫 구매 시 무료배송</li>
        <li>적립금 1,000원 추가 지급</li>
        <li>생일 쿠폰 자동 발급</li>
      </ul>
      
      <h3>📋 참여 방법</h3>
      <ol>
        <li>HEBIMALL 회원가입</li>
        <li>이메일 인증 완료</li>
        <li>쿠폰 자동 지급 (마이페이지에서 확인)</li>
        <li>원하는 상품 구매 시 쿠폰 사용</li>
      </ol>
      
      <h3>⚠️ 주의사항</h3>
      <ul>
        <li>쿠폰 유효기간: 발급일로부터 30일</li>
        <li>최소 주문금액: 50,000원 이상</li>
        <li>다른 할인 혜택과 중복 사용 불가</li>
        <li>일부 브랜드 제외 상품 있음</li>
      </ul>
    `,
    bannerImage: '/images/events/signup-event.jpg',
    thumbnailImage: '/images/events/signup-thumb.jpg',
    eventType: 'coupon',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isActive: true,
    discountRate: 20,
    couponCode: 'WELCOME20',
    participantCount: 1245,
    maxParticipants: 5000,
    targetCategories: ['전체'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'event-2',
    title: '여름 시즌 특가 세일',
    description: '여름 신상품 최대 70% 할인!',
    content: `
      <h2>🌞 여름 시즌 특가 세일</h2>
      <p>뜨거운 여름을 시원하게! 여름 신상품을 <strong style="color: #4dabf7;">최대 70% 할인</strong>으로 만나보세요.</p>
      
      <div style="background: linear-gradient(135deg, #74b9ff, #0984e3); padding: 20px; border-radius: 10px; color: white; margin: 20px 0;">
        <h3>🏖️ 여름 필수 아이템</h3>
        <ul>
          <li>시원한 린넨 셔츠 - 최대 60% 할인</li>
          <li>편안한 반바지 - 최대 50% 할인</li>
          <li>수영복 & 비치웨어 - 최대 70% 할인</li>
          <li>샌들 & 슬리퍼 - 최대 40% 할인</li>
        </ul>
      </div>
      
      <h3>🎯 할인 혜택</h3>
      <ul>
        <li>3만원 이상 구매 시 무료배송</li>
        <li>5만원 이상 구매 시 추가 5% 할인</li>
        <li>10만원 이상 구매 시 여름 아이템 증정</li>
      </ul>
      
      <h3>📅 기간 한정</h3>
      <p><strong>2025년 7월 1일 ~ 9월 30일</strong>까지 진행되는 기간 한정 특가입니다.</p>
    `,
    bannerImage: '/images/events/summer-sale.jpg',
    thumbnailImage: '/images/events/summer-thumb.jpg',
    eventType: 'sale',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-09-30'),
    isActive: true,
    discountRate: 70,
    targetCategories: ['의류', '신발'],
    participantCount: 2892,
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-25')
  },
  {
    id: 'event-3',
    title: '리뷰 작성 이벤트',
    description: '리뷰 작성하고 적립금 받자!',
    content: `
      <h2>📝 리뷰 작성 이벤트</h2>
      <p>구매 후 리뷰 작성 시 <strong style="color: #51cf66;">1,000원 적립금</strong>을 드립니다!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #51cf66; margin: 20px 0;">
        <h3>💰 적립금 혜택</h3>
        <ul>
          <li>일반 리뷰: 1,000원 적립</li>
          <li>포토 리뷰: 2,000원 적립</li>
          <li>영상 리뷰: 3,000원 적립</li>
          <li>베스트 리뷰 선정 시: 추가 5,000원 적립</li>
        </ul>
      </div>
      
      <h3>✍️ 참여 방법</h3>
      <ol>
        <li>상품 구매 후 배송 완료</li>
        <li>마이페이지 > 주문내역에서 리뷰 작성</li>
        <li>상품 만족도 및 후기 작성</li>
        <li>적립금 자동 지급 (익일 지급)</li>
      </ol>
      
      <h3>📸 리뷰 작성 팁</h3>
      <ul>
        <li>실제 착용 사진 첨부 시 더 높은 적립금</li>
        <li>상품의 장단점을 솔직하게 작성</li>
        <li>사이즈, 색상, 소재감 등 상세 정보 포함</li>
      </ul>
    `,
    bannerImage: '/images/events/review-event.jpg',
    thumbnailImage: '/images/events/review-thumb.jpg',
    eventType: 'special',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-12-31'),
    isActive: true,
    discountAmount: 1000,
    participantCount: 4341,
    targetCategories: ['전체'],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  }
];

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'hebimall'
  });
}

const db = admin.firestore();

async function seedEvents() {
  try {
    console.log('🌱 Seeding events...');

    const batch = db.batch();
    const eventsCollection = db.collection('events');

    // 기존 이벤트 데이터 삭제
    const existingEvents = await eventsCollection.get();
    existingEvents.forEach(doc => {
      batch.delete(doc.ref);
    });

    // 새 이벤트 데이터 추가
    for (const event of mockEvents) {
      const { id, createdAt, updatedAt, startDate, endDate, ...eventData } = event;
      
      const docRef = eventsCollection.doc(id);
      batch.set(docRef, {
        ...eventData,
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        createdAt: admin.firestore.Timestamp.fromDate(createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(updatedAt),
      });
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${mockEvents.length} events`);

    // 각 이벤트의 정보 출력
    mockEvents.forEach(event => {
      console.log(`📅 ${event.title} (${event.eventType})`);
      console.log(`   기간: ${event.startDate.toLocaleDateString()} ~ ${event.endDate.toLocaleDateString()}`);
      console.log(`   상태: ${event.isActive ? '활성' : '비활성'}`);
      console.log(`   참여자: ${event.participantCount.toLocaleString()}명`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
}

async function main() {
  await seedEvents();
  console.log('🎉 Event seeding completed!');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { seedEvents };
