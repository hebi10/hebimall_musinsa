import { 
  onCall, 
  HttpsError,
  CallableRequest 
} from 'firebase-functions/v2/https';
import { 
  getFirestore, 
  FieldValue 
} from 'firebase-admin/firestore';

// Firebase Admin은 index.ts에서 이미 초기화됨
const db = getFirestore();

interface IssueCouponRequest {
  uid: string;
  couponId: string;
}

interface UseCouponRequest {
  userCouponId: string;
  orderId: string;
  uid: string;
}

interface RegisterCouponRequest {
  uid: string;
  couponCode: string;
}

interface CouponResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 쿠폰 발급 함수
 */
export const issueCoupon = onCall<IssueCouponRequest>(
  { region: 'us-central1' },
  async (request: CallableRequest<IssueCouponRequest>): Promise<CouponResponse> => {
    try {
      const { uid, couponId } = request.data;

      // 인증 확인
      if (!request.auth) {
        throw new HttpsError('unauthenticated', '인증이 필요합니다.');
      }

      // 요청한 uid와 인증된 uid가 일치하는지 확인
      if (request.auth.uid !== uid) {
        throw new HttpsError('permission-denied', '권한이 없습니다.');
      }

      // 1. 쿠폰 마스터 존재 여부 확인
      const couponDoc = await db.collection('coupons').doc(couponId).get();
      if (!couponDoc.exists) {
        throw new HttpsError('not-found', '존재하지 않는 쿠폰입니다.');
      }

      const coupon = couponDoc.data();
      if (!coupon?.isActive) {
        throw new HttpsError('failed-precondition', '발급이 중단된 쿠폰입니다.');
      }

      // 2. 이미 발급받은 쿠폰인지 확인 (중복 방지)
      const existingUserCoupon = await db
        .collection('user_coupons')
        .where('uid', '==', uid)
        .where('couponId', '==', couponId)
        .get();

      if (!existingUserCoupon.empty) {
        throw new HttpsError('already-exists', '이미 발급받은 쿠폰입니다.');
      }

      // 3. 새로운 유저쿠폰 생성
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const newUserCoupon = {
        uid,
        couponId,
        status: '사용가능',
        issuedDate: today,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      const userCouponRef = await db.collection('user_coupons').add(newUserCoupon);

      return {
        success: true,
        message: '쿠폰이 성공적으로 발급되었습니다.',
        data: {
          userCouponId: userCouponRef.id,
          couponName: coupon.name
        }
      };

    } catch (error) {
      console.error('쿠폰 발급 오류:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', '쿠폰 발급 중 오류가 발생했습니다.');
    }
  }
);

/**
 * 쿠폰 사용 함수
 */
export const useCoupon = onCall<UseCouponRequest>(
  { region: 'us-central1' },
  async (request: CallableRequest<UseCouponRequest>): Promise<CouponResponse> => {
    try {
      const { userCouponId, orderId, uid } = request.data;

      // 인증 확인
      if (!request.auth) {
        throw new HttpsError('unauthenticated', '인증이 필요합니다.');
      }

      if (request.auth.uid !== uid) {
        throw new HttpsError('permission-denied', '권한이 없습니다.');
      }

      // 1. 유저쿠폰 존재 여부 및 소유자 확인
      const userCouponDoc = await db.collection('user_coupons').doc(userCouponId).get();
      if (!userCouponDoc.exists) {
        throw new HttpsError('not-found', '존재하지 않는 쿠폰입니다.');
      }

      const userCoupon = userCouponDoc.data();
      if (userCoupon?.uid !== uid) {
        throw new HttpsError('permission-denied', '본인의 쿠폰만 사용할 수 있습니다.');
      }

      if (userCoupon?.status !== '사용가능') {
        throw new HttpsError('failed-precondition', '사용할 수 없는 쿠폰입니다.');
      }

      // 2. 쿠폰 마스터 정보 확인 (만료일 검증)
      const couponDoc = await db.collection('coupons').doc(userCoupon.couponId).get();
      if (!couponDoc.exists) {
        throw new HttpsError('not-found', '쿠폰 정보를 찾을 수 없습니다.');
      }

      const coupon = couponDoc.data();
      const today = new Date();
      const expiryDate = new Date(coupon?.expiryDate);
      
      if (expiryDate < today) {
        // 만료된 쿠폰 상태 업데이트
        await db.collection('user_coupons').doc(userCouponId).update({
          status: '기간만료',
          expiredDate: today.toISOString().split('T')[0],
          updatedAt: FieldValue.serverTimestamp()
        });
        
        throw new HttpsError('failed-precondition', '만료된 쿠폰입니다.');
      }

      // 3. 쿠폰 사용 처리
      const usedDate = today.toISOString().split('T')[0];
      await db.collection('user_coupons').doc(userCouponId).update({
        status: '사용완료',
        usedDate,
        orderId,
        updatedAt: FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: '쿠폰이 성공적으로 사용되었습니다.',
        data: {
          userCouponId,
          couponName: coupon?.name,
          usedDate,
          orderId
        }
      };

    } catch (error) {
      console.error('쿠폰 사용 오류:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', '쿠폰 사용 중 오류가 발생했습니다.');
    }
  }
);

/**
 * 쿠폰 코드로 등록 함수
 */
export const registerCoupon = onCall<RegisterCouponRequest>(
  { region: 'us-central1' },
  async (request: CallableRequest<RegisterCouponRequest>): Promise<CouponResponse> => {
    try {
      const { uid, couponCode } = request.data;

      // 인증 확인
      if (!request.auth) {
        throw new HttpsError('unauthenticated', '인증이 필요합니다.');
      }

      if (request.auth.uid !== uid) {
        throw new HttpsError('permission-denied', '권한이 없습니다.');
      }

      // 1. 쿠폰 코드로 쿠폰 마스터 찾기
      const couponQuery = await db
        .collection('coupons')
        .where('couponCode', '==', couponCode.toUpperCase()) // couponCode 필드로 검색
        .where('isActive', '==', true)
        .where('isDirectAssign', '==', false) // 코드 입력 방식만 허용
        .get();

      if (couponQuery.empty) {
        throw new HttpsError('not-found', '올바르지 않은 쿠폰 코드입니다.');
      }

      const couponDoc = couponQuery.docs[0];
      const coupon = couponDoc.data();
      const couponId = couponDoc.id;

      // 1.5. 쿠폰 사용 제한 확인
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new HttpsError('resource-exhausted', '쿠폰 사용 한도가 초과되었습니다.');
      }

      // 1.6. 쿠폰 만료일 확인
      const currentDate = new Date();
      const expiryDate = new Date(coupon.expiryDate);
      if (expiryDate < currentDate) {
        throw new HttpsError('failed-precondition', '만료된 쿠폰 코드입니다.');
      }

      // 2. 중복 발급 확인
      const existingUserCoupon = await db
        .collection('user_coupons')
        .where('uid', '==', uid)
        .where('couponId', '==', couponId)
        .get();

      if (!existingUserCoupon.empty) {
        throw new HttpsError('already-exists', '이미 등록된 쿠폰입니다.');
      }

      // 3. 쿠폰 등록 (발급과 동일한 로직)
      const today = new Date().toISOString().split('T')[0];
      const newUserCoupon = {
        uid,
        couponId,
        status: '사용가능',
        issuedDate: today,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      const userCouponRef = await db.collection('user_coupons').add(newUserCoupon);

      // 4. 쿠폰 마스터의 사용 횟수 증가
      await db.collection('coupons').doc(couponId).update({
        usedCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: '쿠폰이 성공적으로 등록되었습니다.',
        data: {
          userCouponId: userCouponRef.id,
          couponName: coupon.name,
          couponCode
        }
      };

    } catch (error) {
      console.error('쿠폰 등록 오류:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', '쿠폰 등록 중 오류가 발생했습니다.');
    }
  }
);

/**
 * 만료된 쿠폰 자동 정리 (스케줄러 함수)
 */
export const cleanupExpiredCoupons = onCall(
  { 
    region: 'us-central1',
    // schedule: 'every day 00:00' // 실제로는 onSchedule 사용
  },
  async (): Promise<void> => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // 1. 사용가능한 쿠폰 중 만료된 것들 찾기
      const expiredUserCoupons = await db
        .collection('user_coupons')
        .where('status', '==', '사용가능')
        .get();

      const batch = db.batch();
      let updateCount = 0;

      for (const userCouponDoc of expiredUserCoupons.docs) {
        const userCoupon = userCouponDoc.data();
        
        // 쿠폰 마스터에서 만료일 확인
        const couponDoc = await db.collection('coupons').doc(userCoupon.couponId).get();
        if (!couponDoc.exists) continue;
        
        const coupon = couponDoc.data();
        const expiryDate = new Date(coupon?.expiryDate);
        
        if (expiryDate < today) {
          batch.update(userCouponDoc.ref, {
            status: '기간만료',
            expiredDate: todayStr,
            updatedAt: FieldValue.serverTimestamp()
          });
          updateCount++;
        }
      }

      if (updateCount > 0) {
        await batch.commit();
        console.log(`${updateCount}개의 만료된 쿠폰을 정리했습니다.`);
      }

    } catch (error) {
      console.error('만료 쿠폰 정리 오류:', error);
      throw new HttpsError('internal', '만료 쿠폰 정리 중 오류가 발생했습니다.');
    }
  }
);
