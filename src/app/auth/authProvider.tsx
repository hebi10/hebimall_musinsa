"use client";
import { createContext, Dispatch, SetStateAction, use, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  logout: () => void;
  setUser: Dispatch<SetStateAction<any>>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 로그인 상태 관리
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    setLoading(true);
    setUser({ role: "admin" }); // 예시: user 객체가 없으면 null로 설정
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
