"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthUser } from "../shared/hooks/useAuthUser";
import { 
  logout as firebaseLogout, 
  loginOneSession as firebaseSignIn, 
  loginKeepAlive as firebaseLoginKeepAlive, 
  signUp as firebaseSignUp  
} from "../shared/libs/firebase/auth";
import { useUserData } from "../shared/hooks/useUserData";
import { getErrorMessage } from "../shared/utils/authErrorMessages";
import { db } from "../shared/libs/firebase/firebase";

interface AuthContextType {
  user: any;
  login: (email: string, password: string, keepAlive: boolean) => Promise<any>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<any>;
  loading: boolean;
  userData: any;
  isAdmin: boolean;
  error: string | null;
  clearError: () => void;
  isUserDataLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  loading: true,
  userData: null,
  isAdmin: false,
  error: null,
  clearError: () => {},
  isUserDataLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const login = async (email: string, password: string, keepAlive: boolean) => {
    try {
      setError(null);
      let userCredential;
      
      if (keepAlive) {
        userCredential = await firebaseLoginKeepAlive(email, password);
      } else {
        userCredential = await firebaseSignIn(email, password);
      }
      
      // 로그인 성공 후 사용자 상태 확인
      const userDoc = await import('firebase/firestore').then(module => 
        module.getDoc(module.doc(db, 'users', userCredential.user.uid))
      );
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 사용자 상태 확인
        if (userData.status === 'inactive') {
          // 비활성화된 사용자인 경우 로그아웃 처리
          await firebaseLogout();
          throw new Error('ACCOUNT_INACTIVE');
        }
        
        if (userData.status === 'banned') {
          // 정지된 사용자인 경우 로그아웃 처리
          await firebaseLogout();
          throw new Error('ACCOUNT_BANNED');
        }
      }
      
      return userCredential;
    } catch (err: any) {
      let errorMessage;
      
      if (err.message === 'ACCOUNT_INACTIVE') {
        errorMessage = '이용이 중지된 사용자입니다. 관리자에게 문의하세요.';
      } else if (err.message === 'ACCOUNT_BANNED') {
        errorMessage = '정지된 계정입니다. 관리자에게 문의하세요.';
      } else {
        errorMessage = getErrorMessage(err.code);
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
      // Next.js router 대신 window.location을 사용하여 강제 페이지 이동
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // 에러가 발생해도 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      return await firebaseSignUp(email, password);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const { data: userData, isLoading: userDataLoading } = useUserData(user?.uid || "");

  useEffect(() => {
    const loginRedirect = !loading && !user && pathname !== "/auth/login" && !pathname.startsWith("/admin") && pathname.includes("/mypage");
    const userRedirect = !loading && user && !pathname.startsWith("/admin") && pathname === "/auth/login";

    if (loginRedirect) {
      router.replace("/auth/login");
    } else if (userRedirect) {
      router.replace("/mypage");
    }
  }, [user, loading, pathname, router]);

  // 관리자 권한 체크
  useEffect(() => {
    if (user && userData !== undefined) { // userData가 로드 완료되었을 때만
      if (userData?.role === 'admin') {
        setIsAdmin(true);
      } else {
        console.log('❌ 일반 사용자:', userData?.email || 'Unknown');
        setIsAdmin(false);
      }
    } else if (!user) {
      setIsAdmin(false); // 로그아웃 시 권한 리셋
    }
    
    setIsUserDataLoading(userDataLoading || loading);
  }, [user, userData, userDataLoading, loading]);

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, userData, loading, isUserDataLoading, isAdmin, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProvider에서 벗어났습니다.");
  }
  return context;
}
