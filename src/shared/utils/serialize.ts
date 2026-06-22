import { Timestamp } from 'firebase/firestore';

type SerializableRecord = Record<string, unknown>;

function hasToJson(value: object): value is { toJSON: () => unknown } {
  return 'toJSON' in value && typeof (value as { toJSON?: unknown }).toJSON === 'function';
}

/**
 * Firestore 객체를 직렬화 가능한 객체로 변환
 * Timestamp 등의 Firestore 특수 객체를 일반 JavaScript 객체로 변환
 */
export function serializeFirestoreData<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) {
    return data as T;
  }

  // Timestamp 객체 처리
  if (data instanceof Timestamp) {
    return data.toDate().toISOString() as T;
  }

  // Date 객체 처리
  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  // 배열 처리
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item)) as T;
  }

  // 객체 처리
  if (typeof data === 'object' && data !== null) {
    const serialized: SerializableRecord = {};
    
    for (const [key, value] of Object.entries(data)) {
      // toJSON 메서드가 있는 객체 처리 (Firestore Timestamp 등)
      if (value && typeof value === 'object' && hasToJson(value)) {
        if (value instanceof Timestamp) {
          serialized[key] = value.toDate().toISOString();
        } else {
          try {
            serialized[key] = value.toJSON();
          } catch {
            serialized[key] = serializeFirestoreData(value);
          }
        }
      } else {
        serialized[key] = serializeFirestoreData(value);
      }
    }
    
    return serialized as T;
  }

  // 원시 타입은 그대로 반환
  return data as T;
}

/**
 * 상품 데이터 직렬화 (Product 타입 전용)
 */
export function serializeProduct<T extends object>(product: T): T {
  const productRecord = product as Record<string, unknown>;

  return serializeFirestoreData<T>({
    ...productRecord,
    createdAt: productRecord.createdAt instanceof Timestamp ? productRecord.createdAt.toDate().toISOString() : productRecord.createdAt,
    updatedAt: productRecord.updatedAt instanceof Timestamp ? productRecord.updatedAt.toDate().toISOString() : productRecord.updatedAt,
    migratedAt: productRecord.migratedAt instanceof Timestamp ? productRecord.migratedAt.toDate().toISOString() : productRecord.migratedAt,
  });
}

/**
 * ISO 문자열을 Date 객체로 변환 (클라이언트에서 사용)
 */
export function deserializeDates(data: unknown): unknown {
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
    const deserialized: SerializableRecord = {};
    
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

const serializeUtils = {
  serializeFirestoreData,
  serializeProduct,
  deserializeDates,
};

export default serializeUtils;
