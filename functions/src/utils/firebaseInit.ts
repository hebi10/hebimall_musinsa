import * as admin from "firebase-admin";

/**
 * Firebase Admin SDK 초기화
 * 모든 핸들러보다 먼저 import 되어야 합니다.
 */
admin.initializeApp();

export { admin };
