// 포인트 관련 타입 정의

export type PointType = 'earn' | 'use' | 'expire' | 'refund';

export interface PointHistory {
  id: string;
  type: PointType;
  amount: number;
  description: string;
  date: Date | any; // Firestore Timestamp
  orderId?: string;
  balanceAfter: number;
  expired?: boolean;
}

export interface PointBalance {
  pointBalance: number;
}

export interface AddPointRequest {
  amount: number;
  description: string;
  orderId?: string;
}

export interface UsePointRequest {
  amount: number;
  description: string;
  orderId: string;
}

export interface RefundPointRequest {
  amount: number;
  description: string;
  orderId: string;
}

export interface PointResponse {
  success: boolean;
  newBalance?: number;
  usedAmount?: number;
  refundedAmount?: number;
  message?: string;
}

export interface PointHistoryResponse {
  success: boolean;
  history: PointHistory[];
  hasMore: boolean;
  lastDoc: any;
}

export interface PointBalanceResponse {
  success: boolean;
  pointBalance: number;
}
