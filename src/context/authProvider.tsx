"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthUser } from "../shared/hooks/useAuthUser";
import { 
  logout as firebaseLogout, 
  signIn as firebaseSignIn, 
  signUp as firebaseSignUp  
} from "../shared/libs/firebase/auth";
import { useUserData } from "../shared/hooks/useUserData";
import { getErrorMessage } from "../shared/utils/authErrorMessages";

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
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
  logout: () => {},
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

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      return await firebaseSignIn(email, password);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => firebaseLogout();
  
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
    // 일반 사용자 로그인 리다이렉트만 처리 (admin 페이지는 제외)
    if (!loading && !user && pathname !== "/auth/login" && !pathname.startsWith("/admin")) {
      router.replace("/auth/login");
    } else if (!loading && user && !pathname.startsWith("/admin") && pathname === "/auth/login") {
      router.replace("/mypage");
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (userData?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    // userDataLoading 상태를 사용하여 정확한 로딩 상태 관리
    setIsUserDataLoading(userDataLoading || loading);
  }, [userData, userDataLoading, loading]);

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
