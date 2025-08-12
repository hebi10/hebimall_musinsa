import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { UserProfile } from '@/shared/types/user';

export class UserService {
  // 모든 사용자 조회
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        birthDate: doc.data().birthDate?.toDate() || new Date()
      })) as UserProfile[];
    } catch (error) {
      console.error('사용자 데이터 조회 실패:', error);
      // Firebase 연결 오류 시 빈 배열 반환
      return [];
    }
  }

  // 활성 사용자만 조회
  static async getActiveUsers(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        birthDate: doc.data().birthDate?.toDate() || new Date()
      })) as UserProfile[];
    } catch (error) {
      console.error('활성 사용자 데이터 조회 실패:', error);
      return [];
    }
  }

  // 사용자 통계
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
