"use client";

import { useState } from "react";
import ProductCard from "../../shared/components/ProductCard";
import Input from "../../shared/components/Input";
import styles from "./page.module.css";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  
  const searchResults = Array.from({ length: 8 }, (_, i) => ({
    id: `search-${i + 1}`,
    name: `검색 결과 상품 ${i + 1}`,
    brand: '검색브랜드',
    price: 35900 + (i * 5000),
    originalPrice: i % 3 === 0 ? 45900 + (i * 5000) : undefined,
    isNew: i < 2,
    isSale: i % 3 === 0,
    rating: 4.2 + (i * 0.1),
    reviewCount: 67 + i * 12,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* 검색 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title}>상품 검색</h1>
          <div style={{ maxWidth: '500px', flex: 1 }}>
            <Input
              placeholder="상품명, 브랜드명을 검색해보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* 인기 검색어 */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>인기 검색어</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['후드티', '청바지', '스니커즈', '맨투맨', '코트', '부츠', '니트', '원피스'].map((term) => (
              <button
                key={term}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'white'}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 결과 */}
        {searchTerm && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                '{searchTerm}' 검색 결과 ({searchResults.length}개)
              </h2>
              
              <div className="flex items-center gap-4">
                <select className="border rounded-lg px-3 py-2 text-sm">
                  <option>인기순</option>
                  <option>최신순</option>
                  <option>낮은 가격순</option>
                  <option>높은 가격순</option>
                  <option>리뷰 많은순</option>
                </select>
              </div>
            </div>

            {/* 필터 */}
            <div className="flex gap-4 mb-6 text-sm">
              <button className="px-4 py-2 bg-black text-white rounded-lg">전체</button>
              <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">상의</button>
              <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">하의</button>
              <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">신발</button>
              <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">세일상품</button>
            </div>

            {/* 검색 결과 상품 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-400">‹</button>
                <button className="px-3 py-2 bg-black text-white rounded">1</button>
                <button className="px-3 py-2 text-gray-600 hover:text-black">2</button>
                <button className="px-3 py-2 text-gray-600 hover:text-black">3</button>
                <button className="px-3 py-2 text-gray-600 hover:text-black">›</button>
              </div>
            </div>
          </div>
        )}

        {/* 검색 결과가 없을 때 */}
        {!searchTerm && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              원하는 상품을 검색해보세요
            </h3>
            <p className="text-gray-600">
              상품명이나 브랜드명으로 검색할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
