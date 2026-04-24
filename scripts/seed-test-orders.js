const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "hebimall-84b36",
      clientEmail: "firebase-adminsdk-krhx9@hebimall-84b36.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCcUfQzaVIWkJt\n8UOqXJC+RGXO+L3WPQR8mMeVGX2TJhWg7W5NPJaKGVQH1xqJ9F9xOo3k2k2Q8H2m\nl6L7C3xJKQVJ0JQGGl3g3F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K5K4x7F2z1Q5Q8l2x3W3x5F9xQz7x5g2K\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// 테스트 사용자 UID (실제 사용자 ID로 교체 필요)
const TEST_USER_ID = 'test-user-001';

// 테스트 주문 데이터
const testOrders = [
  {
    userId: TEST_USER_ID,
    orderNumber: 'HB2024-001',
    products: [
      {
        id: 'product-001',
        productId: 'tshirt-001',
        productName: '베이직 티셔츠',
        productImage: '/tshirt-1.jpg', // public 폴더의 실제 이미지
        size: 'M',
        color: '화이트',
        quantity: 2,
        price: 29000,
        discountAmount: 0,
        brand: 'Hebimall'
      },
      {
        id: 'product-002',
        productId: 'shirt-001',
        productName: '셔츠',
        productImage: '/shirt-2.jpg', // public 폴더의 실제 이미지
        size: 'L',
        color: '블루',
        quantity: 1,
        price: 45000,
        discountAmount: 5000,
        brand: 'Premium'
      }
    ],
    totalAmount: 103000,
    discountAmount: 5000,
    deliveryFee: 2500,
    finalAmount: 100500,
    status: 'confirmed',
    paymentMethod: '카드결제',
    shippingAddress: {
      id: 'addr-001',
      name: '기본 주소',
      recipient: '홍길동',
      phone: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      detailAddress: '456호',
      zipCode: '12345',
      isDefault: true
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    userId: TEST_USER_ID,
    orderNumber: 'HB2024-002',
    products: [
      {
        id: 'product-003',
        productId: 'casual-001',
        productName: '캐주얼 상의',
        productImage: '/product-placeholder.jpg', // 기본 플레이스홀더 이미지
        size: 'L',
        color: '네이비',
        quantity: 1,
        price: 65000,
        discountAmount: 10000,
        brand: 'Style'
      }
    ],
    totalAmount: 65000,
    discountAmount: 10000,
    deliveryFee: 0,
    finalAmount: 55000,
    status: 'shipped',
    paymentMethod: '계좌이체',
    trackingNumber: '1234567890',
    deliveryCompany: 'CJ대한통운',
    shippingAddress: {
      id: 'addr-001',
      name: '기본 주소',
      recipient: '홍길동',
      phone: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      detailAddress: '456호',
      zipCode: '12345',
      isDefault: true
    },
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 하루 전
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    userId: TEST_USER_ID,
    orderNumber: 'HB2024-003',
    products: [
      {
        id: 'product-004',
        productId: 'test-001',
        productName: '테스트 상품',
        productImage: '', // 빈 이미지 URL로 테스트
        size: 'M',
        color: '블랙',
        quantity: 1,
        price: 30000,
        discountAmount: 0,
        brand: 'Test'
      }
    ],
    totalAmount: 30000,
    discountAmount: 0,
    deliveryFee: 2500,
    finalAmount: 32500,
    status: 'delivered',
    paymentMethod: '카드결제',
    shippingAddress: {
      id: 'addr-001',
      name: '기본 주소',
      recipient: '홍길동',
      phone: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      detailAddress: '456호',
      zipCode: '12345',
      isDefault: true
    },
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 일주일 전
    updatedAt: admin.firestore.Timestamp.now()
  }
];

async function createTestOrders() {
  try {
    console.log('🔥 테스트 주문 데이터 생성 시작...');
    
    const ordersRef = db.collection('orders');
    
    // 기존 테스트 주문 삭제 (있다면)
    const existingOrders = await ordersRef.where('userId', '==', TEST_USER_ID).get();
    if (!existingOrders.empty) {
      console.log(`🗑️  기존 테스트 주문 ${existingOrders.size}개 삭제 중...`);
      const batch = db.batch();
      existingOrders.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
    
    // 새 테스트 주문 생성
    for (let i = 0; i < testOrders.length; i++) {
      const orderData = testOrders[i];
      const docRef = await ordersRef.add(orderData);
      console.log(`✅ 테스트 주문 생성: ${orderData.orderNumber} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 테스트 주문 데이터 생성 완료!');
    console.log(`총 ${testOrders.length}개의 주문이 생성되었습니다.`);
    console.log(`👤 사용자 ID: ${TEST_USER_ID}`);
    console.log('📝 생성된 주문:');
    testOrders.forEach(order => {
      console.log(`   - ${order.orderNumber}: ${order.products.map(p => p.productName).join(', ')} (${order.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 테스트 주문 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  console.log('🚀 테스트 주문 생성 스크립트 시작');
  createTestOrders();
}

module.exports = { createTestOrders };