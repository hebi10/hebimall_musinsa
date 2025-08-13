import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  serverTimestamp,
  increment,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';
import { QnA, CreateQnAData, QnAAnswer, QnAFilter, QnAPagination } from '@/shared/types/qna';

const COLLECTION_NAME = 'qna';

export class QnAService {
  // QnA 생성
  static async createQnA(
    userId: string,
    userEmail: string,
    userName: string,
    data: CreateQnAData
  ): Promise<string> {
    const qnaData = {
      userId,
      userEmail,
      userName,
      category: data.category,
      title: data.title,
      content: data.content,
      images: data.images || [],
      isSecret: data.isSecret,
      password: data.password,
      status: 'waiting' as const,
      views: 0,
      isNotified: data.isNotified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      productId: data.productId,
      productName: data.productName,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), qnaData);
    return docRef.id;
  }

  // QnA 목록 조회 (페이지네이션 포함)
  static async getQnAList(
    filters: QnAFilter = {},
    page: number = 1,
    limitCount: number = 10
  ): Promise<{ qnas: QnA[]; pagination: QnAPagination }> {
    let q = query(collection(db, COLLECTION_NAME));

    // 필터 적용
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.isSecret !== undefined) {
      q = query(q, where('isSecret', '==', filters.isSecret));
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.productId) {
      q = query(q, where('productId', '==', filters.productId));
    }

    // 정렬 및 페이지네이션
    q = query(q, orderBy('createdAt', 'desc'));

    // 전체 개수 조회
    const countSnapshot = await getCountFromServer(q);
    const totalCount = countSnapshot.data().count;
    const totalPages = Math.ceil(totalCount / limitCount);

    // 페이지네이션 적용 (startAfter 사용)
    if (page > 1) {
      // 이전 페이지의 마지막 문서를 찾기 위한 쿼리
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
    const qnas = querySnapshot.docs.map(doc => this.convertDocToQnA(doc));

    // 검색어 필터링 (클라이언트 사이드)
    let filteredQnas = qnas;
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredQnas = qnas.filter(qna =>
        qna.title.toLowerCase().includes(searchLower) ||
        qna.content.toLowerCase().includes(searchLower) ||
        qna.userName.toLowerCase().includes(searchLower)
      );
    }

    return {
      qnas: filteredQnas,
      pagination: {
        page,
        limit: limitCount,
        totalCount,
        totalPages,
      },
    };
  }

  // 특정 QnA 조회 (조회수 증가)
  static async getQnA(qnaId: string, incrementViews: boolean = true): Promise<QnA | null> {
    const docRef = doc(db, COLLECTION_NAME, qnaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 조회수 증가
      if (incrementViews) {
        await updateDoc(docRef, {
          views: increment(1),
        });
      }

      return this.convertDocToQnA(docSnap);
    }

    return null;
  }

  // QnA 답변 추가 (관리자용)
  static async answerQnA(
    qnaId: string,
    answer: Omit<QnAAnswer, 'answeredAt'>
  ): Promise<void> {
    const qnaRef = doc(db, COLLECTION_NAME, qnaId);
    await updateDoc(qnaRef, {
      answer: {
        ...answer,
        answeredAt: serverTimestamp(),
      },
      status: 'answered',
      updatedAt: serverTimestamp(),
    });
  }

  // QnA 상태 업데이트
  static async updateQnAStatus(
    qnaId: string,
    status: QnA['status']
  ): Promise<void> {
    const qnaRef = doc(db, COLLECTION_NAME, qnaId);
    await updateDoc(qnaRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  // QnA 수정
  static async updateQnA(
    qnaId: string,
    updateData: Partial<Pick<QnA, 'title' | 'content' | 'category' | 'isSecret' | 'password'>>
  ): Promise<void> {
    const qnaRef = doc(db, COLLECTION_NAME, qnaId);
    await updateDoc(qnaRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  }

  // QnA 삭제
  static async deleteQnA(qnaId: string): Promise<void> {
    const qnaRef = doc(db, COLLECTION_NAME, qnaId);
    await updateDoc(qnaRef, {
      status: 'closed',
      updatedAt: serverTimestamp(),
    });
  }

  // 사용자별 QnA 목록
  static async getUserQnAs(userId: string): Promise<QnA[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.convertDocToQnA(doc));
  }

  // 카테고리별 통계
  static async getQnAStats(): Promise<Record<string, number>> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const stats: Record<string, number> = {};

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'general';
      stats[category] = (stats[category] || 0) + 1;
    });

    return stats;
  }

  // 최근 QnA 목록 (홈페이지용)
  static async getRecentQnAs(limitCount: number = 5): Promise<QnA[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isSecret', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.convertDocToQnA(doc));
  }

  // 비밀글 확인
  static async verifySecretPassword(qnaId: string, password: string): Promise<boolean> {
    const qna = await this.getQnA(qnaId, false);
    if (!qna || !qna.isSecret) return false;
    return qna.password === password;
  }

  // Firestore 문서를 QnA 객체로 변환
  private static convertDocToQnA(doc: QueryDocumentSnapshot): QnA {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      answer: data.answer ? {
        ...data.answer,
        answeredAt: data.answer.answeredAt?.toDate() || new Date(),
      } : undefined,
    } as QnA;
  }
}
