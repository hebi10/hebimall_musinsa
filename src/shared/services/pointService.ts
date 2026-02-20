// 포인트 관리 서비스

import { doc, getDoc, collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/shared/libs/firebase/firebase';
import { 
  AddPointRequest, 
  UsePointRequest, 
  RefundPointRequest,
  PointResponse,
  PointHistoryResponse,
  PointBalanceResponse,
  PointHistory
} from '@/shared/types/point';

/** Firebase Auth ID 토큰을 가져오는 헬퍼 */
async function getIdToken(): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  return user.getIdToken();
}

/** 통합 Points API 호출 헬퍼 */
async function callPointsAPI(action: string, data?: Record<string, any>): Promise<any> {
  const token = await getIdToken();
  const res = await fetch('/api/points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...data }),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || '요청에 실패했습니다.');
  }

  return json.data;
}

export class PointService {
  /**
   * 포인트 적립
   */
  static async addPoint(data: AddPointRequest): Promise<PointResponse> {
    try {
      console.log('포인트 적립 요청:', data);
      const result = await callPointsAPI('add', data);
      console.log('포인트 적립 결과:', result);
      return { success: true, newBalance: result.newBalance };
    } catch (error: any) {
      console.error('포인트 적립 실패:', error);
      throw new Error(error.message || '포인트 적립에 실패했습니다.');
    }
  }

  /**
   * 포인트 사용
   */
  static async usePoint(data: UsePointRequest): Promise<PointResponse> {
    try {
      console.log('포인트 사용 요청:', data);
      const result = await callPointsAPI('use', data);
      console.log('포인트 사용 결과:', result);
      return { success: true, newBalance: result.newBalance, usedAmount: result.usedAmount };
    } catch (error: any) {
      console.error('포인트 사용 실패:', error);
      throw new Error(error.message || '포인트 사용에 실패했습니다.');
    }
  }

  /**
   * 포인트 환불
   */
  static async refundPoint(data: RefundPointRequest): Promise<PointResponse> {
    try {
      console.log('포인트 환불 요청:', data);
      const result = await callPointsAPI('refund', data);
      console.log('포인트 환불 결과:', result);
      return { success: true, newBalance: result.newBalance, refundedAmount: result.refundedAmount };
    } catch (error: any) {
      console.error('포인트 환불 실패:', error);
      throw new Error(error.message || '포인트 환불에 실패했습니다.');
    }
  }

  /**
   * 포인트 내역 조회 (클라이언트에서 직접 Firestore 읽기)
   */
  static async getPointHistory(userId: string, limitCount: number = 50, lastDoc?: any): Promise<PointHistoryResponse> {
    try {
      let q = query(
        collection(db, 'users', userId, 'pointHistory'),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PointHistory[];

      return {
        success: true,
        history,
        hasMore: snapshot.docs.length === limitCount,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
      };
    } catch (error: any) {
      console.error('포인트 내역 조회 실패:', error);
      throw new Error(error.message || '포인트 내역 조회에 실패했습니다.');
    }
  }

  /**
   * 포인트 잔액 조회 (클라이언트에서 직접 Firestore 읽기)
   */
  static async getPointBalance(userId: string): Promise<PointBalanceResponse> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();
      const pointBalance = userData?.pointBalance || 0;

      return {
        success: true,
        pointBalance
      };
    } catch (error: any) {
      console.error('포인트 잔액 조회 실패:', error);
      throw new Error(error.message || '포인트 잔액 조회에 실패했습니다.');
    }
  }

  /**
   * 회원가입 포인트 적립 (5,000포인트)
   */
  static async addSignupPoint(): Promise<PointResponse> {
    return this.addPoint({
      amount: 5000,
      description: '신규 회원가입 적립'
    });
  }

  /**
   * 주문 완료 포인트 적립 (주문 금액의 1%)
   */
  static async addOrderPoint(orderAmount: number, orderId: string): Promise<PointResponse> {
    const pointAmount = Math.floor(orderAmount * 0.01);
    return this.addPoint({
      amount: pointAmount,
      description: `주문 완료 적립 (주문 금액: ${orderAmount.toLocaleString()}원)`,
      orderId
    });
  }

  /**
   * 리뷰 작성 포인트 적립 (500포인트)
   */
  static async addReviewPoint(productName: string, orderId: string): Promise<PointResponse> {
    return this.addPoint({
      amount: 500,
      description: `리뷰 작성 적립 (상품: ${productName})`,
      orderId
    });
  }

  /**
   * 생일 축하 포인트 적립 (3,000포인트)
   */
  static async addBirthdayPoint(): Promise<PointResponse> {
    return this.addPoint({
      amount: 3000,
      description: '생일 축하 포인트'
    });
  }
}

export default PointService;
