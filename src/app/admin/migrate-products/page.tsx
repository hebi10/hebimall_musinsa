'use client';

import { useState } from 'react';
import { collection, doc, deleteDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

const migrations = [
  { from: '가방', to: 'bags' },
  { from: '상의', to: 'tops' },
  { from: '액세서리', to: 'accessories' },
  { from: '하의', to: 'bottoms' }
];

export default function MigrateProducts() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const migrateAllProducts = async () => {
    setIsLoading(true);
    setStatus('상품 마이그레이션 시작...');
    const migrationResults = [];

    try {
      for (const migration of migrations) {
        const { from, to } = migration;
        setStatus(`${from} → ${to} 마이그레이션 중...`);

        // 한국어 카테고리의 products 가져오기
        const fromProductsRef = collection(db, 'categories', from, 'products');
        const fromSnapshot = await getDocs(fromProductsRef);

        if (fromSnapshot.empty) {
          console.log(`${from} 카테고리에 상품이 없습니다.`);
          migrationResults.push({
            from,
            to,
            count: 0,
            status: '상품 없음'
          });
          continue;
        }

        let movedCount = 0;

        // 각 상품을 영어 카테고리로 복사
        for (const productDoc of fromSnapshot.docs) {
          const productData = productDoc.data();
          const productId = productDoc.id;

          // 영어 카테고리에 상품 추가
          const toProductRef = doc(db, 'categories', to, 'products', productId);
          await setDoc(toProductRef, {
            ...productData,
            category: to, // 카테고리 필드도 영어로 업데이트
            updatedAt: new Date()
          });

          console.log(`${productData.name} → ${to} 카테고리로 이동`);
          movedCount++;
        }

        // 한국어 카테고리의 모든 상품 삭제
        for (const productDoc of fromSnapshot.docs) {
          await deleteDoc(productDoc.ref);
        }

        // 한국어 카테고리 문서 자체도 삭제
        const fromCategoryRef = doc(db, 'categories', from);
        await deleteDoc(fromCategoryRef);

        migrationResults.push({
          from,
          to,
          count: movedCount,
          status: '완료'
        });

        console.log(`${from} → ${to}: ${movedCount}개 상품 마이그레이션 완료`);
      }

      setResults(migrationResults);
      setStatus('모든 마이그레이션 완료!');

    } catch (error) {
      console.error('마이그레이션 실패:', error);
      setStatus(`마이그레이션 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkKoreanCategories = async () => {
    setIsLoading(true);
    setStatus('한국어 카테고리 확인 중...');

    try {
      const checkResults = [];

      for (const migration of migrations) {
        const { from, to } = migration;
        
        // 한국어 카테고리 확인
        const fromProductsRef = collection(db, 'categories', from, 'products');
        const fromSnapshot = await getDocs(fromProductsRef);
        
        // 영어 카테고리 확인  
        const toProductsRef = collection(db, 'categories', to, 'products');
        const toSnapshot = await getDocs(toProductsRef);

        checkResults.push({
          from,
          to,
          fromCount: fromSnapshot.size,
          toCount: toSnapshot.size,
          status: fromSnapshot.size > 0 ? '마이그레이션 필요' : '완료'
        });
      }

      setResults(checkResults);
      setStatus('확인 완료');

    } catch (error) {
      setStatus(`확인 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">한국어 → 영어 카테고리 상품 마이그레이션</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={checkKoreanCategories}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '확인 중...' : '현재 상태 확인'}
        </button>
        
        <button
          onClick={migrateAllProducts}
          disabled={isLoading}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? '마이그레이션 중...' : '상품 마이그레이션 실행'}
        </button>
      </div>
      
      {status && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p className="font-medium">{status}</p>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">마이그레이션 결과:</h2>
          
          <div className="grid gap-4">
            {results.map((result, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">
                    "{result.from}" → "{result.to}"
                  </h3>
                  <span className={`px-3 py-1 rounded text-sm ${
                    result.status === '완료' ? 'bg-green-100 text-green-800' :
                    result.status === '마이그레이션 필요' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  {result.fromCount !== undefined && (
                    <p>한국어 카테고리 상품: {result.fromCount}개</p>
                  )}
                  {result.toCount !== undefined && (
                    <p>영어 카테고리 상품: {result.toCount}개</p>
                  )}
                  {result.count !== undefined && (
                    <p>이동된 상품: {result.count}개</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">마이그레이션 과정:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>한국어 카테고리(/categories/가방/products)에서 모든 상품 가져오기</li>
          <li>각 상품을 영어 카테고리(/categories/bags/products)로 복사</li>
          <li>상품의 category 필드를 영어로 업데이트</li>
          <li>한국어 카테고리의 모든 상품 삭제</li>
          <li>한국어 카테고리 문서 자체 삭제</li>
        </ol>
      </div>
    </div>
  );
}
