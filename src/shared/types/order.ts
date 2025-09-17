import { Address } from './user';

export type OrderStatus = 
  | '배송완료'
  | '배송중'
  | '주문확인'
  | '취소'
  | '교환'
  | '반품'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'exchanged';

export type PaymentMethod = 
  | '카드결제'
  | '계좌이체'
  | '무통장입금'
  | '기타'
  | 'card'
  | 'bank_transfer'
  | 'virtual_account'
  | 'phone'
  | 'point';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  discountAmount: number;
  brand: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  products: OrderItem[];
  totalAmount?: number;
  discountAmount?: number;
  deliveryFee?: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  shippingAddress?: Address;  // deliveryAddress 대신 shippingAddress 사용
  paymentInfo?: any;  // 결제 정보 (선택적)
  createdAt: Date;
  updatedAt: Date;
  
  // 추가 필드들 (선택적)
  trackingNumber?: string;
  deliveryCompany?: string;
  estimatedDeliveryDate?: Date;
  cancelReason?: string;
  cancelledAt?: Date;
}

export interface OrderHistory {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
