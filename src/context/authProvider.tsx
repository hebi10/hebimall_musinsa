"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import { 
  logout as firebaseLogout, 
  signIn as firebaseSignIn, 
  signUp as firebaseSignUp  
} from "../libs/firebase/auth";
import { useUserData } from "../hooks/useUserData";
import { getErrorMessage } from "../utils/authErrorMessages";

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
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  const [isAdmin, setIsAdmin] = useState(false);
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

  const userData = useUserData(user?.uid || "");

  useEffect(() => {
    if (!loading && !user && pathname !== "/auth/login") {
      router.replace("/auth/login");
    } else if (!loading && user && pathname === "/auth/login") {
      router.replace("/mypage");
    }
  }, [user, loading, pathname]);

  useEffect(() => {
    if (userData?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userData]);

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, userData, loading, isAdmin, error, clearError }}>
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
