import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

// 회원가입
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// 로그인
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// 로그아웃
export async function logOut() {
  return signOut(auth);
}