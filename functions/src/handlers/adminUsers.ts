import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { requireAdmin, AuthError } from "../utils/auth";
import { applyNoStoreHeaders } from "../utils/http";

type UserRole = "user" | "admin";

interface SetRolePayload {
  action?: string;
  userId?: string;
  role?: UserRole;
}

function assertValidRole(role: unknown): role is UserRole {
  return role === "user" || role === "admin";
}

export const adminUsers = onRequest(
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

    try {
      await requireAdmin(req.headers.authorization);

      const { action, userId, role } = req.body as SetRolePayload;
      if (action !== "setRole") {
        res.status(400).json({ success: false, error: `Unsupported action: ${action}` });
        return;
      }

      if (!userId || !assertValidRole(role)) {
        res.status(400).json({ success: false, error: "userId and valid role are required." });
        return;
      }

      const authUser = await admin.auth().getUser(userId);
      const nextClaims: Record<string, unknown> = { ...(authUser.customClaims || {}), role };

      if (role === "admin") {
        nextClaims.admin = true;
      } else {
        delete nextClaims.admin;
      }

      await admin.auth().setCustomUserClaims(userId, nextClaims);
      await admin.firestore().collection("users").doc(userId).set(
        {
          role,
          isAdmin: role === "admin",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      res.status(200).json({
        success: true,
        data: {
          userId,
          role,
          claims: nextClaims,
        },
      });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }

      console.error("Admin users API error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
);
