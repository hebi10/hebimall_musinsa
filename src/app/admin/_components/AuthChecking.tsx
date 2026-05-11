'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@/context/authProvider';

interface AuthCheckingProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthChecking({ children, fallback }: AuthCheckingProps) {
  const { user, isAdmin, loading: authLoading, isUserDataLoading } = useAuth();

  if (authLoading || isUserDataLoading) {
    return (
      fallback || (
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
            <p>관리자 페이지 접근 권한을 확인 중입니다.</p>
            <small style={{ opacity: 0.8 }}>
              인증: {authLoading ? '로딩 중' : '완료'}, 사용자정보: {isUserDataLoading ? '로딩 중' : '완료'}
            </small>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '0.75rem',
        height: '100vh',
        background: '#f8f9fa',
        color: '#1f2937',
        fontSize: '1.1rem'
      }}>
        <p>로그인이 필요합니다.</p>
        <Link
          href="/auth/login"
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none'
          }}
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8f9fa',
        color: '#dc3545',
        fontSize: '1.1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>관리자 권한이 없습니다.</p>
          <small style={{ color: '#666' }}>
            관리자 계정으로 로그인 후 접근해 주세요.
          </small>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
