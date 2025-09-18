import { Timestamp } from 'firebase/firestore';

/**
 * Firestore 객체를 직렬화 가능한 객체로 변환
 * Timestamp 등의 Firestore 특수 객체를 일반 JavaScript 객체로 변환
 */
export function serializeFirestoreData<T = any>(data: any): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Timestamp 객체 처리
  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as any;
  }

  // Date 객체 처리
  if (data instanceof Date) {
    return data.toISOString() as any;
  }

  // 배열 처리
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item)) as any;
  }

  // 객체 처리
  if (typeof data === 'object' && data !== null) {
    const serialized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // toJSON 메서드가 있는 객체 처리 (Firestore Timestamp 등)
      if (value && typeof value === 'object' && 'toJSON' in value) {
        if (value instanceof Timestamp) {
          serialized[key] = value.toDate().toISOString();
        } else {
          try {
            serialized[key] = (value as any).toJSON();
          } catch {
            serialized[key] = serializeFirestoreData(value);
          }
        }
      } else {
        serialized[key] = serializeFirestoreData(value);
      }
    }
    
    return serialized;
  }

  // 원시 타입은 그대로 반환
  return data;
}

/**
 * 상품 데이터 직렬화 (Product 타입 전용)
 */
export function serializeProduct(product: any) {
  return serializeFirestoreData({
    ...product,
    createdAt: product.createdAt instanceof Timestamp ? product.createdAt.toDate().toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Timestamp ? product.updatedAt.toDate().toISOString() : product.updatedAt,
    migratedAt: product.migratedAt instanceof Timestamp ? product.migratedAt.toDate().toISOString() : product.migratedAt,
  });
}

/**
 * ISO 문자열을 Date 객체로 변환 (클라이언트에서 사용)
 */
export function deserializeDates(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // ISO 문자열을 Date로 변환
  if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)) {
    return new Date(data);
  }

  // 배열 처리
  if (Array.isArray(data)) {
    return data.map(item => deserializeDates(item));
  }

  // 객체 처리
  if (typeof data === 'object' && data !== null) {
    const deserialized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key.includes('At') || key.includes('Date')) {
        deserialized[key] = deserializeDates(value);
      } else {
        deserialized[key] = deserializeDates(value);
      }
    }
    
    return deserialized;
  }

  return data;
}

export default {
  serializeFirestoreData,
  serializeProduct,
  deserializeDates,
};