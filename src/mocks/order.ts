import { Order } from "../types/order";

// 관리자 페이지용 주문 데이터 인터페이스
export interface OrderData {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  items: number;
  amount: string;
  paymentMethod: string;
  date: string;
  status: string;
  statusText: string;
}

// 기존 Order 타입의 데이터
export const orders: Order[] = [
  {
    id: 'ORD-20241201-001',
    userId: 'USER001',
    orderNumber: 'ORD-20241201-001',
    products: [
      {
        id: 'OI001',
        productId: 'P001',
        productName: '오버핏 후드 스웨트셔츠',
        productImage: '/api/placeholder/80/80',
        size: 'L',
        color: 'Black',
        quantity: 1,
        price: 49000,
        discountAmount: 0,
        brand: '브랜드A',
      },
      {
        id: 'OI002',
        productId: 'P002',
        productName: '와이드 데님 팬츠',
        productImage: '/api/placeholder/80/80',
        size: '32',
        color: 'Indigo',
        quantity: 2,
        price: 124500,
        discountAmount: 0,
        brand: '브랜드A',
      }
    ],
    totalAmount: 298000,
    discountAmount: 0,
    deliveryFee: 0,
    finalAmount: 298000,
    status: 'delivered',
    paymentMethod: '카드결제',
    deliveryAddress: {
      id: 'ADDR001',
      name: '우리집',
      recipient: '홍길동',
      phone: '010-1234-5678',
      address: '서울특별시 강남구 테헤란로 123',
      detailAddress: '101동 202호',
      zipCode: '06123',
      isDefault: true
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'ORD-20241202-002',
    userId: 'USER002',
    orderNumber: 'ORD-20241202-002',
    products: [
      {
        id: 'OI003',
        productId: 'P003',
        productName: '니트 가디건',
        productImage: '/api/placeholder/80/80',
        size: 'M',
        color: 'Beige',
        quantity: 1,
        price: 89000,
        discountAmount: 10000,
        brand: '브랜드B',
      }
    ],
    totalAmount: 89000,
    discountAmount: 10000,
    deliveryFee: 3000,
    finalAmount: 82000,
    status: 'shipped',
    paymentMethod: '계좌이체',
    deliveryAddress: {
      id: 'ADDR002',
      name: '회사',
      recipient: '김영희',
      phone: '010-2345-6789',
      address: '서울특별시 서초구 서초대로 456',
      detailAddress: '5층 501호',
      zipCode: '06789',
      isDefault: false
    },
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: 'ORD-20241203-003',
    userId: 'USER003',
    orderNumber: 'ORD-20241203-003',
    products: [
      {
        id: 'OI004',
        productId: 'P004',
        productName: '스니커즈',
        productImage: '/api/placeholder/80/80',
        size: '270',
        color: 'White',
        quantity: 1,
        price: 159000,
        discountAmount: 0,
        brand: '브랜드C',
      },
      {
        id: 'OI005',
        productId: 'P005',
        productName: '양말 3족 세트',
        productImage: '/api/placeholder/80/80',
        size: 'Free',
        color: 'Multi',
        quantity: 1,
        price: 19000,
        discountAmount: 0,
        brand: '브랜드C',
      }
    ],
    totalAmount: 178000,
    discountAmount: 0,
    deliveryFee: 0,
    finalAmount: 178000,
    status: 'pending',
    paymentMethod: '카드결제',
    deliveryAddress: {
      id: 'ADDR003',
      name: '집',
      recipient: '박민수',
      phone: '010-3456-7890',
      address: '경기도 성남시 분당구 정자로 789',
      detailAddress: 'A동 1004호',
      zipCode: '13579',
      isDefault: true
    },
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: 'ORD-20241204-004',
    userId: 'USER004',
    orderNumber: 'ORD-20241204-004',
    products: [
      {
        id: 'OI006',
        productId: 'P006',
        productName: '트렌치 코트',
        productImage: '/api/placeholder/80/80',
        size: 'L',
        color: 'Navy',
        quantity: 1,
        price: 229000,
        discountAmount: 20000,
        brand: '브랜드D',
      }
    ],
    totalAmount: 229000,
    discountAmount: 20000,
    deliveryFee: 0,
    finalAmount: 209000,
    status: 'confirmed',
    paymentMethod: '무통장입금',
    deliveryAddress: {
      id: 'ADDR004',
      name: '학교',
      recipient: '이지은',
      phone: '010-4567-8901',
      address: '서울특별시 마포구 홍대로 321',
      detailAddress: '2층 201호',
      zipCode: '04123',
      isDefault: false
    },
    createdAt: new Date('2024-12-04'),
    updatedAt: new Date('2024-12-04')
  },
  {
    id: 'ORD-20241205-005',
    userId: 'USER005',
    orderNumber: 'ORD-20241205-005',
    products: [
      {
        id: 'OI007',
        productId: 'P007',
        productName: '청바지',
        productImage: '/api/placeholder/80/80',
        size: '30',
        color: 'Dark Blue',
        quantity: 2,
        price: 158000,
        discountAmount: 15000,
        brand: '브랜드E',
      },
      {
        id: 'OI008',
        productId: 'P008',
        productName: '기본 티셔츠',
        productImage: '/api/placeholder/80/80',
        size: 'M',
        color: 'Black',
        quantity: 3,
        price: 89700,
        discountAmount: 0,
        brand: '브랜드E',
      }
    ],
    totalAmount: 247700,
    discountAmount: 15000,
    deliveryFee: 3000,
    finalAmount: 235700,
    status: 'cancelled',
    paymentMethod: '카드결제',
    deliveryAddress: {
      id: 'ADDR005',
      name: '본가',
      recipient: '최철수',
      phone: '010-5678-9012',
      address: '부산광역시 해운대구 해운대로 654',
      detailAddress: '15층 1502호',
      zipCode: '48123',
      isDefault: true
    },
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05')
  }
];

// 관리자 페이지에서 사용할 변환된 주문 데이터
export const adminOrders: OrderData[] = orders.map(order => ({
  id: order.id,
  orderNumber: order.orderNumber,
  customer: order.deliveryAddress.recipient,
  email: `user${order.userId.slice(-3)}@example.com`, // 임시 이메일
  items: order.products.reduce((sum, product) => sum + product.quantity, 0),
  amount: `${order.finalAmount.toLocaleString()}원`,
  paymentMethod: order.paymentMethod,
  date: order.createdAt.toLocaleDateString('ko-KR'),
  status: order.status as string,
  statusText: getStatusText(order.status as string)
}));

function getStatusText(status: string): string {
  switch (status) {
    case "pending": return "결제 대기";
    case "confirmed": return "주문 확인";
    case "shipped": return "배송 중";
    case "delivered": return "배송 완료";
    case "cancelled": return "주문 취소";
    default: return status;
  }
}
