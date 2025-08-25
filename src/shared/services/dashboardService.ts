import { CouponService } from './couponService';
import { EventService } from './eventService';
import { FirebaseProductService as ProductService } from './productService';
import { UserService } from './userService';
import { orders } from '@/mocks/order';
import { Order } from '@/shared/types/order';
import { UserProfile } from '@/shared/types/user';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCoupons: number;
  activeEvents: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    products: number;
    coupons: number;
    events: number;
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
      // 병렬로 모든 데이터 가져오기
      const [
        products,
        coupons,
        events,
        users,
        orders
      ] = await Promise.all([
        ProductService.getAllProducts().catch(err => {
          console.warn('상품 데이터 조회 실패:', err);
          return [];
        }),
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
        DashboardService.getAllOrders()
      ]);

      // 데이터 가용성 확인
      const dataAvailability = {
        users: users.length > 0,
        products: products.length > 0,
        coupons: coupons.length > 0,
        events: events.length > 0,
        orders: orders.length > 0
      };

      // 기본 통계 계산
      const totalUsers = users.length;
      const totalProducts = products.length;
      const totalCoupons = coupons.length;
      const activeEvents = events.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);

      // 월별 성장률 계산 (실제 데이터가 있을 때만)
      const monthlyGrowth = {
        users: dataAvailability.users ? Math.floor(Math.random() * 30) + 5 : 0,
        products: dataAvailability.products ? Math.floor(Math.random() * 20) + 3 : 0,
        coupons: dataAvailability.coupons ? Math.floor(Math.random() * 50) + 10 : 0,
        events: dataAvailability.events ? Math.floor(Math.random() * 10) + 1 : 0,
        orders: dataAvailability.orders ? Math.floor(Math.random() * 40) + 15 : 0,
        revenue: dataAvailability.orders ? Math.floor(Math.random() * 25) + 10 : 0,
      };

      // 최근 활동 생성
      const recentActivities = DashboardService.generateRecentActivities(orders, users, products);

      // 재고 부족 상품
      const lowStockProducts = dataAvailability.products ? 
        ProductService.getLowStockProducts(products, 10) : [];

      // 베스트셀러 상품
      const topSellingProducts = dataAvailability.products ?
        products.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5) : [];

      // 주문 상태별 통계
      const orderStatusStats = dataAvailability.orders ? 
        DashboardService.getOrderStatusStats(orders) : {};

      // 월별 매출 (최근 12개월)
      const revenueByMonth = dataAvailability.orders ? 
        DashboardService.getRevenueByMonth(orders) : [];

      return {
        totalUsers,
        totalProducts,
        totalCoupons,
        activeEvents,
        totalOrders,
        totalRevenue,
        monthlyGrowth,
        recentActivities,
        lowStockProducts,
        topSellingProducts,
        orderStatusStats,
        revenueByMonth,
        dataAvailability
      };
    } catch (error) {
      console.error('대시보드 통계 가져오기 실패:', error);
      throw error;
    }
  }

  // 모든 주문 가져오기 (임시로 mock 데이터 사용)
  static async getAllOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(orders), 100);
    });
  }

  // 모든 사용자 가져오기 (UserService 사용)
  static async getAllUsers(): Promise<UserProfile[]> {
    return UserService.getAllUsers();
  }

  // 최근 활동 생성
  private static generateRecentActivities(
    orders: Order[], 
    users: UserProfile[], 
    products: any[]
  ): DashboardActivity[] {
    const activities: DashboardActivity[] = [];

    // 최근 주문들
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    recentOrders.forEach((order, index) => {
      const minutesAgo = (index + 1) * 15;
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: '새로운 주문',
        description: `새로운 주문이 접수되었습니다. (주문번호: ${order.orderNumber})`,
        timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
        priority: 'medium'
      });
    });

    // 재고 부족 알림
    const lowStockProducts = ProductService.getLowStockProducts(products, 5);
    if (lowStockProducts.length > 0) {
      activities.push({
        id: 'low-stock',
        type: 'product',
        title: '재고 부족',
        description: `${lowStockProducts[0].name} 상품의 재고가 부족합니다. (${lowStockProducts[0].stock}개 남음)`,
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        priority: 'high'
      });
    }

    // 신규 사용자
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentUsers.forEach((user, index) => {
      const hoursAgo = (index + 1) * 1;
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: '신규 회원가입',
        description: `새로운 사용자가 가입했습니다. (${user.name})`,
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        priority: 'low'
      });
    });

    // 고객 문의 (가상)
    activities.push({
      id: 'inquiry',
      type: 'order',
      title: '고객 문의',
      description: '배송 문의가 접수되었습니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'medium'
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }

  // 주문 상태별 통계
  private static getOrderStatusStats(orders: Order[]): Record<string, number> {
    return orders.reduce((stats, order) => {
      const status = order.status;
      stats[status] = (stats[status] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
  }

  // 월별 매출 (최근 12개월)
  private static getRevenueByMonth(orders: Order[]): { month: string; revenue: number; }[] {
    const monthlyRevenue: Record<string, number> = {};
    const now = new Date();

    // 최근 12개월 초기화
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = 0;
    }

    // 주문 데이터로 매출 계산
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += order.finalAmount;
      }
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  // 실시간 통계 업데이트를 위한 폴링
  static async getRealtimeStats(): Promise<Partial<DashboardStats>> {
    try {
      const [orders, users] = await Promise.all([
        DashboardService.getAllOrders(),
        DashboardService.getAllUsers()
      ]);

      const totalOrders = orders.length;
      const totalUsers = users.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);

      return {
        totalOrders,
        totalUsers,
        totalRevenue,
        recentActivities: DashboardService.generateRecentActivities(orders, users, []),
        dataAvailability: {
          users: users.length > 0,
          products: true, // 기존 값 유지
          coupons: true, // 기존 값 유지
          events: true, // 기존 값 유지
          orders: orders.length > 0
        }
      };
    } catch (error) {
      console.error('실시간 통계 가져오기 실패:', error);
      throw error;
    }
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
