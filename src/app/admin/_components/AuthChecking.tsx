'use client';

import { useAuth } from '@/context/authProvider';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

interface AuthCheckingProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthChecking({ children, fallback }: AuthCheckingProps) {
  const { user, userData, isAdmin, loading: authLoading, isUserDataLoading } = useAuth();

  // 로딩 중
  if (authLoading || isUserDataLoading) {
    return fallback || (
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
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
          <p>권한을 확인하는 중...</p>
          <small style={{ opacity: 0.8 }}>
            인증: {authLoading ? '확인 중' : '완료'}, 
            사용자 데이터: {isUserDataLoading ? '로딩 중' : '완료'}
          </small>
        </div>
      </div>
    );
  }

  // 로그인하지 않았으면 로그인 페이지로
  if (!user) {
    console.log('❌ 로그인되지 않음 - 로그인 페이지로 이동');
    redirect('/auth/login');
    return null;
  }

  // 사용자 데이터가 없는 경우 (Firebase 에러 등)
  if (userData === undefined) {
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
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <p>사용자 정보를 불러올 수 없습니다.</p>
          <small style={{ color: '#666' }}>페이지를 새로고침하거나 다시 로그인해주세요.</small>
        </div>
      </div>
    );
  }

  // 관리자가 아니면
  if (!isAdmin) {
    console.log('❌ 관리자 권한 없음 - 현재 역할:', userData?.role);
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
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>�</div>
          <p>관리자 권한이 필요합니다.</p>
          <small style={{ color: '#666' }}>
            현재 역할: {userData?.role || '확인 중'}
          </small>
        </div>
      </div>
    );
  }

  console.log('✅ 관리자 권한 확인 완료');
  return <>{children}</>;
}