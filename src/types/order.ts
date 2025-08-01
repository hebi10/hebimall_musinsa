import { Address } from './user';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

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
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'exchanged';

export type PaymentMethod = 
  | 'card'
  | 'bank_transfer'
  | 'virtual_account'
  | 'phone'
  | 'point';

export interface OrderHistory {
  orders: Order[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
