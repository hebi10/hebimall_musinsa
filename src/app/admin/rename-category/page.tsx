'use client';

import { useState } from 'react';
import { collection, doc, deleteDoc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

export default function RenameCategoryId() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const renameCategoryFromKoreanToBags = async () => {
    setIsLoading(true);
    setStatus('가방 → bags 변경 시작...');

    try {
      // 1. 기존 '가방' 카테고리 데이터 가져오기
      const koreanCategoryRef = doc(db, 'categories', '가방');
      const koreanCategoryDoc = await getDoc(koreanCategoryRef);

      if (!koreanCategoryDoc.exists()) {
        setStatus('"가방" 카테고리를 찾을 수 없습니다.');
        return;
      }

      const categoryData = koreanCategoryDoc.data();
      setStatus('"가방" 카테고리 데이터 확인됨');

      // 2. '가방' 카테고리의 모든 상품 가져오기
      const koreanProductsRef = collection(db, 'categories', '가방', 'products');
      const productsSnapshot = await getDocs(koreanProductsRef);
      
      setStatus(`상품 ${productsSnapshot.size}개 발견`);

      // 3. 새로운 'bags' 카테고리 문서 생성
      const englishCategoryRef = doc(db, 'categories', 'bags');
      await setDoc(englishCategoryRef, {
        ...categoryData,
        id: 'bags',
        updatedAt: new Date()
      });
      
      setStatus('"bags" 카테고리 문서 생성됨');

      // 4. 모든 상품을 'bags' 카테고리로 복사
      let movedCount = 0;
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        
        // 새로운 위치에 상품 생성
        const newProductRef = doc(db, 'categories', 'bags', 'products', productDoc.id);
        await setDoc(newProductRef, {
          ...productData,
          category: 'bags', // 카테고리 필드를 영어로 업데이트
          updatedAt: new Date()
        });
        
        movedCount++;
        setStatus(`상품 이동 중... (${movedCount}/${productsSnapshot.size})`);
      }

      setStatus('모든 상품이 bags 카테고리로 이동됨');

      // 5. 기존 '가방' 카테고리의 모든 상품 삭제
      for (const productDoc of productsSnapshot.docs) {
        await deleteDoc(productDoc.ref);
      }

      // 6. 기존 '가방' 카테고리 문서 삭제
      await deleteDoc(koreanCategoryRef);

      setStatus(`완료! "가방" → "bags" 변경 및 ${movedCount}개 상품 이동 완료`);

    } catch (error) {
      console.error('변경 실패:', error);
      setStatus(`실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentState = async () => {
    setIsLoading(true);
    setStatus('현재 상태 확인 중...');

    try {
      // 가방 카테고리 확인
      const koreanCategoryRef = doc(db, 'categories', '가방');
      const koreanCategoryDoc = await getDoc(koreanCategoryRef);
      
      // bags 카테고리 확인
      const englishCategoryRef = doc(db, 'categories', 'bags');
      const englishCategoryDoc = await getDoc(englishCategoryRef);

      let statusText = '현재 상태:\n';

      if (koreanCategoryDoc.exists()) {
        const koreanProductsRef = collection(db, 'categories', '가방', 'products');
        const koreanProductsSnapshot = await getDocs(koreanProductsRef);
        statusText += `• "가방" 카테고리: 존재함 (${koreanProductsSnapshot.size}개 상품)\n`;
      } else {
        statusText += `• "가방" 카테고리: 존재하지 않음\n`;
      }

      if (englishCategoryDoc.exists()) {
        const englishProductsRef = collection(db, 'categories', 'bags', 'products');
        const englishProductsSnapshot = await getDocs(englishProductsRef);
        statusText += `• "bags" 카테고리: 존재함 (${englishProductsSnapshot.size}개 상품)\n`;
      } else {
        statusText += `• "bags" 카테고리: 존재하지 않음\n`;
      }

      setStatus(statusText);

    } catch (error) {
      setStatus(`확인 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">"가방" → "bags" 카테고리 ID 변경</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={checkCurrentState}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '확인 중...' : '현재 상태 확인'}
        </button>
        
        <button
          onClick={renameCategoryFromKoreanToBags}
          disabled={isLoading}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? '변경 중...' : '"가방" → "bags" 변경 실행'}
        </button>
      </div>
      
      {status && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap font-mono text-sm">{status}</pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">작업 과정:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>"가방" 카테고리 데이터 및 상품들 확인</li>
          <li>새로운 "bags" 카테고리 문서 생성</li>
          <li>모든 상품을 "bags" 카테고리로 복사 (category 필드 업데이트)</li>
          <li>기존 "가방" 카테고리의 모든 상품 삭제</li>
          <li>기존 "가방" 카테고리 문서 삭제</li>
        </ol>
        
        <p className="mt-2 text-sm text-red-600">
          주의: 이 작업은 되돌릴 수 없습니다. 실행 전에 현재 상태를 먼저 확인하세요.
        </p>
      </div>
    </div>
  );
}
