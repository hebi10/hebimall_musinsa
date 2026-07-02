'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { useAuth } from '@/context/authProvider';
import { useCategoriesQuery } from '@/shared/hooks/useCategoriesQuery';
import { useDeleteProduct, useProducts, useUpdateProduct } from '@/shared/hooks/useProducts';
import type { Product } from '@/shared/types/product';

export default function AdminProductsPage() {
  const { user, isAdmin, loading: authLoading, isUserDataLoading } = useAuth();
  const { data: products = [], isLoading: loading, isFetching, refetch } = useProducts();
  const { data: categories = [] } = useCategoriesQuery();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleForceRefresh = () => {
    if (isFetching) return;
    setCurrentPage(1);
    refetch();
  };

  // 상품 삭제 처리 (중복 방지)
  // 로딩 중이거나 권한이 없으면 표시하지 않음 (layout에서 처리됨)
  if (authLoading || isUserDataLoading || !user || !isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>데이터 로딩 중...</div>
      </div>
    );
  }

  // 검색 및 필터링 적용
  let filteredProducts = [...products];

  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
  }

  if (statusFilter) {
    filteredProducts = filteredProducts.filter(product => product.status === statusFilter);
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (productId: string) => {
    if (confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await deleteProductMutation.mutateAsync(productId);
      } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다.');
      }
    }
  };

  const handleStatusChange = async (product: Product, newStatus: 'active' | 'inactive' | 'draft') => {
    try {
      await updateProductMutation.mutateAsync({
        productId: product.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      console.error('상품 상태 변경 실패:', error);
      alert('상품 상태 변경에 실패했습니다.');
    }
  };

  // 카테고리 ID를 한국어 이름으로 변환하는 함수
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981'; // 초록색
      case 'inactive': return '#EF4444'; // 빨간색
      case 'draft': return '#F59E0B'; // 노란색
      default: return '#6B7280'; // 회색
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>상품 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>상품 관리</h1>
        <div className={styles.headerActions}>
          <button 
            onClick={handleForceRefresh}
            className={styles.refreshButton}
            title="데이터 새로고침"
          >
            새로고침
          </button>
          <Link href="/admin/featured-products" className={styles.addButton}>
            추천 상품 설정
          </Link>
          <Link href="/admin/dashboard/products/add" className={styles.addButton}>
            상품 추가
          </Link>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="상품명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterBox}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체 카테고리</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체 상태</option>
            <option value="active">판매중</option>
            <option value="inactive">판매중지</option>
            <option value="draft">임시저장</option>
          </select>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이미지</th>
              <th>상품명</th>
              <th>브랜드</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>재고</th>
              <th>상태</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productImage}>
                    {(product.mainImage || (product.images && product.images.length > 0)) ? (
                      <Image
                        src={product.mainImage || product.images[0]}
                        alt={product.name}
                        width={72}
                        height={72}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>
                </td>
                <td className={styles.productName}>{product.name}</td>
                <td>{product.brand}</td>
                <td>{getCategoryName(product.category)}</td>
                <td className={styles.price}>
                  {product.price.toLocaleString()}원
                </td>
                <td className={styles.stock}>
                  <span className={product.stock <= 10 ? styles.lowStock : ''}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <select
                    value={product.status || 'active'}
                    onChange={(e) => handleStatusChange(product, e.target.value as 'active' | 'inactive' | 'draft')}
                    className={styles.statusSelect}
                    style={{ color: getStatusColor(product.status || 'active') }}
                  >
                    <option value="active">판매중</option>
                    <option value="inactive">판매중지</option>
                    <option value="draft">임시저장</option>
                  </select>
                </td>
                <td className={styles.date}>
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`/admin/dashboard/products/${product.id}/edit`}
                      className={styles.editButton}
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className={styles.deleteButton}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            다음
          </button>
        </div>
      )}

      {/* 통계 정보 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>전체 상품</span>
          <span className={styles.statValue}>{filteredProducts.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>재고 부족 (10개 이하)</span>
          <span className={styles.statValue}>
            {filteredProducts.filter(p => p.stock <= 10).length}
          </span>
        </div>
      </div>
    </div>
  );
}
