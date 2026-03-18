import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { verifyAuth, requireAdmin, AuthError } from "../utils/auth";

function getDb() {
  return getFirestore();
}

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
      const { action, ...payload } = req.body;

      switch (action) {
        case "register": {
          const userId = await verifyAuth(req.headers.authorization);
          await handleRegister(userId, payload, res);
          return;
        }
        case "issue": {
          const userId = await verifyAuth(req.headers.authorization);
          await handleIssue(userId, payload, res);
          return;
        }
        case "use": {
          const userId = await verifyAuth(req.headers.authorization);
          await handleUse(userId, payload, res);
          return;
        }
        case "cleanup":
          await requireAdmin(req.headers.authorization);
          await handleCleanup(res);
          return;
        default:
          res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
      }
    } catch (error: any) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }

      console.error("Coupon API error:", error);
      res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
  }
);

async function handleRegister(
  userId: string,
  data: { couponCode?: string },
  res: any
): Promise<void> {
  const { couponCode } = data;

  if (!couponCode) {
    res.status(400).json({ success: false, error: "couponCode is required." });
    return;
  }

  const db = getDb();
  const couponQuery = await db
    .collection("coupons")
    .where("couponCode", "==", couponCode.toUpperCase())
    .where("isActive", "==", true)
    .where("isDirectAssign", "==", false)
    .get();

  if (couponQuery.empty) {
    res.status(404).json({ success: false, error: "Coupon code was not found." });
    return;
  }

  const couponDoc = couponQuery.docs[0];
  const couponData = couponDoc.data();
  const couponId = couponDoc.id;

  if (couponData.usageLimit && couponData.usedCount >= couponData.usageLimit) {
    res.status(409).json({ success: false, error: "Coupon usage limit has been reached." });
    return;
  }

  const expiryDate = new Date(couponData.expiryDate);
  if (expiryDate < new Date()) {
    res.status(410).json({ success: false, error: "Coupon has expired." });
    return;
  }

  const existing = await db
    .collection("user_coupons")
    .where("uid", "==", userId)
    .where("couponId", "==", couponId)
    .get();

  if (!existing.empty) {
    res.status(409).json({ success: false, error: "Coupon already registered for this user." });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const userCouponRef = await db.collection("user_coupons").add({
    uid: userId,
    couponId,
    status: "사용가능",
    issuedDate: today,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("coupons").doc(couponId).update({
    usedCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  res.status(200).json({
    success: true,
    data: {
      message: "Coupon registered successfully.",
      userCouponId: userCouponRef.id,
      couponName: couponData.name,
      couponCode,
    },
  });
}

async function handleIssue(
  userId: string,
  data: { couponId?: string },
  res: any
): Promise<void> {
  const { couponId } = data;

  if (!couponId) {
    res.status(400).json({ success: false, error: "couponId is required." });
    return;
  }

  const db = getDb();
  const couponDoc = await db.collection("coupons").doc(couponId).get();

  if (!couponDoc.exists) {
    res.status(404).json({ success: false, error: "Coupon does not exist." });
    return;
  }

  const couponData = couponDoc.data();
  if (!couponData?.isActive) {
    res.status(403).json({ success: false, error: "Coupon is inactive." });
    return;
  }

  const existing = await db
    .collection("user_coupons")
    .where("uid", "==", userId)
    .where("couponId", "==", couponId)
    .get();

  if (!existing.empty) {
    res.status(409).json({ success: false, error: "Coupon already issued for this user." });
    return;
  }

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
      message: "Coupon issued successfully.",
      userCouponId: userCouponRef.id,
      couponName: couponData.name,
    },
  });
}

async function handleUse(
  userId: string,
  data: { userCouponId?: string; orderId?: string },
  res: any
): Promise<void> {
  const { userCouponId, orderId } = data;

  if (!userCouponId || !orderId) {
    res.status(400).json({ success: false, error: "userCouponId and orderId are required." });
    return;
  }

  const db = getDb();
  const userCouponDoc = await db.collection("user_coupons").doc(userCouponId).get();

  if (!userCouponDoc.exists) {
    res.status(404).json({ success: false, error: "User coupon does not exist." });
    return;
  }

  const userCoupon = userCouponDoc.data();
  if (userCoupon?.uid !== userId) {
    res.status(403).json({ success: false, error: "You can only use your own coupons." });
    return;
  }

  if (userCoupon?.status !== "사용가능") {
    res.status(409).json({ success: false, error: "Coupon is not available." });
    return;
  }

  const couponDoc = await db.collection("coupons").doc(userCoupon.couponId).get();
  if (!couponDoc.exists) {
    res.status(404).json({ success: false, error: "Coupon master document does not exist." });
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
    res.status(410).json({ success: false, error: "Coupon has expired." });
    return;
  }

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
      message: "Coupon used successfully.",
      userCouponId,
      couponName: couponData?.name,
      usedDate,
      orderId,
    },
  });
}

async function handleCleanup(res: any): Promise<void> {
  const db = getDb();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const expiredUserCoupons = await db.collection("user_coupons").where("status", "==", "사용가능").get();
  const batch = db.batch();
  let updateCount = 0;

  for (const userCouponDoc of expiredUserCoupons.docs) {
    const userCoupon = userCouponDoc.data();
    const couponDoc = await db.collection("coupons").doc(userCoupon.couponId).get();

    if (!couponDoc.exists) {
      continue;
    }

    const couponData = couponDoc.data();
    const expiryDate = new Date(couponData?.expiryDate);

    if (expiryDate < today) {
      batch.update(userCouponDoc.ref, {
        status: "기간만료",
        expiredDate: todayStr,
        updatedAt: FieldValue.serverTimestamp(),
      });
      updateCount += 1;
    }
  }

  if (updateCount > 0) {
    await batch.commit();
  }

  res.status(200).json({
    success: true,
    data: { message: `${updateCount} expired coupons were updated.` },
  });
}
