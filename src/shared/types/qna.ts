export interface QnA {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: 'product' | 'size' | 'delivery' | 'return' | 'payment' | 'general' | 'other';
  title: string;
  content: string;
  images?: string[];
  isSecret: boolean; // 비밀글 여부
  password?: string; // 비밀글 비밀번호
  status: 'waiting' | 'answered' | 'closed';
  views: number;
  isNotified: boolean; // 답변 알림 받기
  createdAt: Date;
  updatedAt: Date;
  productId?: string; // 상품 관련 문의일 경우
  productName?: string;
  answer?: {
    content: string;
    answeredBy: string;
    answeredAt: Date;
    isAdmin: boolean;
  };
}

export interface CreateQnAData {
  category: QnA['category'];
  title: string;
  content: string;
  images?: string[];
  isSecret: boolean;
  password?: string;
  isNotified: boolean;
  productId?: string;
  productName?: string;
}

export interface QnAAnswer {
  content: string;
  answeredBy: string;
  answeredAt: Date;
  isAdmin: boolean;
}

export interface QnAFilter {
  category?: QnA['category'];
  status?: QnA['status'];
  isSecret?: boolean;
  userId?: string;
  productId?: string;
  searchTerm?: string;
}

export interface QnAPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}
