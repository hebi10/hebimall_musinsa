'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/shared/libs/firebase/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function FirebaseStorageTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setTestResult('');
    
    try {
      // 1. Storage 연결 테스트
      setTestResult(prev => prev + 'Firebase Storage 연결 테스트 시작...\n');
      
      if (!storage) {
        throw new Error('Firebase Storage가 초기화되지 않았습니다.');
      }
      
      setTestResult(prev => prev + 'Firebase Storage 연결 성공\n');
      
      // 2. 테스트 파일 생성 및 업로드
      setTestResult(prev => prev + '테스트 파일 업로드 시작...\n');
      
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const testPath = `test/admin-test/${Date.now()}_test.txt`;
      const testRef = ref(storage, testPath);
      
      const uploadResult = await uploadBytes(testRef, testFile);
      setTestResult(prev => prev + `파일 업로드 성공: ${uploadResult.metadata.fullPath}\n`);
      
      // 3. 다운로드 URL 생성
      const downloadURL = await getDownloadURL(testRef);
      setTestResult(prev => prev + `다운로드 URL 생성 성공: ${downloadURL}\n`);
      
      // 4. 파일 삭제
      setTestResult(prev => prev + '테스트 파일 삭제 시작...\n');
      await deleteObject(testRef);
      setTestResult(prev => prev + '테스트 파일 삭제 성공\n');
      
      setTestResult(prev => prev + '\n모든 Firebase Storage 테스트 통과!\n');
      
    } catch (error) {
      console.error('Firebase Storage 테스트 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setTestResult(prev => prev + `테스트 실패: ${errorMessage}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '400px',
      maxWidth: '500px',
      zIndex: 9999,
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Firebase Storage 연결 테스트</h3>
      
      <button 
        onClick={runTest}
        disabled={testing}
        style={{
          background: testing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          marginBottom: '12px'
        }}
      >
        {testing ? '테스트 중...' : '연결 테스트 실행'}
      </button>
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '11px',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        {testResult || '테스트를 실행하려면 버튼을 클릭하세요.'}
      </pre>
    </div>
  );
}
