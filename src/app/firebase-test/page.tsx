'use client';

import { useState } from 'react';
import { CategoryService } from '@/shared/services/categoryService';

export default function FirebaseTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResult('Firebase 연결 테스트 중...');

    try {
      console.log('🔧 Firebase 연결 테스트 시작');
      
      // 카테고리 서비스 테스트
      const categories = await CategoryService.getCategories();
      
      setTestResult(`✅ 성공! ${categories.length}개의 카테고리를 불러왔습니다.\n\n${JSON.stringify(categories, null, 2)}`);
    } catch (error) {
      console.error('Firebase 테스트 에러:', error);
      setTestResult(`❌ 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const seedCategories = async () => {
    setLoading(true);
    setTestResult('카테고리 시드 데이터 생성 중...');

    try {
      // 시드 데이터 실행을 위한 서버리스 함수 호출 또는 직접 생성
      const categories = [
        {
          name: '상의',
          slug: 'tops',
          path: '/categories/tops',
          description: '티셔츠, 셔츠, 후드, 니트 등 다양한 상의',
          icon: '👕',
          order: 0,
        },
        {
          name: '신발',
          slug: 'shoes',
          path: '/categories/shoes',
          description: '운동화, 구두, 부츠, 샌들 등 모든 신발',
          icon: '👟',
          order: 1,
        },
      ];

      for (const category of categories) {
        await CategoryService.createCategory(category);
      }

      setTestResult('✅ 시드 데이터 생성 완료!');
    } catch (error) {
      console.error('시드 데이터 생성 에러:', error);
      setTestResult(`❌ 시드 데이터 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Firebase 연결 테스트</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testFirebaseConnection}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '테스트 중...' : 'Firebase 연결 테스트'}
        </button>

        <button 
          onClick={seedCategories}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '생성 중...' : '시드 데이터 생성'}
        </button>
      </div>

      {testResult && (
        <div style={{
          backgroundColor: testResult.includes('✅') ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${testResult.includes('✅') ? '#a7f3d0' : '#fecaca'}`,
          padding: '1rem',
          borderRadius: '0.375rem',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
}
