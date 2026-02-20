import { onRequest } from "firebase-functions/v2/https";
import { getEnvironmentConfig, getFirebaseConfig } from "../config/environment";

/**
 * GET /config
 *
 * 클라이언트 환경변수 제공 (getClientConfig + getFirebaseClientConfig 통합)
 * 쿼리 파라미터 type=firebase 시 Firebase Config만 반환
 */
export const config = onRequest(
  {
    cors: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://hebimall.firebaseapp.com",
      "https://hebimall.web.app",
    ],
    region: "us-central1",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    try {
      const type = req.query.type as string | undefined;

      if (type === "firebase") {
        // getFirebaseClientConfig 대체
        const firebaseConfig = getFirebaseConfig();
        res.status(200).json({ success: true, data: firebaseConfig });
        return;
      }

      // getClientConfig 대체 (기본)
      const envConfig = getEnvironmentConfig();
      res.status(200).json({
        success: true,
        data: {
          firebase: envConfig.firebase,
          api: { baseUrl: envConfig.api.baseUrl },
          development: {
            nodeEnv: envConfig.development.nodeEnv,
            useFirebaseEmulator: envConfig.development.useFirebaseEmulator,
          },
        },
      });
    } catch (error: any) {
      console.error("Config API error:", error);
      res.status(500).json({ success: false, error: "환경변수를 불러올 수 없습니다." });
    }
  }
);
