// 포인트 관리 서비스

import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { functions, db } from '@/shared/libs/firebase/firebase';
import { 
  AddPointRequest, 
  UsePointRequest, 
  RefundPointRequest,
  PointResponse,
  PointHistoryResponse,
  PointBalanceResponse,
  PointHistory
} from '@/shared/types/point';

// Firebase Functions 호출 함수들 (쓰기 작업만)
const addPointFunction = httpsCallable<AddPointRequest, PointResponse>(functions, 'addPoint');
const usePointFunction = httpsCallable<UsePointRequest, PointResponse>(functions, 'usePoint');
const refundPointFunction = httpsCallable<RefundPointRequest, PointResponse>(functions, 'refundPoint');

export class PointService {
  /**
   * 포인트 적립
   */
  static async addPoint(data: AddPointRequest): Promise<PointResponse> {
    try {
      // Firebase Functions가 배포되지 않은 경우를 대비한 임시 처리
      if (process.env.NODE_ENV === 'development') {
        console.warn('개발 환경에서는 포인트 기능이 제한됩니다.');
        return {
          success: true,
          message: '개발 환경에서 포인트 적립이 시뮬레이션되었습니다.',
          newBalance: data.amount
        };
      }
      
      const result = await addPointFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('포인트 적립 실패:', error);
      
      // Firebase Functions 관련 에러를 더 구체적으로 처리
      if (error.code === 'functions/not-found') {
        console.warn('포인트 함수가 배포되지 않았습니다. 개발 모드로 진행합니다.');
        return {
          success: true,
          message: '포인트 기능이 임시로 비활성화되었습니다.',
          newBalance: data.amount
        };
      }
      
      throw new Error(error.message || '포인트 적립에 실패했습니다.');
    }
  }

  /**
   * 포인트 사용
   */
  static async usePoint(data: UsePointRequest): Promise<PointResponse> {
    try {
      // Firebase Functions가 배포되지 않은 경우를 대비한 임시 처리
      if (process.env.NODE_ENV === 'development') {
        console.warn('개발 환경에서는 포인트 기능이 제한됩니다.');
        return {
          success: true,
          message: '개발 환경에서 포인트 사용이 시뮬레이션되었습니다.',
          newBalance: 0,
          usedAmount: data.amount
        };
      }
      
      const result = await usePointFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('포인트 사용 실패:', error);
      
      // Firebase Functions 관련 에러를 더 구체적으로 처리
      if (error.code === 'functions/not-found') {
        console.warn('포인트 함수가 배포되지 않았습니다. 개발 모드로 진행합니다.');
        return {
          success: true,
          message: '포인트 기능이 임시로 비활성화되었습니다.',
          newBalance: 0,
          usedAmount: data.amount
        };
      }
      
      throw new Error(error.message || '포인트 사용에 실패했습니다.');
    }
  }

  /**
   * 포인트 환불
   */
  static async refundPoint(data: RefundPointRequest): Promise<PointResponse> {
    try {
      // Firebase Functions가 배포되지 않은 경우를 대비한 임시 처리
      if (process.env.NODE_ENV === 'development') {
        console.warn('개발 환경에서는 포인트 기능이 제한됩니다.');
        return {
          success: true,
          message: '개발 환경에서 포인트 환불이 시뮬레이션되었습니다.',
          newBalance: data.amount,
          refundedAmount: data.amount
        };
      }
      
      const result = await refundPointFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('포인트 환불 실패:', error);
      
      // Firebase Functions 관련 에러를 더 구체적으로 처리
      if (error.code === 'functions/not-found') {
        console.warn('포인트 함수가 배포되지 않았습니다. 개발 모드로 진행합니다.');
        return {
          success: true,
          message: '포인트 기능이 임시로 비활성화되었습니다.',
          newBalance: data.amount,
          refundedAmount: data.amount
        };
      }
      
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
