'use client';

import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/shared/libs/firebase/firebase';

// 가방 카테고리 데이터
const bagsCategory = {
  id: 'bags',
  name: 'Bags',
  description: '실용성과 스타일을 겸비한 가방 컬렉션',
  icon: '👜',
  color: '#ffc107',
  order: 3,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// 가방 상품 데이터 (10개)
const bagsProducts = [
  { name: '가죽 토트백', brand: 'LEATHER', price: 129000, originalPrice: 159000, rating: 4.7, reviewCount: 145, description: '고급 가죽 토트백', mainImage: '/images/products/leather-tote.jpg', isSale: true, saleRate: 19 },
  { name: '백팩', brand: 'DAILY', price: 65000, originalPrice: null, rating: 4.5, reviewCount: 234, description: '일상용 편안한 백팩', mainImage: '/images/products/backpack.jpg', isSale: false, saleRate: 0 },
  { name: '크로스백', brand: 'SMALL', price: 45000, originalPrice: 59000, rating: 4.3, reviewCount: 189, description: '실용적인 크로스백', mainImage: '/images/products/crossbag.jpg', isSale: true, saleRate: 24 },
  { name: '클러치백', brand: 'EVENING', price: 89000, originalPrice: null, rating: 4.6, reviewCount: 78, description: '이브닝용 클러치백', mainImage: '/images/products/clutch.jpg', isSale: false, saleRate: 0 },
  { name: '숄더백', brand: 'CLASSIC', price: 95000, originalPrice: 120000, rating: 4.8, reviewCount: 167, description: '클래식 숄더백', mainImage: '/images/products/shoulder-bag.jpg', isSale: true, saleRate: 21 },
  { name: '미니백', brand: 'MINI', price: 35000, originalPrice: null, rating: 4.2, reviewCount: 156, description: '귀여운 미니백', mainImage: '/images/products/mini-bag.jpg', isSale: false, saleRate: 0 },
  { name: '비즈니스 가방', brand: 'BUSINESS', price: 149000, originalPrice: 189000, rating: 4.9, reviewCount: 89, description: '전문적인 비즈니스 가방', mainImage: '/images/products/business-bag.jpg', isSale: true, saleRate: 21 },
  { name: '웨이스트백', brand: 'SPORT', price: 39000, originalPrice: null, rating: 4.1, reviewCount: 123, description: '활동적인 웨이스트백', mainImage: '/images/products/waist-bag.jpg', isSale: false, saleRate: 0 },
  { name: '여행용 캐리어', brand: 'TRAVEL', price: 199000, originalPrice: 249000, rating: 4.7, reviewCount: 134, description: '견고한 여행용 캐리어', mainImage: '/images/products/suitcase.jpg', isSale: true, saleRate: 20 },
  { name: '버킷백', brand: 'TRENDY', price: 75000, originalPrice: null, rating: 4.4, reviewCount: 198, description: '트렌디한 버킷백', mainImage: '/images/products/bucket-bag.jpg', isSale: false, saleRate: 0 }
];

export default function CreateBagsCategory() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const createBagsCategory = async () => {
    setIsLoading(true);
    setStatus('👜 가방 카테고리 생성 시작...');
    setProgress(0);

    try {
      // 1. 가방 카테고리 문서 생성
      const categoryRef = doc(db, 'categories', 'bags');
      await setDoc(categoryRef, bagsCategory);
      setStatus('✅ 가방 카테고리 문서 생성 완료');
      setProgress(10);

      // 2. 가방 상품들 추가
      setStatus('📦 가방 상품 추가 중...');
      
      let addedCount = 0;
      
      for (let i = 0; i < bagsProducts.length; i++) {
        const product = bagsProducts[i];
        const productRef = doc(collection(db, 'categories', 'bags', 'products'));
        
        const productData = {
          ...product,
          category: 'bags',
          stock: Math.floor(Math.random() * 50) + 10, // 10-59 랜덤 재고
          isNew: Math.random() > 0.7, // 30% 확률로 신상품
          tags: ['bags', product.brand.toLowerCase()],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(productRef, productData);
        addedCount++;
        
        const progressPercent = 10 + Math.round((i + 1) / bagsProducts.length * 90);
        setProgress(progressPercent);
        setStatus(`📦 상품 추가 중... (${addedCount}/${bagsProducts.length}) - ${product.name}`);
        
        // 너무 빠르게 실행되지 않도록 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setStatus(`🎉 가방 카테고리 및 상품 생성 완료!\n📊 카테고리: bags\n📦 상품 수: ${addedCount}개\n🔗 경로: /categories/bags/products`);
      setProgress(100);

    } catch (error) {
      console.error('생성 실패:', error);
      setStatus(`❌ 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👜 가방 카테고리 생성</h1>
      
      <div className="mb-6">
        <button
          onClick={createBagsCategory}
          disabled={isLoading}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '생성 중...' : '가방 카테고리 & 상품 10개 생성'}
        </button>
      </div>
      
      {isLoading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% 완료</p>
        </div>
      )}
      
      {status && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap font-mono text-sm">{status}</pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">생성될 가방 상품 (10개):</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {bagsProducts.map((product, index) => (
            <div key={index} className="flex justify-between">
              <span>{product.name}</span>
              <span className="text-gray-600">{product.price.toLocaleString()}원</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-green-50 rounded">
        <h3 className="font-semibold mb-2">생성 후 확인사항:</h3>
        <ul className="text-sm space-y-1">
          <li>• Firebase 콘솔에서 /categories/bags 문서 생성 확인</li>
          <li>• /categories/bags/products 서브컬렉션에 10개 상품 확인</li>
          <li>• 웹사이트 헤더의 카테고리 드롭다운에 "Bags" 표시 확인</li>
          <li>• /categories/bags 페이지에서 상품 목록 표시 확인</li>
        </ul>
      </div>
    </div>
  );
}
