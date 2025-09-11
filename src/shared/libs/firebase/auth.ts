import { auth } from "./firebase";
import { 
  browserSessionPersistence,
  createUserWithEmailAndPassword, 
  setPersistence, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from "firebase/auth";

// 회원가입
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// 로그인 상태 유지
export async function loginKeepAlive(email: string, password: string) {
  await setPersistence(auth, browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

// 창 닫으면 로그아웃되는 로그인
export async function loginOneSession(email: string, password: string) {
  await setPersistence(auth, browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

// 로그아웃
export async function logout() {
  return signOut(auth);
}

// 비밀번호 재설정 이메일 전송
export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// 비밀번호 재설정 코드 확인
export async function verifyResetCode(code: string) {
  return verifyPasswordResetCode(auth, code);
}

// 비밀번호 재설정 완료
export async function confirmPasswordResetWithCode(code: string, newPassword: string) {
  return confirmPasswordReset(auth, code, newPassword);
}