import * as admin from "firebase-admin";

/**
 * 공통 API 응답 포맷
 */
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Authorization 헤더에서 Firebase Auth ID 토큰을 검증하고 uid를 반환
 */
export async function verifyAuth(authHeader: string | undefined): Promise<string> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError(401, "인증 토큰이 필요합니다.");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    throw new AuthError(401, "유효하지 않은 인증 토큰입니다.");
  }
}

/**
 * 인증 오류 클래스
 */
export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}
