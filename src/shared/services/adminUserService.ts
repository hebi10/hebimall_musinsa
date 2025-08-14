import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getCountFromServer,
  Timestamp,
  addDoc,
  serverTimestamp,
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
}

export interface UserStats {
  total: number;
  active: number;
  admin: number;
  newUsers: number;
}

export interface UserFilter {
  searchTerm?: string;
  role?: string;
  status?: string;
}

export class AdminUserService {
  // 사용자 목록 조회
  static async getUsers(
    filters: UserFilter = {},
    page: number = 1,
    limitCount: number = 10
  ): Promise<{ users: AdminUserData[]; totalCount: number }> {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // 필터 적용
      if (filters.role && filters.role !== 'all') {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      // 정렬
      q = query(q, orderBy('createdAt', 'desc'));

      // 전체 개수 조회
      const countSnapshot = await getCountFromServer(q);
      const totalCount = countSnapshot.data().count;

      // 페이지네이션 적용
      if (page > 1) {
        const prevPageQuery = query(
          collection(db, COLLECTION_NAME),
          orderBy('createdAt', 'desc'),
          limit((page - 1) * limitCount)
        );
        const prevPageSnapshot = await getDocs(prevPageQuery);
        if (prevPageSnapshot.docs.length > 0) {
          const lastDoc = prevPageSnapshot.docs[prevPageSnapshot.docs.length - 1];
          q = query(q, startAfter(lastDoc), limit(limitCount));
        } else {
          q = query(q, limit(limitCount));
        }
      } else {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => this.convertDocToUser(doc));

      // 클라이언트 사이드 검색 필터링
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        users = users.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      return { users, totalCount };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // 모든 사용자 조회 (통계용)
  static async getAllUsers(): Promise<AdminUserData[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertDocToUser(doc));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  // 사용자 통계 조회
  static async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      return {
        total: users.length,
        active: users.filter(user => user.status === 'active').length,
        admin: users.filter(user => user.role === 'admin').length,
        newUsers: users.filter(user => {
          const joinDate = new Date(user.joinDate || user.createdAt);
          return joinDate >= weekAgo;
        }).length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { total: 0, active: 0, admin: 0, newUsers: 0 };
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
      const newUser = {
        ...userData,
        role: userData.role || 'user',
        status: userData.status || 'active',
        orders: 0,
        totalSpent: 0,
        lastLogin: serverTimestamp(),
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newUser);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // 사용자 데이터 내보내기 (CSV)
  static async exportUsersToCSV(): Promise<string> {
    try {
      const users = await this.getAllUsers();
      
      const headers = [
        'ID', '이름', '이메일', '역할', '상태', '가입일', 
        '마지막 로그인', '주문수', '총 구매액'
      ];
      
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.id,
          user.name,
          user.email,
          user.role,
          user.status,
          user.joinDate,
          user.lastLogin.toLocaleDateString(),
          user.orders,
          user.totalSpent
        ].join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting users to CSV:', error);
      throw error;
    }
  }

  // Firestore 문서를 사용자 객체로 변환
  private static convertDocToUser(doc: any): AdminUserData {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || data.displayName || '이름 없음',
      email: data.email || '',
      role: data.role || 'user',
      status: data.status || 'active',
      joinDate: data.joinDate || data.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      orders: data.orders || 0,
      totalSpent: data.totalSpent || 0,
      lastLogin: data.lastLogin?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AdminUserData;
  }
}
