import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import type { Response } from "express";
import { randomBytes } from "crypto";
import {
  ensureString,
  hashQnAPassword,
  QnARecord,
  toSafeQnA,
  verifyQnASecret,
} from "../domain/qnaDomain";
import { AuthError, verifyAuthContext } from "../utils/auth";

interface VerifySecretRequest {
  qnaId?: unknown;
  password?: unknown;
}

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function applyNoStoreHeaders(res: Response): void {
  Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
    res.set(key, value);
  });
}

export const qna = onRequest(
  {
    cors: true,
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    applyNoStoreHeaders(res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    const body = req.body as VerifySecretRequest;
    const qnaId = ensureString(body.qnaId);

    if (!qnaId) {
      res.status(400).json({ success: false, error: "qnaId is required." });
      return;
    }

    try {
      let actorUid: string | undefined;
      let actorIsAdmin = false;

      if (req.headers.authorization) {
        try {
          const actorContext = await verifyAuthContext(req.headers.authorization);
          actorUid = actorContext.uid;
          actorIsAdmin = actorContext.isAdmin;
        } catch (error) {
          if (!(error instanceof AuthError) || error.statusCode !== 401) {
            throw error;
          }
        }
      }

      const qnaRef = admin.firestore().collection("qna").doc(qnaId);
      const qnaSnapshot = await qnaRef.get();
      if (!qnaSnapshot.exists) {
        res.status(404).json({ success: false, error: "Question not found." });
        return;
      }

      const qnaData = qnaSnapshot.data() as QnARecord;
      const isSecret = qnaData.isSecret === true;
      const password = ensureString(body.password);
      const actorUidFromData = ensureString(qnaData.userId);
      const isOwner = actorUid === actorUidFromData;

      if (isSecret) {
        const isOwnerOrAdmin = actorIsAdmin || isOwner;
        const hasAccess = isOwnerOrAdmin || verifyQnASecret(qnaData, password);

        if (!hasAccess) {
          res.status(401).json({
            success: false,
            needsPassword: true,
            error: "비밀번호가 일치하지 않습니다.",
          });
          return;
        }

        // legacy migration: migrate plain password to salted hash (single time)
        const legacyPassword = ensureString(qnaData.password);
        if (password && legacyPassword && !ensureString(qnaData.passwordHash) && !ensureString(qnaData.passwordSalt)) {
          const salt = randomBytes(16).toString("base64");
          const passwordHash = hashQnAPassword(password, salt);
          await qnaRef.update({
            passwordHash,
            passwordSalt: salt,
            password: admin.firestore.FieldValue.delete(),
          });
        }

        await qnaRef.update({
          views: admin.firestore.FieldValue.increment(1),
        });
        res.status(200).json({ success: true, qna: toSafeQnA(qnaId, qnaData) });
        return;
      }

      await qnaRef.update({
        views: admin.firestore.FieldValue.increment(1),
      });
      res.status(200).json({ success: true, qna: toSafeQnA(qnaId, qnaData) });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }

      console.error("QnA verify error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);
