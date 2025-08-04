"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/authProvider";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 관리자 권한 체크
    if (!user) {
      // 로그인이 필요한 경우
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      // 관리자 권한이 없는 경우
      router.replace("/");
      return;
    }

    // 관리자인 경우 대시보드로 리다이렉트
    router.replace("/admin/dashboard");
  }, [router, user]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
        <p>관리자 페이지로 이동중...</p>
      </div>
    </div>
  );
}
