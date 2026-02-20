import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

/**
 * 포인트 만료 처리 (매일 자정 KST)
 *
 * 6개월 이상 경과한 적립 포인트를 만료 처리하고
 * 사용자 잔액에서 차감합니다.
 */
export const expirePoints = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Seoul",
    region: "us-central1",
  },
  async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const expiredPointsQuery = await admin
        .firestore()
        .collectionGroup("pointHistory")
        .where("type", "==", "earn")
        .where("date", "<", sixMonthsAgo)
        .where("expired", "==", false)
        .get();

      const batch = admin.firestore().batch();
      const userPointUpdates = new Map<string, number>();

      expiredPointsQuery.docs.forEach((doc) => {
        const data = doc.data();
        const userId = doc.ref.parent.parent?.id;

        if (userId) {
          batch.update(doc.ref, { expired: true });

          const currentExpired = userPointUpdates.get(userId) || 0;
          userPointUpdates.set(userId, currentExpired + data.amount);
        }
      });

      for (const [userId, expiredAmount] of userPointUpdates) {
        const userRef = admin.firestore().collection("users").doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const currentBalance = userDoc.data()?.pointBalance || 0;
          const newBalance = Math.max(0, currentBalance - expiredAmount);

          batch.update(userRef, { pointBalance: newBalance });

          const pointHistoryRef = userRef.collection("pointHistory").doc();
          batch.set(pointHistoryRef, {
            type: "expire",
            amount: expiredAmount,
            description: "포인트 만료 (6개월 경과)",
            date: admin.firestore.FieldValue.serverTimestamp(),
            balanceAfter: newBalance,
          });
        }
      }

      await batch.commit();

      const totalExpired = Array.from(userPointUpdates.values()).reduce((a, b) => a + b, 0);
      console.log(
        `포인트 만료 처리 완료: ${userPointUpdates.size}명, 총 ${totalExpired} 포인트 만료`
      );
    } catch (error) {
      console.error("포인트 만료 처리 실패:", error);
      throw error;
    }
  }
);
