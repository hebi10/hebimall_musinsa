import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { verifyAuth, AuthError } from "../utils/auth";

/** Firestore 인스턴스 (레이지 초기화) */
function getDb() {
  return getFirestore();
}

/**
 * POST /coupon
 *
 * 통합 쿠폰 API
 * body.action: "register" | "issue" | "use" | "cleanup"
 */
export const coupon = onRequest(
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
        case "register":
          await handleRegister(userId, payload, res);
          return;
        case "issue":
          await handleIssue(userId, payload, res);
          return;
        case "use":
          await handleUse(userId, payload, res);
          return;
        case "cleanup":
          await handleCleanup(res);
          return;
        default:
          res.status(400).json({ success: false, error: `유효하지 않은 action: ${action}` });
      }
    } catch (error: any) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      console.error("Coupon API error:", error);
      res.status(500).json({ success: false, error: error.message || "서버 내부 오류" });
    }
  }
);

/* ────────── 쿠폰 코드 등록 ────────── */

async function handleRegister(
  userId: string,
  data: { couponCode?: string },
  res: any
): Promise<void> {
  const { couponCode } = data;

  if (!couponCode) {
    res.status(400).json({ success: false, error: "쿠폰 코드가 필요합니다." });
    return;
  }

  const db = getDb();

  // 1. 쿠폰 코드로 쿠폰 마스터 찾기
  const couponQuery = await db
    .collection("coupons")
    .where("couponCode", "==", couponCode.toUpperCase())
    .where("isActive", "==", true)
    .where("isDirectAssign", "==", false)
    .get();

  if (couponQuery.empty) {
    res.status(404).json({ success: false, error: "올바르지 않은 쿠폰 코드입니다." });
    return;
  }

  const couponDoc = couponQuery.docs[0];
  const couponData = couponDoc.data();
  const couponId = couponDoc.id;

  // 사용 제한 확인
  if (couponData.usageLimit && couponData.usedCount >= couponData.usageLimit) {
    res.status(409).json({ success: false, error: "쿠폰 사용 한도가 초과되었습니다." });
    return;
  }

  // 만료일 확인
  const expiryDate = new Date(couponData.expiryDate);
  if (expiryDate < new Date()) {
    res.status(410).json({ success: false, error: "만료된 쿠폰 코드입니다." });
    return;
  }

  // 중복 발급 확인
  const existing = await db
    .collection("user_coupons")
    .where("uid", "==", userId)
    .where("couponId", "==", couponId)
    .get();

  if (!existing.empty) {
    res.status(409).json({ success: false, error: "이미 등록된 쿠폰입니다." });
    return;
  }

  // 쿠폰 등록
  const today = new Date().toISOString().split("T")[0];
  const userCouponRef = await db.collection("user_coupons").add({
    uid: userId,
    couponId,
    status: "사용가능",
    issuedDate: today,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 사용 횟수 증가
  await db.collection("coupons").doc(couponId).update({
    usedCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  res.status(200).json({
    success: true,
    data: {
      message: "쿠폰이 성공적으로 등록되었습니다.",
      userCouponId: userCouponRef.id,
      couponName: couponData.name,
      couponCode,
    },
  });
}

/* ────────── 쿠폰 발급 ────────── */

async function handleIssue(
  userId: string,
  data: { couponId?: string },
  res: any
): Promise<void> {
  const { couponId } = data;

  if (!couponId) {
    res.status(400).json({ success: false, error: "쿠폰 ID가 필요합니다." });
    return;
  }

  const db = getDb();

  // 쿠폰 마스터 확인
  const couponDoc = await db.collection("coupons").doc(couponId).get();
  if (!couponDoc.exists) {
    res.status(404).json({ success: false, error: "존재하지 않는 쿠폰입니다." });
    return;
  }

  const couponData = couponDoc.data();
  if (!couponData?.isActive) {
    res.status(403).json({ success: false, error: "발급이 중단된 쿠폰입니다." });
    return;
  }

  // 중복 발급 확인
  const existing = await db
    .collection("user_coupons")
    .where("uid", "==", userId)
    .where("couponId", "==", couponId)
    .get();

  if (!existing.empty) {
    res.status(409).json({ success: false, error: "이미 발급받은 쿠폰입니다." });
    return;
  }

  // 발급
  const today = new Date().toISOString().split("T")[0];
  const userCouponRef = await db.collection("user_coupons").add({
    uid: userId,
    couponId,
    status: "사용가능",
    issuedDate: today,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  res.status(200).json({
    success: true,
    data: {
      message: "쿠폰이 성공적으로 발급되었습니다.",
      userCouponId: userCouponRef.id,
      couponName: couponData.name,
    },
  });
}

/* ────────── 쿠폰 사용 ────────── */

async function handleUse(
  userId: string,
  data: { userCouponId?: string; orderId?: string },
  res: any
): Promise<void> {
  const { userCouponId, orderId } = data;

  if (!userCouponId || !orderId) {
    res.status(400).json({ success: false, error: "유저쿠폰 ID와 주문 ID가 필요합니다." });
    return;
  }

  const db = getDb();

  // 유저쿠폰 확인
  const userCouponDoc = await db.collection("user_coupons").doc(userCouponId).get();
  if (!userCouponDoc.exists) {
    res.status(404).json({ success: false, error: "존재하지 않는 쿠폰입니다." });
    return;
  }

  const userCoupon = userCouponDoc.data();
  if (userCoupon?.uid !== userId) {
    res.status(403).json({ success: false, error: "본인의 쿠폰만 사용할 수 있습니다." });
    return;
  }

  if (userCoupon?.status !== "사용가능") {
    res.status(409).json({ success: false, error: "사용할 수 없는 쿠폰입니다." });
    return;
  }

  // 만료일 확인
  const couponDoc = await db.collection("coupons").doc(userCoupon.couponId).get();
  if (!couponDoc.exists) {
    res.status(404).json({ success: false, error: "쿠폰 정보를 찾을 수 없습니다." });
    return;
  }

  const couponData = couponDoc.data();
  const expiryDate = new Date(couponData?.expiryDate);
  const today = new Date();

  if (expiryDate < today) {
    await db.collection("user_coupons").doc(userCouponId).update({
      status: "기간만료",
      expiredDate: today.toISOString().split("T")[0],
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.status(410).json({ success: false, error: "만료된 쿠폰입니다." });
    return;
  }

  // 사용 처리
  const usedDate = today.toISOString().split("T")[0];
  await db.collection("user_coupons").doc(userCouponId).update({
    status: "사용완료",
    usedDate,
    orderId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  res.status(200).json({
    success: true,
    data: {
      message: "쿠폰이 성공적으로 사용되었습니다.",
      userCouponId,
      couponName: couponData?.name,
      usedDate,
      orderId,
    },
  });
}

/* ────────── 만료 쿠폰 정리 ────────── */

async function handleCleanup(res: any): Promise<void> {
  const db = getDb();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const expiredUserCoupons = await db
    .collection("user_coupons")
    .where("status", "==", "사용가능")
    .get();

  const batch = db.batch();
  let updateCount = 0;

  for (const userCouponDoc of expiredUserCoupons.docs) {
    const userCoupon = userCouponDoc.data();

    const couponDoc = await db.collection("coupons").doc(userCoupon.couponId).get();
    if (!couponDoc.exists) continue;

    const couponData = couponDoc.data();
    const expiryDate = new Date(couponData?.expiryDate);

    if (expiryDate < today) {
      batch.update(userCouponDoc.ref, {
        status: "기간만료",
        expiredDate: todayStr,
        updatedAt: FieldValue.serverTimestamp(),
      });
      updateCount++;
    }
  }

  if (updateCount > 0) {
    await batch.commit();
  }

  res.status(200).json({
    success: true,
    data: { message: `${updateCount}개의 만료된 쿠폰을 정리했습니다.` },
  });
}
