// 포인트 관리 서비스

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '@/shared/libs/firebase/firebase';
import { 
  AddPointRequest, 
  UsePointRequest, 
  RefundPointRequest,
  PointResponse,
  PointHistoryResponse,
  PointBalanceResponse 
} from '@/shared/types/point';

// Firebase Functions 초기화
const functions = getFunctions(app);

// Firebase Functions 호출 함수들
const addPointFunction = httpsCallable<AddPointRequest, PointResponse>(functions, 'addPoint');
const usePointFunction = httpsCallable<UsePointRequest, PointResponse>(functions, 'usePoint');
const refundPointFunction = httpsCallable<RefundPointRequest, PointResponse>(functions, 'refundPoint');
const getPointHistoryFunction = httpsCallable<any, PointHistoryResponse>(functions, 'getPointHistory');
const getPointBalanceFunction = httpsCallable<any, PointBalanceResponse>(functions, 'getPointBalance');

export class PointService {
  /**
   * 포인트 적립
   */
  static async addPoint(data: AddPointRequest): Promise<PointResponse> {
    try {
      const result = await addPointFunction(data);
      return result.data;
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
      const result = await usePointFunction(data);
      return result.data;
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
      const result = await refundPointFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('포인트 환불 실패:', error);
      throw new Error(error.message || '포인트 환불에 실패했습니다.');
    }
  }

  /**
   * 포인트 내역 조회
   */
  static async getPointHistory(limit: number = 50, lastDoc?: any): Promise<PointHistoryResponse> {
    try {
      const result = await getPointHistoryFunction({ limit, lastDoc });
      return result.data;
    } catch (error: any) {
      console.error('포인트 내역 조회 실패:', error);
      throw new Error(error.message || '포인트 내역 조회에 실패했습니다.');
    }
  }

  /**
   * 포인트 잔액 조회
   */
  static async getPointBalance(): Promise<PointBalanceResponse> {
    try {
      const result = await getPointBalanceFunction({});
      return result.data;
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
