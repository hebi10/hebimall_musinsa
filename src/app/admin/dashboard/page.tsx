"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";

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

    // 관리자인 경우 실제 대시보드로 리다이렉트
    router.replace("/admin/dashboard/dashboard");
  }, [router, user]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f4f5f7',
      color: '#172b4d',
      fontSize: '0.875rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p>관리자 페이지로 이동중...</p>
      </div>
    </div>
  );
}
