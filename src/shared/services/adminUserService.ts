import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  addDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { UserProfile } from '@/shared/types/user';

const COLLECTION_NAME = 'users';

export interface AdminUserData extends UserProfile {
  lastLogin: Date;
  orders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'banned';
  role: 'user' | 'admin';
  pointBalance: number;
}

export interface UserStats {
  total: number;
  active: number;
  admin: number;
  newUsers: number;
  totalPoints: number;
}

export interface UserFilter {
  searchTerm?: string;
  role?: string;
  status?: string;
}

export interface PointOperation {
  userId: string;
  amount: number;
  description: string;
  type: 'add' | 'subtract';
}

export class AdminUserService {
  // 사용자 목록 조회
  static async getUsers(
    filters: UserFilter = {},
    page: number = 1,
    limitCount: number = 10
  ): Promise<{ users: AdminUserData[]; totalCount: number }> {
    try {      
      // 복합 인덱스 문제를 피하기 위해 간단한 쿼리 사용
      let q = query(collection(db, COLLECTION_NAME));

      // 단일 필터만 적용 (인덱스 문제 방지)
      if (filters.role && filters.role !== 'all') {
        q = query(q, where('role', '==', filters.role));
      } else if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      
      let users = querySnapshot.docs.map(doc => {
        return this.convertDocToUser(doc);
      });

      // 클라이언트 사이드 필터링
      if (filters.role && filters.role !== 'all' && filters.status && filters.status !== 'all') {
        // 두 조건 모두 적용
        users = users.filter(user => 
          user.role === filters.role && user.status === filters.status
        );
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        users = users.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      // 클라이언트 사이드 정렬 (createdAt이 있는 경우)
      users.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // 최신 순
      });

      // 클라이언트 사이드 페이지네이션
      const totalCount = users.length;
      const startIndex = (page - 1) * limitCount;
      const paginatedUsers = users.slice(startIndex, startIndex + limitCount);

 console.log(` 최종 반환: ${paginatedUsers.length}명 (전체 ${totalCount}명)`);
      return { users: paginatedUsers, totalCount };
    } catch (error) {
 console.error(' Error fetching users:', error);
      throw error;
    }
  }

  // 모든 사용자 조회 (간단한 쿼리, 인덱스 불필요)
  static async getAllUsersSimple(): Promise<AdminUserData[]> {
    try {
 console.log(' 모든 사용자 조회 (간단한 쿼리)...');
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      
 console.log(` 조회된 사용자 수: ${querySnapshot.size}`);
      
      const users = querySnapshot.docs.map(doc => {
 console.log(` 사용자: ${doc.id}`, doc.data());
        return this.convertDocToUser(doc);
      });
      
      return users;
    } catch (error) {
 console.error(' Error fetching all users (simple):', error);
      throw error;
    }
  }

  // 사용자 통계 조회
  static async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsersSimple();
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const totalPoints = users.reduce((sum: number, user: AdminUserData) => sum + (user.pointBalance || 0), 0);

      return {
        total: users.length,
        active: users.filter((user: AdminUserData) => user.status === 'active').length,
        admin: users.filter((user: AdminUserData) => user.role === 'admin').length,
        newUsers: users.filter((user: AdminUserData) => {
          const joinDate = new Date(user.joinDate || user.createdAt);
          return joinDate >= weekAgo;
        }).length,
        totalPoints
      };
    } catch (error) {
 console.error('Error fetching user stats:', error);
      return { total: 0, active: 0, admin: 0, newUsers: 0, totalPoints: 0 };
    }
  }

  // 사용자 상태 업데이트
  static async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'banned'
  ): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
 console.error('Error updating user status:', error);
      throw error;
    }
  }

  // 사용자 역할 업데이트
  static async updateUserRole(
    userId: string,
    role: 'user' | 'admin'
  ): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        role,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
 console.error('Error updating user role:', error);
      throw error;
    }
  }

  // 사용자 삭제 (실제로는 상태를 deleted로 변경)
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        status: 'deleted',
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
 console.error('Error deleting user:', error);
      throw error;
    }
  }

  // 새 사용자 추가
  static async createUser(userData: {
    name: string;
    email: string;
    role?: 'user' | 'admin';
    status?: 'active' | 'inactive';
  }): Promise<string> {
    try {
 console.log(' 사용자 생성 시작:', userData);
      
      const newUser = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        role: userData.role || 'user',
        status: userData.status || 'active',
        orders: 0,
        totalSpent: 0,
        pointBalance: 0,
        isAdmin: (userData.role || 'user') === 'admin',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        phone: '',
        gender: 'male',
        grade: 'bronze',
        addresses: [],
        preferences: {
          favoriteCategories: [],
          favoriteBrands: [],
          sizes: {},
          newsletter: false,
          smsMarketing: false,
        }
      };

 console.log(' Firestore에 저장할 데이터:', newUser);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newUser);
 console.log(' 사용자 생성 완료, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
 console.error(' Error creating user:', error);
      throw error;
    }
  }

  // 사용자 데이터 내보내기 (CSV)
  static async exportUsersToCSV(): Promise<string> {
    try {
      const users = await this.getAllUsersSimple();
      
      const headers = [
        'ID', '이름', '이메일', '역할', '상태', '가입일', 
        '마지막 로그인', '주문수', '총 구매액', '포인트 잔액'
      ];
      
      const csvContent = [
        headers.join(','),
        ...users.map((user: AdminUserData) => [
          user.id,
          user.name,
          user.email,
          user.role,
          user.status,
          user.joinDate,
          user.lastLogin.toLocaleDateString(),
          user.orders,
          user.totalSpent,
          user.pointBalance || 0
        ].join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
 console.error('Error exporting users to CSV:', error);
      throw error;
    }
  }

  // 사용자 포인트 업데이트
  static async updateUserPoints(operation: PointOperation): Promise<void> {
    try {
      const userRef = doc(db, COLLECTION_NAME, operation.userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const currentData = userDoc.data();
      const currentBalance = currentData?.pointBalance || 0;
      
      let newBalance: number;
      if (operation.type === 'add') {
        newBalance = currentBalance + operation.amount;
      } else {
        newBalance = Math.max(0, currentBalance - operation.amount);
      }

      // 사용자 포인트 잔액 업데이트
      await updateDoc(userRef, {
        pointBalance: newBalance,
        updatedAt: serverTimestamp(),
      });

      // 포인트 히스토리 추가
      const pointHistoryRef = collection(db, COLLECTION_NAME, operation.userId, 'pointHistory');
      await addDoc(pointHistoryRef, {
        type: operation.type === 'add' ? 'earn' : 'use',
        amount: operation.amount,
        description: operation.description,
        date: serverTimestamp(),
        balanceAfter: newBalance,
        adminAction: true,
      });

 console.log(` 포인트 ${operation.type === 'add' ? '적립' : '차감'} 완료: ${operation.amount}원`);
    } catch (error) {
 console.error('Error updating user points:', error);
      throw error;
    }
  }

  // 사용자 포인트 히스토리 조회
  static async getUserPointHistory(userId: string, limitCount: number = 50): Promise<any[]> {
    try {
      const pointHistoryRef = collection(db, COLLECTION_NAME, userId, 'pointHistory');
      const q = query(pointHistoryRef, orderBy('date', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }));
    } catch (error) {
 console.error('Error fetching user point history:', error);
      throw error;
    }
  }

  // 사용자 상세 정보 조회 (포인트 정보 포함)
  static async getUserDetail(userId: string): Promise<AdminUserData | null> {
    try {
      const userRef = doc(db, COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      return this.convertDocToUser(userDoc);
    } catch (error) {
 console.error('Error fetching user detail:', error);
      throw error;
    }
  }

  // 포인트 일괄 지급
  static async givePointsToAllUsers(amount: number, description: string): Promise<number> {
    try {
      const users = await this.getAllUsersSimple();
      let successCount = 0;

      for (const user of users) {
        if (user.status === 'active') {
          try {
            await this.updateUserPoints({
              userId: user.id,
              amount,
              description,
              type: 'add'
            });
            successCount++;
          } catch (error) {
 console.error(`Failed to give points to user ${user.id}:`, error);
          }
        }
      }

      return successCount;
    } catch (error) {
 console.error('Error giving points to all users:', error);
      throw error;
    }
  }

  // Firestore 문서를 사용자 객체로 변환
  private static convertDocToUser(doc: any): AdminUserData {
    const data = doc.data();
    
    // 기본값과 null 체크 강화
    const user: AdminUserData = {
      id: doc.id,
      name: data.name || data.displayName || data.username || '이름 없음',
      email: data.email || '',
      phone: data.phone || data.phoneNumber || '',
      role: data.role || 'user',
      status: data.status || 'active',
      joinDate: data.joinDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      orders: data.orders || data.orderCount || 0,
      totalSpent: data.totalSpent || data.totalPurchase || 0,
      pointBalance: data.pointBalance || data.point || data.points || 0,
      isAdmin: data.role === 'admin' || data.isAdmin || false,
      lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : (data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : new Date()),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      birthDate: data.birthDate?.toDate ? data.birthDate.toDate() : undefined,
      gender: data.gender || 'male',
      addresses: data.addresses || [],
      preferences: data.preferences || {
        favoriteCategories: [],
        favoriteBrands: [],
        sizes: {},
        newsletter: false,
        smsMarketing: false,
      },
      point: data.pointBalance || data.point || data.points || 0,
      grade: data.grade || data.tier || 'bronze',
    };

 console.log(` 변환된 사용자: ${user.id} - ${user.name} (${user.role})`);
    return user;
  }
}

// UserService와의 호환성을 위한 별칭
export class UserService {
  // 모든 사용자 조회 (UserService 호환)
  static async getAllUsers(): Promise<UserProfile[]> {
    const users = await AdminUserService.getAllUsersSimple();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      birthDate: user.birthDate,
      gender: user.gender || 'male',
      addresses: user.addresses || [],
      preferences: user.preferences || {
        favoriteCategories: [],
        favoriteBrands: [],
        sizes: {},
        newsletter: false,
        smsMarketing: false,
      },
      isAdmin: user.role === 'admin',
      joinDate: user.joinDate || new Date().toISOString().split('T')[0],
      point: user.pointBalance || 0,
      grade: user.grade || 'bronze',
    })) as UserProfile[];
  }

  // 활성 사용자만 조회 (UserService 호환)
  static async getActiveUsers(): Promise<UserProfile[]> {
    const allUsers = await this.getAllUsers();
    return allUsers.filter(user => user.status === 'active');
  }

  // 사용자 통계 (UserService 호환)
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admin: number;
  }> {
    try {
      const users = await this.getAllUsers();
      
      return {
        total: users.length,
        active: users.filter(user => user.status === 'active').length,
        inactive: users.filter(user => user.status === 'inactive').length,
        admin: users.filter(user => user.role === 'admin').length
      };
    } catch (error) {
 console.error('사용자 통계 조회 실패:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        admin: 0
      };
    }
  }
}
