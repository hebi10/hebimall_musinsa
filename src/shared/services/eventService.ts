import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../libs/firebase/firebase';
import { Event, EventFilter, EventParticipant } from '../types/event';

const EVENTS_COLLECTION = 'events';
const EVENT_PARTICIPANTS_COLLECTION = 'eventParticipants';

export class EventService {
  // 모든 이벤트 가져오기
  static async getEvents(filter?: EventFilter): Promise<Event[]> {
    try {
      let q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));

      if (filter?.eventType) {
        q = query(q, where('eventType', '==', filter.eventType));
      }

      if (filter?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filter.isActive));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      } as Event));
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }

  // 특정 이벤트 가져오기
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event;
      }

      return null;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  // 활성 이벤트만 가져오기
  static async getActiveEvents(): Promise<Event[]> {
    try {
      // 복합 인덱스가 필요한 복잡한 쿼리 대신 간단한 쿼리 사용
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const now = new Date();
      
      // 클라이언트 사이드에서 날짜 필터링
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as Event))
        .filter(event => event.startDate <= now && event.endDate >= now);
    } catch (error) {
      console.error('Error getting active events:', error);
      // Firebase 에러가 발생하면 빈 배열 반환 (대시보드가 중단되지 않도록)
      console.warn('Firebase 인덱스가 필요할 수 있습니다. 빈 배열을 반환합니다.');
      return [];
    }
  }

  // 이벤트 생성
  static async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
        ...eventData,
        startDate: Timestamp.fromDate(eventData.startDate),
        endDate: Timestamp.fromDate(eventData.endDate),
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // 이벤트 업데이트
  static async updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const updateData: any = {
        ...eventData,
        updatedAt: Timestamp.now(),
      };

      if (eventData.startDate) {
        updateData.startDate = Timestamp.fromDate(eventData.startDate);
      }

      if (eventData.endDate) {
        updateData.endDate = Timestamp.fromDate(eventData.endDate);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // 이벤트 삭제
  static async deleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      
      // 이벤트 데이터 가져오기 (이미지 삭제를 위해)
      const eventDoc = await getDoc(docRef);
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        
        // Storage에서 이미지 삭제
        if (eventData.bannerImage && eventData.bannerImage.includes('firebase')) {
          try {
            const bannerRef = ref(storage, eventData.bannerImage);
            await deleteObject(bannerRef);
          } catch (error) {
            console.warn('Error deleting banner image:', error);
          }
        }

        if (eventData.thumbnailImage && eventData.thumbnailImage.includes('firebase')) {
          try {
            const thumbnailRef = ref(storage, eventData.thumbnailImage);
            await deleteObject(thumbnailRef);
          } catch (error) {
            console.warn('Error deleting thumbnail image:', error);
          }
        }
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // 이미지 업로드
  static async uploadImage(file: File, path: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const imageRef = ref(storage, `${path}/${fileName}`);
      
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // 이벤트 참여자 수 증가
  static async incrementParticipantCount(id: string): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const eventDoc = await getDoc(docRef);
      
      if (eventDoc.exists()) {
        const currentCount = eventDoc.data().participantCount || 0;
        await updateDoc(docRef, {
          participantCount: currentCount + 1,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error incrementing participant count:', error);
      throw error;
    }
  }

  // 이벤트 상태 토글 (활성/비활성)
  static async toggleEventStatus(id: string): Promise<void> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      const eventDoc = await getDoc(docRef);
      
      if (eventDoc.exists()) {
        const currentStatus = eventDoc.data().isActive;
        await updateDoc(docRef, {
          isActive: !currentStatus,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error toggling event status:', error);
      throw error;
    }
  }

  // 배치로 여러 이벤트 업데이트
  static async batchUpdateEvents(updates: { id: string; data: Partial<Event> }[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const docRef = doc(db, EVENTS_COLLECTION, id);
        const updateData: any = {
          ...data,
          updatedAt: Timestamp.now(),
        };

        if (data.startDate) {
          updateData.startDate = Timestamp.fromDate(data.startDate);
        }

        if (data.endDate) {
          updateData.endDate = Timestamp.fromDate(data.endDate);
        }

        batch.update(docRef, updateData);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error batch updating events:', error);
      throw error;
    }
  }

  // 이벤트 참여
  static async participateInEvent(eventId: string, userId: string, userName: string): Promise<void> {
    try {
      // 이미 참여했는지 확인
      const isAlreadyParticipated = await this.checkEventParticipation(eventId, userId);
      if (isAlreadyParticipated) {
        throw new Error('이미 참여한 이벤트입니다.');
      }

      // 이벤트 정보 확인
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error('존재하지 않는 이벤트입니다.');
      }

      // 이벤트 상태 확인
      const now = new Date();
      if (now < event.startDate) {
        throw new Error('아직 시작되지 않은 이벤트입니다.');
      }
      if (now > event.endDate) {
        throw new Error('종료된 이벤트입니다.');
      }
      if (!event.isActive) {
        throw new Error('비활성화된 이벤트입니다.');
      }

      // manual 타입 쿠폰 이벤트는 참여 불가
      if (event.eventType === 'coupon' && event.couponType === 'manual') {
        throw new Error('수동 쿠폰 이벤트는 직접 참여할 수 없습니다.');
      }

      // 최대 참여자 수 확인
      if (event.hasMaxParticipants && event.maxParticipants && event.participantCount >= event.maxParticipants) {
        throw new Error('참여 인원이 마감되었습니다.');
      }

      // 참여자 추가
      await addDoc(collection(db, EVENT_PARTICIPANTS_COLLECTION), {
        eventId,
        userId,
        userName,
        participatedAt: Timestamp.now(),
        couponUsed: false,
      });

      // 참여자 수 증가
      await this.incrementParticipantCount(eventId);
    } catch (error) {
      console.error('Error participating in event:', error);
      throw error;
    }
  }

  // 이벤트 참여 여부 확인
  static async checkEventParticipation(eventId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, EVENT_PARTICIPANTS_COLLECTION),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking event participation:', error);
      return false;
    }
  }

  // 이벤트 참여자 목록 가져오기
  static async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    try {
      const q = query(
        collection(db, EVENT_PARTICIPANTS_COLLECTION),
        where('eventId', '==', eventId),
        orderBy('participatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        participatedAt: doc.data().participatedAt.toDate(),
      } as EventParticipant));
    } catch (error) {
      console.error('Error getting event participants:', error);
      throw error;
    }
  }

  // 사용자 참여 이벤트 목록 가져오기
  static async getUserParticipatedEvents(userId: string): Promise<EventParticipant[]> {
    try {
      const q = query(
        collection(db, EVENT_PARTICIPANTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('participatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        participatedAt: doc.data().participatedAt.toDate(),
      } as EventParticipant));
    } catch (error) {
      console.error('Error getting user participated events:', error);
      throw error;
    }
  }
}
