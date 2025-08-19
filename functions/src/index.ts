import * as functions from "firebase-functions/v2";
import { onCall, CallableRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as path from "path";
import { secrets } from "./config/environment";

admin.initializeApp();

// Next.js SSR 서버 설정

let app: any;

// 동적 Next.js 서버 함수
export const nextjsServer = onRequest({
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 60,
  invoker: 'public',
  cors: true,
  secrets: [
    secrets.OPENAI_API_KEY // OpenAI API Key만 Secret으로 관리
  ]
}, async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    if (!app) {
      // Next.js 앱 동적 로드
      const next = require('next');
      app = next({
        dev: false,
        dir: path.join(__dirname, '..'),
        conf: {
          distDir: '.next',
        }
      });
      await app.prepare();
    }

    return app.getRequestHandler()(req, res);
  } catch (error) {
    console.error('Next.js server error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: String(error) });
  }
});

// 쿠폰 함수들 export
export * from './couponFunctions';

// 환경변수 함수들 export
export * from './environmentFunctions';

// 채팅 API 함수 export
export * from './chatAPI-standalone';

// 포인트 타입 정의
interface AddPointData {
  amount: number;
  description: string;
  orderId?: string; // 주문 관련 포인트일 경우
}

interface UsePointData {
  amount: number;
  description: string;
  orderId: string; // 주문 ID 필수
}

interface RefundPointData {
  amount: number;
  description: string;
  orderId: string; // 원주문 ID
}

interface PointHistoryRequest {
  limit?: number;
  lastDoc?: any;
}

// 1. 포인트 적립 함수
export const addPoint = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest<AddPointData>) => {
  // 인증 확인
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }

  const userId = request.auth.uid;
  const { amount, description, orderId } = request.data;

  // 데이터 검증
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "적립할 포인트는 0보다 커야 합니다."
    );
  }

  if (!description) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "포인트 적립 사유가 필요합니다."
    );
  }

  try {
    // 트랜잭션을 사용하여 포인트 업데이트
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore().collection("users").doc(userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "사용자 정보를 찾을 수 없습니다."
        );
      }

      const userData = userSnap.data();
      const currentBalance = userData?.pointBalance || 0;
      const newBalance = currentBalance + amount;

      // 사용자 포인트 잔액 업데이트
      transaction.update(userRef, { pointBalance: newBalance });

      // 포인트 내역 추가
      const pointHistoryRef = userRef.collection("pointHistory").doc();
      transaction.set(pointHistoryRef, {
        type: 'earn',
        amount,
        description,
        orderId: orderId || null,
        date: admin.firestore.FieldValue.serverTimestamp(),
        balanceAfter: newBalance,
        expired: false,
      });

      return { success: true, newBalance };
    });

    return result;
  } catch (error: any) {
    console.error("포인트 적립 실패:", error);
    throw new functions.https.HttpsError(
      "internal",
      "포인트 적립에 실패했습니다.",
      error
    );
  }
});

// 2. 포인트 사용 함수
export const usePoint = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest<UsePointData>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }

  const userId = request.auth.uid;
  const { amount, description, orderId } = request.data;

  // 데이터 검증
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "사용할 포인트는 0보다 커야 합니다."
    );
  }

  if (!orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "주문 ID가 필요합니다."
    );
  }

  try {
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore().collection("users").doc(userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "사용자 정보를 찾을 수 없습니다."
        );
      }

      const userData = userSnap.data();
      const currentBalance = userData?.pointBalance || 0;

      if (currentBalance < amount) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `보유 포인트가 부족합니다. (보유: ${currentBalance}, 사용 요청: ${amount})`
        );
      }

      const newBalance = currentBalance - amount;

      // 사용자 포인트 잔액 업데이트
      transaction.update(userRef, { pointBalance: newBalance });

      // 포인트 내역 추가
      const pointHistoryRef = userRef.collection("pointHistory").doc();
      transaction.set(pointHistoryRef, {
        type: 'use',
        amount,
        description,
        orderId,
        date: admin.firestore.FieldValue.serverTimestamp(),
        balanceAfter: newBalance,
      });

      return { success: true, newBalance, usedAmount: amount };
    });

    return result;
  } catch (error: any) {
    console.error("포인트 사용 실패:", error);
    throw error;
  }
});

