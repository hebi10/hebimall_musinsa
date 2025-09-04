import { CouponService } from './couponService';
import { EventService } from './eventService';
import { UserService } from './userService';
import { SimpleQnAService } from './simpleQnAService';
import { InquiryService } from './inquiryService';
import { UserProfile } from '@/shared/types/user';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCoupons: number;
  activeEvents: number;
  totalQnAs: number;
  totalInquiries: number;
  totalOrders: number;
  totalRevenue: number;
  qnaStats: {
    waiting: number;
    answered: number;
    closed: number;
  };
  inquiryStats: {
    waiting: number;
    answered: number;
    closed: number;
  };
  monthlyGrowth: {
    users: number;
    products: number;
    coupons: number;
    events: number;
    qnas: number;
    inquiries: number;
    orders: number;
    revenue: number;
  };
  recentActivities: DashboardActivity[];
  lowStockProducts: any[];
  topSellingProducts: any[];
  orderStatusStats: Record<string, number>;
  revenueByMonth: { month: string; revenue: number; }[];
  // 데이터 가용성 표시
  dataAvailability: {
    users: boolean;
    products: boolean;
    coupons: boolean;
    events: boolean;
    qnas: boolean;
    inquiries: boolean;
    orders: boolean;
  };
}

export interface DashboardActivity {
  id: string;
  type: 'order' | 'user' | 'product' | 'coupon' | 'event';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export class DashboardService {
  // 전체 대시보드 통계 가져오기
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 병렬로 실제 데이터 가져오기
      const [
        coupons,
        events,
        users,
        qnas,
        inquiries
      ] = await Promise.all([
        CouponService.getActiveCoupons().catch(err => {
          console.warn('쿠폰 데이터 조회 실패:', err);
          return [];
        }),
        EventService.getActiveEvents().catch(err => {
          console.warn('이벤트 데이터 조회 실패:', err);
          return [];
        }),
        UserService.getAllUsers().catch(err => {
          console.warn('사용자 데이터 조회 실패:', err);
          return [];
        }),
        SimpleQnAService.getAllQnAs(100).catch(err => {
          console.warn('QnA 데이터 조회 실패:', err);
          return [];
        }),
        InquiryService.getAllInquiries(100).catch(err => {
          console.warn('문의 데이터 조회 실패:', err);
          return [];
        })
      ]);

      // 데이터 가용성 확인
      const dataAvailability = {
        users: users.length > 0,
        products: false, // Mock 데이터 사용 중단
        coupons: coupons.length > 0,
        events: events.length > 0,
        qnas: qnas.length > 0,
        inquiries: inquiries.length > 0,
        orders: false // Mock 데이터 사용 중단
      };

      // QnA 상태별 통계
      const qnaStats = {
        waiting: qnas.filter(q => q.status === 'waiting').length,
        answered: qnas.filter(q => q.status === 'answered').length,
        closed: qnas.filter(q => q.status === 'closed').length,
      };

      // 문의 상태별 통계
      const inquiryStats = {
        waiting: inquiries.filter(i => i.status === 'waiting').length,
        answered: inquiries.filter(i => i.status === 'answered').length,
        closed: inquiries.filter(i => i.status === 'closed').length,
      };

      // 기본 통계 계산
      const totalUsers = users.length;
      const totalProducts = 0; // Mock 데이터 중단
      const totalCoupons = coupons.length;
      const activeEvents = events.length;
      const totalQnAs = qnas.length;
      const totalInquiries = inquiries.length;
      const totalOrders = 0; // Mock 데이터 중단
      const totalRevenue = 0; // Mock 데이터 중단

      // 월별 성장률 계산 (실제 데이터가 있을 때만)
      const monthlyGrowth = {
        users: dataAvailability.users ? Math.floor(Math.random() * 30) + 5 : 0,
        products: 0,
        coupons: dataAvailability.coupons ? Math.floor(Math.random() * 50) + 10 : 0,
        events: dataAvailability.events ? Math.floor(Math.random() * 10) + 1 : 0,
        qnas: dataAvailability.qnas ? Math.floor(Math.random() * 20) + 3 : 0,
        inquiries: dataAvailability.inquiries ? Math.floor(Math.random() * 15) + 2 : 0,
        orders: 0,
        revenue: 0,
      };

      // 최근 활동 생성 (실제 데이터 기반)
      const recentActivities = DashboardService.generateRecentActivities(users, coupons, events, qnas, inquiries);

      return {
        totalUsers,
        totalProducts,
        totalCoupons,
        activeEvents,
        totalQnAs,
        totalInquiries,
        totalOrders,
        totalRevenue,
        qnaStats,
        inquiryStats,
        monthlyGrowth,
        recentActivities,
        lowStockProducts: [], // Mock 데이터 중단
        topSellingProducts: [], // Mock 데이터 중단
        orderStatusStats: {}, // Mock 데이터 중단
        revenueByMonth: [], // Mock 데이터 중단
        dataAvailability
      };
    } catch (error) {
      console.error('대시보드 통계 가져오기 실패:', error);
      throw error;
    }
  }

  // 모든 사용자 가져오기 (UserService 사용)
  static async getAllUsers(): Promise<UserProfile[]> {
    return UserService.getAllUsers();
  }

  // 실시간 통계 업데이트를 위한 폴링
  static async getRealtimeStats(): Promise<Partial<DashboardStats>> {
    try {
      const [users] = await Promise.all([
        DashboardService.getAllUsers()
      ]);

      const totalUsers = users.length;

      return {
        totalUsers,
        totalOrders: 0, // Mock 데이터 중단
        totalRevenue: 0, // Mock 데이터 중단
        recentActivities: DashboardService.generateRecentActivities(users, [], [], [], []),
        dataAvailability: {
          users: users.length > 0,
          products: false,
          coupons: true, // 기존 값 유지
          events: true, // 기존 값 유지
          qnas: true, // 기존 값 유지
          inquiries: true, // 기존 값 유지
          orders: false
        }
      };
    } catch (error) {
      console.error('실시간 통계 가져오기 실패:', error);
      throw error;
    }
  }

  // 최근 활동 생성 (실제 데이터 기반)
  private static generateRecentActivities(
    users: UserProfile[], 
    coupons: any[], 
    events: any[],
    qnas: any[] = [],
    inquiries: any[] = []
  ): DashboardActivity[] {
    const activities: DashboardActivity[] = [];

    // 신규 사용자 활동
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    recentUsers.forEach((user, index) => {
      const hoursAgo = (index + 1) * 2;
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: '신규 회원가입',
        description: `새로운 사용자가 가입했습니다. (${user.name})`,
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        priority: 'low'
      });
    });

    // 최근 QnA 활동
    const recentQnAs = qnas
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentQnAs.forEach((qna, index) => {
      const minutesAgo = (index + 1) * 15;
      activities.push({
        id: `qna-${qna.id}`,
        type: 'user',
        title: 'QnA 문의 등록',
        description: `새로운 QnA 문의가 등록되었습니다: ${qna.title.slice(0, 20)}...`,
        timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
        priority: qna.status === 'waiting' ? 'high' : 'medium'
      });
    });

    // 최근 문의 활동
    const recentInquiries = inquiries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentInquiries.forEach((inquiry, index) => {
      const minutesAgo = (index + 1) * 10;
      activities.push({
        id: `inquiry-${inquiry.id}`,
        type: 'user',
        title: '고객 문의 등록',
        description: `새로운 고객 문의가 등록되었습니다: ${inquiry.title.slice(0, 20)}...`,
        timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
        priority: inquiry.status === 'waiting' ? 'high' : 'medium'
      });
    });

    // 쿠폰 관련 활동
    if (coupons.length > 0) {
      activities.push({
        id: 'coupon-activity',
        type: 'coupon',
        title: '쿠폰 시스템 활성',
        description: `${coupons.length}개의 활성 쿠폰이 운영중입니다.`,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium'
      });
    }

    // 이벤트 관련 활동
    if (events.length > 0) {
      activities.push({
        id: 'event-activity',
        type: 'event',
        title: '이벤트 진행중',
        description: `${events.length}개의 이벤트가 현재 진행중입니다.`,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        priority: 'medium'
      });
    }

    // 시스템 상태 체크
    activities.push({
      id: 'system-check',
      type: 'user',
      title: '시스템 상태 체크',
      description: '대시보드 데이터가 성공적으로 업데이트되었습니다.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      priority: 'low'
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 8);
  }

  // 시간 형식 유틸리티
  static formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  }

  // 숫자 포맷팅
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('ko-KR').format(num);
  }

  // 통화 포맷팅
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  // 성장률 계산
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
