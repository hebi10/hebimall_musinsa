import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Order, OrderStatus } from '@/shared/types/order';

export class OrderService {
  private static readonly COLLECTION_NAME = 'orders';

  private static normalizeDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
    }

    return new Date();
  }

  private static normalizeOrder(orderId: string, data: Record<string, any>): Order {
    const shippingAddress = data.shippingAddress || data.deliveryAddress;

    return {
      id: orderId,
      ...data,
      shippingAddress,
      deliveryAddress: data.deliveryAddress || shippingAddress,
      createdAt: this.normalizeDate(data.createdAt),
      updatedAt: this.normalizeDate(data.updatedAt),
      estimatedDeliveryDate: data.estimatedDeliveryDate
        ? this.normalizeDate(data.estimatedDeliveryDate)
        : undefined,
      cancelledAt: data.cancelledAt ? this.normalizeDate(data.cancelledAt) : undefined,
    } as Order;
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const shippingAddress = orderData.shippingAddress || orderData.deliveryAddress;
      const order = {
        ...orderData,
        shippingAddress,
        deliveryAddress: orderData.deliveryAddress || shippingAddress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), order);
      console.log('Order created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        return null;
      }

      return this.normalizeOrder(orderSnap.id, orderSnap.data());
    } catch (error) {
      console.error('Failed to load order:', error);
      throw error;
    }
  }

  static async getUserOrders(userId: string, limitCount: number = 20): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const simpleQuery = query(ordersRef, where('userId', '==', userId), limit(limitCount));
      const querySnapshot = await getDocs(simpleQuery);

      return querySnapshot.docs
        .map((orderDoc) => this.normalizeOrder(orderDoc.id, orderDoc.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error: any) {
      console.error('Failed to load user orders:', error);

      let userMessage = '주문 목록을 불러오지 못했습니다.';
      if (error.message?.includes('index')) {
        userMessage = '인덱스를 준비 중입니다. 잠시 후 다시 시도해 주세요.';
      } else if (error.message?.includes('permission')) {
        userMessage = '접근 권한이 없습니다. 로그인 상태를 확인해 주세요.';
      }

      throw new Error(userMessage);
    }
  }

  static async getAllOrders(limitCount: number = 50): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((orderDoc) => this.normalizeOrder(orderDoc.id, orderDoc.data()));
    } catch (error) {
      console.error('Failed to load all orders:', error);
      throw error;
    }
  }

  static async getOrdersByStatus(status: OrderStatus, limitCount: number = 20): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        ordersRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((orderDoc) => this.normalizeOrder(orderDoc.id, orderDoc.data()));
    } catch (error) {
      console.error('Failed to load orders by status:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  static async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(ordersRef, where('orderNumber', '==', orderNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const orderDoc = querySnapshot.docs[0];
      return this.normalizeOrder(orderDoc.id, orderDoc.data());
    } catch (error) {
      console.error('Failed to load order by orderNumber:', error);
      throw error;
    }
  }

  static async getOrderStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalAmount: number;
  }> {
    try {
      const orders = await this.getAllOrders(1000);

      return {
        total: orders.length,
        pending: orders.filter((order) => order.status === 'pending').length,
        confirmed: orders.filter((order) => order.status === 'confirmed').length,
        shipped: orders.filter((order) => order.status === 'shipped').length,
        delivered: orders.filter((order) => order.status === 'delivered').length,
        cancelled: orders.filter((order) => order.status === 'cancelled').length,
        totalAmount: orders.reduce((sum, order) => sum + order.finalAmount, 0),
      };
    } catch (error) {
      console.error('Failed to load order stats:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalAmount: 0,
      };
    }
  }

  static async getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((orderDoc) => this.normalizeOrder(orderDoc.id, orderDoc.data()));
    } catch (error) {
      console.error('Failed to load recent orders:', error);
      throw error;
    }
  }

  static async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      const updateData: Record<string, any> = {
        status: 'cancelled' as OrderStatus,
        updatedAt: serverTimestamp(),
      };

      if (reason) {
        updateData.cancelReason = reason;
        updateData.cancelledAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  static async updateDeliveryInfo(
    orderId: string,
    deliveryInfo: {
      trackingNumber?: string;
      deliveryCompany?: string;
      estimatedDeliveryDate?: Date;
    }
  ): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      await updateDoc(orderRef, {
        ...deliveryInfo,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to update delivery info:', error);
      throw error;
    }
  }
}
