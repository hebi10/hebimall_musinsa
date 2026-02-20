import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { verifyAuth, AuthError } from "../utils/auth";

/**
 * POST /points
 *
 * 통합 포인트 API
 * body.action: "add" | "refund" | "use" | "balance" | "history"
 */
export const points = onRequest(
  {
    cors: true,
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    try {
      const userId = await verifyAuth(req.headers.authorization);
      const { action, ...payload } = req.body;

      switch (action) {
        case "add":
          await handleAdd(userId, payload, res);
          return;
        case "refund":
          await handleRefund(userId, payload, res);
          return;
        case "use":
          await handleUse(userId, payload, res);
          return;
        case "balance":
          await handleBalance(userId, res);
          return;
        case "history":
          await handleHistory(userId, payload, res);
          return;
        default:
          res.status(400).json({ success: false, error: `유효하지 않은 action: ${action}` });
      }
    } catch (error: any) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      console.error("Points API error:", error);
      res.status(500).json({ success: false, error: error.message || "서버 내부 오류" });
    }
  }
);

/* ────────── 포인트 적립 ────────── */

async function handleAdd(
  userId: string,
  data: { amount?: number; description?: string; orderId?: string },
  res: any
): Promise<void> {
  const { amount, description, orderId } = data;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, error: "적립할 포인트는 0보다 커야 합니다." });
    return;
  }
  if (!description) {
    res.status(400).json({ success: false, error: "포인트 적립 사유가 필요합니다." });
    return;
  }

  const result = await admin.firestore().runTransaction(async (transaction) => {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const currentBalance = userSnap.data()?.pointBalance ?? 0;
    const newBalance = currentBalance + amount;

    transaction.update(userRef, { pointBalance: newBalance });

    transaction.set(userRef.collection("pointHistory").doc(), {
      type: "earn",
      amount,
      description,
      orderId: orderId || null,
      date: admin.firestore.FieldValue.serverTimestamp(),
      balanceAfter: newBalance,
      expired: false,
    });

    return { newBalance };
  });

  res.status(200).json({ success: true, data: result });
}

/* ────────── 포인트 환불 ────────── */

async function handleRefund(
  userId: string,
  data: { amount?: number; description?: string; orderId?: string },
  res: any
): Promise<void> {
  const { amount, description, orderId } = data;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, error: "환불할 포인트는 0보다 커야 합니다." });
    return;
  }
  if (!orderId) {
    res.status(400).json({ success: false, error: "주문 ID가 필요합니다." });
    return;
  }

  const result = await admin.firestore().runTransaction(async (transaction) => {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const currentBalance = userSnap.data()?.pointBalance ?? 0;
    const newBalance = currentBalance + amount;

    transaction.update(userRef, { pointBalance: newBalance });

    transaction.set(userRef.collection("pointHistory").doc(), {
      type: "refund",
      amount,
      description: description || "포인트 환불",
      orderId,
      date: admin.firestore.FieldValue.serverTimestamp(),
      balanceAfter: newBalance,
    });

    return { newBalance, refundedAmount: amount };
  });

  res.status(200).json({ success: true, data: result });
}

/* ────────── 포인트 사용 ────────── */

async function handleUse(
  userId: string,
  data: { amount?: number; description?: string; orderId?: string },
  res: any
): Promise<void> {
  const { amount, description, orderId } = data;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, error: "사용할 포인트는 0보다 커야 합니다." });
    return;
  }
  if (!orderId) {
    res.status(400).json({ success: false, error: "주문 ID가 필요합니다." });
    return;
  }

  const result = await admin.firestore().runTransaction(async (transaction) => {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const currentBalance = userSnap.data()?.pointBalance ?? 0;

    if (currentBalance < amount) {
      throw new Error(`보유 포인트가 부족합니다. (보유: ${currentBalance})`);
    }

    const newBalance = currentBalance - amount;

    transaction.update(userRef, { pointBalance: newBalance });

    transaction.set(userRef.collection("pointHistory").doc(), {
      type: "use",
      amount,
      description: description || "포인트 사용",
      orderId,
      date: admin.firestore.FieldValue.serverTimestamp(),
      balanceAfter: newBalance,
    });

    return { newBalance, usedAmount: amount };
  });

  res.status(200).json({ success: true, data: result });
}

/* ────────── 포인트 잔액 조회 ────────── */

async function handleBalance(userId: string, res: any): Promise<void> {
  const userDoc = await admin.firestore().collection("users").doc(userId).get();

  if (!userDoc.exists) {
    res.status(404).json({ success: false, error: "사용자 정보를 찾을 수 없습니다." });
    return;
  }

  const pointBalance = userDoc.data()?.pointBalance ?? 0;
  res.status(200).json({ success: true, data: { pointBalance } });
}

/* ────────── 포인트 내역 조회 ────────── */

async function handleHistory(
  userId: string,
  data: { limit?: number; lastDocId?: string },
  res: any
): Promise<void> {
  const limitCount = data.limit ?? 50;

  let queryRef = admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("pointHistory")
    .orderBy("date", "desc")
    .limit(limitCount);

  if (data.lastDocId) {
    const lastDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("pointHistory")
      .doc(data.lastDocId)
      .get();

    if (lastDoc.exists) {
      queryRef = queryRef.startAfter(lastDoc);
    }
  }

  const snapshot = await queryRef.get();

  const history = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.status(200).json({
    success: true,
    data: {
      history,
      hasMore: snapshot.docs.length === limitCount,
      lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
    },
  });
}
