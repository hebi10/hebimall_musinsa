'use client';

import { useState } from 'react';
import { collection, doc, deleteDoc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

export default function FixKoreanDocuments() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fixAllKoreanDocuments = async () => {
    setIsLoading(true);
    setStatus('한국어 문서 ID 수정 시작...');

    const mappings = [
      { koreanId: '가방', englishId: 'bags', englishName: 'Bags' },
      { koreanId: '상의', englishId: 'tops', englishName: 'Tops' },
      { koreanId: '액세서리', englishId: 'accessories', englishName: 'Accessories' },
      { koreanId: '하의', englishId: 'bottoms', englishName: 'Bottoms' }
    ];

    try {
      for (const mapping of mappings) {
        const { koreanId, englishId, englishName } = mapping;
        setStatus(`🔄 "${koreanId}" → "${englishId}" 처리 중...`);

        // 1. 한국어 문서 확인
        const koreanDocRef = doc(db, 'categories', koreanId);
        const koreanDoc = await getDoc(koreanDocRef);

        if (!koreanDoc.exists()) {
          console.log(`"${koreanId}" 문서가 존재하지 않습니다.`);
          continue;
        }

        const koreanData = koreanDoc.data();
        
        // 2. 한국어 문서의 products 가져오기
        const koreanProductsRef = collection(db, 'categories', koreanId, 'products');
        const koreanProductsSnapshot = await getDocs(koreanProductsRef);
        
        console.log(`"${koreanId}"에서 ${koreanProductsSnapshot.size}개 상품 발견`);

        // 3. 영어 문서가 이미 있는지 확인
        const englishDocRef = doc(db, 'categories', englishId);
        const englishDoc = await getDoc(englishDocRef);

        if (englishDoc.exists()) {
          // 영어 문서가 이미 있으면 상품만 병합
          const englishProductsRef = collection(db, 'categories', englishId, 'products');
          
          for (const productDoc of koreanProductsSnapshot.docs) {
            const productData = productDoc.data();
            const newProductRef = doc(englishProductsRef, productDoc.id);
            
            await setDoc(newProductRef, {
              ...productData,
              category: englishId,
              updatedAt: new Date()
            });
          }
          
          setStatus(`✅ "${koreanId}" 상품들을 기존 "${englishId}" 카테고리에 병합`);
        } else {
          // 영어 문서가 없으면 새로 생성
          await setDoc(englishDocRef, {
            ...koreanData,
            id: englishId,
            name: englishName,
            updatedAt: new Date()
          });

          // 모든 상품을 새 영어 카테고리로 복사
          const englishProductsRef = collection(db, 'categories', englishId, 'products');
          
          for (const productDoc of koreanProductsSnapshot.docs) {
            const productData = productDoc.data();
            const newProductRef = doc(englishProductsRef, productDoc.id);
            
            await setDoc(newProductRef, {
              ...productData,
              category: englishId,
              updatedAt: new Date()
            });
          }
          
          setStatus(`✅ "${koreanId}" → "${englishId}" 새 카테고리 생성 및 상품 이동`);
        }

        // 4. 한국어 문서의 모든 상품 삭제
        for (const productDoc of koreanProductsSnapshot.docs) {
          await deleteDoc(productDoc.ref);
        }

        // 5. 한국어 카테고리 문서 삭제
        await deleteDoc(koreanDocRef);
        
        console.log(`🗑️ "${koreanId}" 카테고리 삭제 완료`);
      }

      setStatus('🎉 모든 한국어 카테고리 문서 수정 완료!');

    } catch (error) {
      console.error('수정 실패:', error);
      setStatus(`❌ 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllCategories = async () => {
    setIsLoading(true);
    setStatus('모든 카테고리 확인 중...');

    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);

      let statusText = '📊 현재 카테고리 상태:\n\n';
      
      const koreanCategories = [];
      const englishCategories = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(doc.id);
        
        // 상품 수 확인
        const productsRef = collection(db, 'categories', doc.id, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        const categoryInfo = {
          id: doc.id,
          name: data.name,
          productCount: productsSnapshot.size,
          isKorean
        };

        if (isKorean) {
          koreanCategories.push(categoryInfo);
        } else {
          englishCategories.push(categoryInfo);
        }
      }

      statusText += '🇰🇷 한국어 카테고리:\n';
      if (koreanCategories.length === 0) {
        statusText += '   없음\n';
      } else {
        koreanCategories.forEach(cat => {
          statusText += `   • "${cat.id}" (${cat.name}) - ${cat.productCount}개 상품\n`;
        });
      }

      statusText += '\n🇺🇸 영어 카테고리:\n';
      englishCategories.forEach(cat => {
        statusText += `   • "${cat.id}" (${cat.name}) - ${cat.productCount}개 상품\n`;
      });

      setStatus(statusText);

    } catch (error) {
      setStatus(`❌ 확인 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">한국어 카테고리 문서 ID 수정</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={checkAllCategories}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '확인 중...' : '모든 카테고리 확인'}
        </button>
        
        <button
          onClick={fixAllKoreanDocuments}
          disabled={isLoading}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? '수정 중...' : '한국어 문서 ID 모두 수정'}
        </button>
      </div>
      
      {status && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap font-mono text-sm">{status}</pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
        <h3 className="font-semibold mb-2">⚠️ 현재 문제 상황:</h3>
        <ul className="text-sm space-y-1">
          <li>• 카테고리 문서 ID가 한국어: `/categories/가방`, `/categories/상의` 등</li>
          <li>• 웹 애플리케이션에서 영어 ID로 접근할 때 문제 발생</li>
          <li>• URL 경로도 한국어로 되어 혼란 야기</li>
        </ul>
        
        <h3 className="font-semibold mt-4 mb-2">🔧 수정 작업:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>한국어 문서의 모든 상품과 데이터 백업</li>
          <li>영어 ID로 새 카테고리 문서 생성 (또는 기존 영어 문서에 병합)</li>
          <li>모든 상품을 영어 카테고리로 이동하고 category 필드 업데이트</li>
          <li>한국어 카테고리 문서 완전 삭제</li>
        </ol>
      </div>
    </div>
  );
}
