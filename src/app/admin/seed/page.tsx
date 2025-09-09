"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";
import styles from "./page.module.css";

export default function AdminSeedPage() {
  const router = useRouter();
  const { user, isUserDataLoading, loading, isAdmin } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<string[]>([]);

  // 권한 체크 및 로딩 상태
  if (loading || isUserDataLoading) {
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
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
          <p>권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않았거나 관리자가 아닌 경우
  if (!user || !isAdmin) {
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
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚫</div>
          <p>관리자 권한이 필요합니다.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResults([]);
    
    try {
      // 실제 시드 데이터 로직을 여기에 구현
      setSeedResults(['시드 데이터 기능은 개발 중입니다.']);
    } catch (error) {
      console.error('Seed data error:', error);
      setSeedResults(['시드 데이터 생성 중 오류가 발생했습니다.']);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>데이터 시드</h1>
        <p>개발용 테스트 데이터를 생성합니다.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.warning}>
          <h3>⚠️ 주의사항</h3>
          <p>이 기능은 개발 환경에서만 사용하세요. 기존 데이터가 덮어씌워질 수 있습니다.</p>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className={styles.seedButton}
          >
            {isSeeding ? '생성 중...' : '시드 데이터 생성'}
          </button>
        </div>

        {seedResults.length > 0 && (
          <div className={styles.results}>
            <h3>결과</h3>
            <ul>
              {seedResults.map((result, index) => (
                <li key={index}>{result}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}