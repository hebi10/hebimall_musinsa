import * as admin from "firebase-admin";

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AuthContext {
  uid: string;
  token: admin.auth.DecodedIdToken;
  role?: string;
  isAdmin: boolean;
}

export async function verifyAuthContext(authHeader: string | undefined): Promise<AuthContext> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError(401, "Authentication token is required.");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const role = decodedToken.role as string | undefined;
    const isAdmin = decodedToken.admin === true || role === "admin";

    return {
      uid: decodedToken.uid,
      token: decodedToken,
      role,
      isAdmin,
    };
  } catch {
    throw new AuthError(401, "Invalid authentication token.");
  }
}

export async function verifyAuth(authHeader: string | undefined): Promise<string> {
  const context = await verifyAuthContext(authHeader);
  return context.uid;
}

export async function requireAdmin(authHeader: string | undefined): Promise<AuthContext> {
  const context = await verifyAuthContext(authHeader);
  if (!context.isAdmin) {
    throw new AuthError(403, "Admin privileges are required.");
  }

  return context;
}

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}
