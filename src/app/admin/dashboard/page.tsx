"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authProvider';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isUserDataLoading } = useAuth();

  useEffect(() => {
    if (loading || isUserDataLoading) {
      return;
    }

    if (!user) {
      return;
    }

    router.replace('/admin/dashboard/dashboard');
  }, [router, user, loading, isUserDataLoading]);

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
        <p>관리자 페이지를 이동 중입니다.</p>
      </div>
    </div>
  );
}
