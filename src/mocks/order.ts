import { Order } from "../types/order";

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
    status: '배송완료',
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
];
