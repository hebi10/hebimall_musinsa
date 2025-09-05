'use client';

import { useState } from 'react';
import { collection, doc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

const koreanDocIds = ['가방', '상의', '액세서리', '하의'];

const koreanToEnglish: Record<string, string> = {
  '가방': 'bags',
  '상의': 'tops', 
  '액세서리': 'accessories',
  '하의': 'bottoms'
};

interface Product {
  id: string;
  name: string;
  category: string;
  [key: string]: any;
}

interface KoreanDoc {
  id: string;
  data: any;
  productCount: number;
  products: Product[];
}

export default function CleanupKoreanCategories() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [koreanDocs, setKoreanDocs] = useState<KoreanDoc[]>([]);

  const checkKoreanDocuments = async () => {
    setIsLoading(true);
    setStatus('한국어 카테고리 문서 확인 중...');
    
    try {
      const foundDocs = [];
      
      for (const koreanId of koreanDocIds) {
        console.log(`"${koreanId}" 문서 확인 중...`);
        
        const docRef = doc(db, 'categories', koreanId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // 하위 상품들 확인
          const productsRef = collection(db, 'categories', koreanId, 'products');
          const productsSnap = await getDocs(productsRef);
          
          foundDocs.push({
            id: koreanId,
            data,
            productCount: productsSnap.size,
            products: productsSnap.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name || '',
              category: doc.data().category || '',
              ...doc.data()
            }))
          });
          
          console.log(`✅ "${koreanId}" 발견 - ${productsSnap.size}개 상품`);
        } else {
          console.log(`❌ "${koreanId}" 없음`);
        }
      }
      
      setKoreanDocs(foundDocs);
      setStatus(`발견된 한국어 문서: ${foundDocs.length}개`);
      
    } catch (error) {
      console.error('확인 실패:', error);
      setStatus(`확인 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteKoreanDocuments = async () => {
    if (!confirm('한국어 카테고리 문서들을 정말 삭제하시겠습니까?')) {
      return;
    }
    
    setIsLoading(true);
    setStatus('한국어 카테고리 문서 삭제 중...');
    
    try {
      let deletedCount = 0;
      
      for (const koreanDoc of koreanDocs) {
        const koreanId = koreanDoc.id;
        console.log(`"${koreanId}" 삭제 중...`);
        
        // 먼저 하위 상품들 삭제
        if (koreanDoc.productCount > 0) {
          for (const product of koreanDoc.products) {
            const productRef = doc(db, 'categories', koreanId, 'products', product.id);
            await deleteDoc(productRef);
            console.log(`  상품 삭제: ${product.name}`);
          }
        }
        
        // 카테고리 문서 삭제
        const categoryRef = doc(db, 'categories', koreanId);
        await deleteDoc(categoryRef);
        
        console.log(`✅ "${koreanId}" 문서 삭제 완료`);
        deletedCount++;
      }
      
      setStatus(`${deletedCount}개 한국어 문서 삭제 완료!`);
      setKoreanDocs([]);
      
    } catch (error) {
      console.error('삭제 실패:', error);
      setStatus(`삭제 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">한국어 카테고리 문서 정리</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={checkKoreanDocuments}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '확인 중...' : '한국어 문서 확인'}
        </button>
        
        {koreanDocs.length > 0 && (
          <button
            onClick={deleteKoreanDocuments}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? '삭제 중...' : '한국어 문서 삭제'}
          </button>
        )}
      </div>
      
      {status && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p>{status}</p>
        </div>
      )}
      
      {koreanDocs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">발견된 한국어 문서들:</h2>
          
          {koreanDocs.map((doc, index) => (
            <div key={doc.id} className="border p-4 rounded">
              <h3 className="font-semibold text-lg">
                {index + 1}. "{doc.id}" → "{koreanToEnglish[doc.id]}"
              </h3>
              <p className="text-gray-600 mb-2">
                이름: {doc.data.name} | 상품 수: {doc.productCount}개
              </p>
              
              {doc.productCount > 0 && (
                <div className="ml-4">
                  <h4 className="font-medium">상품 목록:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {doc.products.map((product: Product, idx: number) => (
                      <li key={product.id}>
                        {product.name} (카테고리: {product.category})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
