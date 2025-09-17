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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { Order, OrderStatus } from '@/shared/types/order';

export class OrderService {
  private static readonly COLLECTION_NAME = 'orders';

  /**
   * 주문 생성
   */
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const order = {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), order);
      console.log('주문 생성 완료:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('주문 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 상세 조회
   */
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        return {
          id: orderSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Order;
      }

      return null;
    } catch (error) {
      console.error('주문 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자의 주문 목록 조회
   */
  static async getUserOrders(userId: string, limitCount: number = 20): Promise<Order[]> {
    try {
      console.log('🔍 OrderService.getUserOrders called with:', { userId, limitCount });
      
      const ordersRef = collection(db, this.COLLECTION_NAME);
      
      // 먼저 단순 쿼리로 시도 (인덱스 불필요)
      try {
        console.log('📋 Executing simple query without orderBy...');
        const simpleQ = query(
          ordersRef,
          where('userId', '==', userId),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(simpleQ);
        console.log('✅ Simple query executed successfully, found', querySnapshot.size, 'documents');
        
        const orders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📦 Processing order document:', doc.id, data);
          
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Order;
        });
        
        // 클라이언트 사이드에서 생성일 기준으로 내림차순 정렬
        orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        console.log('✅ Orders processed and sorted successfully:', orders.length);
        return orders;
        
      } catch (simpleError: any) {
        console.error('❌ Simple query also failed:', simpleError.message);
        throw simpleError;
      }
      
    } catch (error: any) {
      console.error('❌ getUserOrders 완전 실패:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // 사용자 친화적인 에러 메시지
      let userMessage = '주문 목록을 불러오는데 실패했습니다.';
      if (error.message?.includes('index')) {
        userMessage = '시스템 준비 중입니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message?.includes('permission')) {
        userMessage = '접근 권한이 없습니다. 로그인을 확인해주세요.';
      }
      
      throw new Error(userMessage);
    }
  }

  /**
   * 모든 주문 목록 조회 (관리자용)
   */
  static async getAllOrders(limitCount: number = 50): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        ordersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Order;
      });
    } catch (error) {
      console.error('전체 주문 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 상태별 조회
   */
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
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Order;
      });
    } catch (error) {
      console.error('상태별 주문 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 상태 업데이트
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });

      console.log(`주문 상태 업데이트 완료: ${orderId} -> ${status}`);
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 번호로 주문 조회
   */
  static async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(ordersRef, where('orderNumber', '==', orderNumber));
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Order;
    } catch (error) {
      console.error('주문번호로 주문 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 통계 조회
   */
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
      const orders = await this.getAllOrders(1000); // 최대 1000개 주문으로 통계 계산
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalAmount: orders.reduce((sum, order) => sum + order.finalAmount, 0)
      };

      return stats;
    } catch (error) {
      console.error('주문 통계 조회 실패:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalAmount: 0
      };
    }
  }

  /**
   * 최근 주문 조회 (대시보드용)
   */
  static async getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        ordersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Order;
      });
    } catch (error) {
      console.error('최근 주문 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 주문 취소
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      const updateData: any = {
        status: 'cancelled' as OrderStatus,
        updatedAt: serverTimestamp()
      };

      if (reason) {
        updateData.cancelReason = reason;
        updateData.cancelledAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);
      console.log(`주문 취소 완료: ${orderId}`);
    } catch (error) {
      console.error('주문 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 배송 정보 업데이트
   */
  static async updateDeliveryInfo(orderId: string, deliveryInfo: {
    trackingNumber?: string;
    deliveryCompany?: string;
    estimatedDeliveryDate?: Date;
  }): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId);
      await updateDoc(orderRef, {
        ...deliveryInfo,
        updatedAt: serverTimestamp()
      });

      console.log(`배송 정보 업데이트 완료: ${orderId}`);
    } catch (error) {
      console.error('배송 정보 업데이트 실패:', error);
      throw error;
    }
  }
}
