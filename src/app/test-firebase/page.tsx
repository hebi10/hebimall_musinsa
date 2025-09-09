'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

export default function FirebaseTestPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('🔍 Firebase 연결 테스트 시작...');
        setLoading(true);
        setError(null);

        // users 컬렉션 조회
        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log(`📊 조회된 사용자 수: ${usersSnapshot.size}`);
        
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('👥 사용자 데이터:', usersData);
        setUsers(usersData);
        
      } catch (err) {
        console.error('❌ Firebase 오류:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    testFirebase();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Firebase 연결 테스트</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Firebase 연결 테스트</h1>
        <p style={{ color: 'red' }}>오류: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Firebase 연결 테스트</h1>
      <p>총 {users.length}명의 사용자가 조회되었습니다.</p>
      
      {users.length === 0 ? (
        <p>사용자 데이터가 없습니다.</p>
      ) : (
        <div>
          <h2>사용자 목록:</h2>
          {users.map((user) => (
            <div key={user.id} style={{ 
              border: '1px solid #ccc', 
              margin: '10px 0', 
              padding: '10px',
              borderRadius: '5px' 
            }}>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>이름:</strong> {user.name || user.displayName || '없음'}</p>
              <p><strong>이메일:</strong> {user.email || '없음'}</p>
              <p><strong>역할:</strong> {user.role || '없음'}</p>
              <p><strong>상태:</strong> {user.status || '없음'}</p>
              {user.id === 'TVQTUGzParcYqdSwcXHw90YCgTS2' && (
                <p style={{ color: 'red' }}><strong>🔴 관리자 계정 확인됨!</strong></p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
