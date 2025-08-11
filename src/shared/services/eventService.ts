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
import { Event, EventFilter } from '../types/event';

const EVENTS_COLLECTION = 'events';

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
      const now = Timestamp.now();
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('isActive', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        orderBy('startDate', 'desc')
      );

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
      console.error('Error getting active events:', error);
      throw error;
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
}