// 3. 포인트 환불 함수 (주문 취소/환불 시)
export const refundPoint = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest<RefundPointData>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }

  const userId = request.auth.uid;
  const { amount, description, orderId } = request.data;

  // 데이터 검증
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "환불할 포인트는 0보다 커야 합니다."
    );
  }

  if (!orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "주문 ID가 필요합니다."
    );
  }

  try {
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore().collection("users").doc(userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "사용자 정보를 찾을 수 없습니다."
        );
      }

      const userData = userSnap.data();
      const currentBalance = userData?.pointBalance || 0;
      const newBalance = currentBalance + amount;

      // 사용자 포인트 잔액 업데이트
      transaction.update(userRef, { pointBalance: newBalance });

      // 포인트 내역 추가
      const pointHistoryRef = userRef.collection("pointHistory").doc();
      transaction.set(pointHistoryRef, {
        type: 'refund',
        amount,
        description,
        orderId,
        date: admin.firestore.FieldValue.serverTimestamp(),
        balanceAfter: newBalance,
      });

      return { success: true, newBalance, refundedAmount: amount };
    });

    return result;
  } catch (error: any) {
    console.error("포인트 환불 실패:", error);
    throw new functions.https.HttpsError(
      "internal",
      "포인트 환불에 실패했습니다.",
      error
    );
  }
});

// 4. 포인트 내역 조회 함수
export const getPointHistory = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest<PointHistoryRequest>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }

  const userId = request.auth.uid;
  const { limit = 50, lastDoc } = request.data;

  try {
    let query = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("pointHistory")
      .orderBy("date", "desc")
      .limit(limit);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      history,
      hasMore: snapshot.docs.length === limit,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error: any) {
    console.error("포인트 내역 조회 실패:", error);
    throw new functions.https.HttpsError(
      "internal",
      "포인트 내역 조회에 실패했습니다.",
      error
    );
  }
});

// 5. 포인트 잔액 조회 함수
export const getPointBalance = onCall({
  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hebimall.firebaseapp.com",
    "https://hebimall.web.app"
  ],
  region: 'us-central1'
}, async (request: CallableRequest<any>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "로그인이 필요합니다."
    );
  }

  const userId = request.auth.uid;

  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const userData = userDoc.data();
    const pointBalance = userData?.pointBalance || 0;

    return {
      success: true,
      pointBalance
    };
  } catch (error: any) {
    console.error("포인트 잔액 조회 실패:", error);
    throw new functions.https.HttpsError(
      "internal",
      "포인트 잔액 조회에 실패했습니다.",
      error
    );
  }
});

// 6. 포인트 만료 처리 함수 (정기 실행용)
export const expirePoints = onSchedule({
  schedule: '0 0 * * *', // 매일 자정에 실행
  timeZone: 'Asia/Seoul',
}, async (event) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 6개월 전 포인트 적립 내역 조회
    const expiredPointsQuery = await admin
      .firestore()
      .collectionGroup('pointHistory')
      .where('type', '==', 'earn')
      .where('date', '<', sixMonthsAgo)
      .where('expired', '==', false)
      .get();

    const batch = admin.firestore().batch();
    const userPointUpdates = new Map<string, number>();

    expiredPointsQuery.docs.forEach(doc => {
      const data = doc.data();
      const userId = doc.ref.parent.parent?.id;

      if (userId) {
        // 만료 표시
        batch.update(doc.ref, { expired: true });

        // 사용자별 만료 포인트 합계
        const currentExpired = userPointUpdates.get(userId) || 0;
        userPointUpdates.set(userId, currentExpired + data.amount);
      }
    });

    // 각 사용자의 포인트 잔액에서 만료 포인트 차감
    for (const [userId, expiredAmount] of userPointUpdates) {
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const currentBalance = userData?.pointBalance || 0;
        const newBalance = Math.max(0, currentBalance - expiredAmount);

        batch.update(userRef, { pointBalance: newBalance });

        // 만료 내역 추가
        const pointHistoryRef = userRef.collection('pointHistory').doc();
        batch.set(pointHistoryRef, {
          type: 'expire',
          amount: expiredAmount,
          description: '포인트 만료 (6개월 경과)',
          date: admin.firestore.FieldValue.serverTimestamp(),
          balanceAfter: newBalance,
        });
      }
    }

    await batch.commit();

    console.log(`포인트 만료 처리 완료: ${userPointUpdates.size}명의 사용자, 총 ${Array.from(userPointUpdates.values()).reduce((a, b) => a + b, 0)} 포인트 만료`);
  } catch (error) {
    console.error('포인트 만료 처리 실패:', error);
    throw error;
  }
});
