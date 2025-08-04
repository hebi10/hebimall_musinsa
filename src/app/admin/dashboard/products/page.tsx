'use client';

import { useAuth } from "@/src/context/authProvider";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import AdminNav from '../../components/adminNav';
import { mockProducts as productsData } from '@/src/mocks/products';
import { Product } from '@/src/types/product';

interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
}

export default function AdminProductsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // 초기 상품 데이터 생성
    const mockProducts: Product[] = productsData;
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      // status가 없으면 'active'로 간주
      const productStatus = product.status || 'active';
      const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, products]);

  const getProductStats = (): ProductStats => {
    return {
      total: products.length,
      active: products.filter(p => (p.status || 'active') === 'active').length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
      outOfStock: products.filter(p => p.stock === 0).length
    };
  };

  const getStockStatus = (stock: number): string => {
    if (stock === 0) return 'outOfStock';
    if (stock <= 5) return 'lowStock';
    return 'inStock';
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const handleStatusChange = (productId: string, newStatus: 'active' | 'inactive' | 'draft') => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: newStatus, updatedAt: new Date() }
        : product
    ));
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('이 상품을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', '상품명', '브랜드', '카테고리', '가격', '재고', '상태', 'SKU'],
      ...filteredProducts.map(product => [
        product.id,
        product.name,
        product.brand,
        product.category,
        product.price.toString(),
        product.stock.toString(),
        product.status,
        product.sku
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>로딩중...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = getProductStats();
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <header className={styles.adminHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.adminTitle}>HEBIMALL Admin</h1>
              <AdminNav />
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userInfo}>
                <span>관리자</span>
                <span>{user?.name || '관리자'}</span>
              </div>
              <button onClick={logout} className={styles.logoutButton}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>상품 관리</h2>
          <p className={styles.pageSubtitle}>상품 정보를 관리하고 재고를 추적하세요</p>
        </div>

        <div className={styles.statsCards}>
          <div className={`${styles.statsCard} ${styles.total}`}>
            <div className={styles.statsValue}>{stats.total}</div>
            <div className={styles.statsLabel}>전체 상품</div>
          </div>
          <div className={`${styles.statsCard} ${styles.active}`}>
            <div className={styles.statsValue}>{stats.active}</div>
            <div className={styles.statsLabel}>판매중</div>
          </div>
          <div className={`${styles.statsCard} ${styles.lowStock}`}>
            <div className={styles.statsValue}>{stats.lowStock}</div>
            <div className={styles.statsLabel}>품절 임박</div>
          </div>
          <div className={`${styles.statsCard} ${styles.outOfStock}`}>
            <div className={styles.statsValue}>{stats.outOfStock}</div>
            <div className={styles.statsLabel}>품절</div>
          </div>
        </div>

        <div className={styles.controlsSection}>
          <div className={styles.controlsGrid}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="상품명, 브랜드, SKU로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">모든 카테고리</option>
              <option value="스마트폰">스마트폰</option>
              <option value="노트북">노트북</option>
              <option value="태블릿">태블릿</option>
              <option value="오디오">오디오</option>
              <option value="게임기">게임기</option>
              <option value="웨어러블">웨어러블</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">모든 상태</option>
              <option value="active">판매중</option>
              <option value="inactive">판매중지</option>
              <option value="draft">준비중</option>
            </select>
            <button className={styles.addButton}>
              ➕ 상품 추가
            </button>
            <button onClick={handleExport} className={styles.exportButton}>
              📊 내보내기
            </button>
          </div>
        </div>

        <div className={styles.productsTable}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>📦 상품 목록</h3>
            <span>총 {filteredProducts.length}개</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상품 정보</th>
                <th>카테고리</th>
                <th>가격</th>
                <th>재고</th>
                <th>상태</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productInfo}>
                      <div className={styles.productImage}>
                        📱
                      </div>
                      <div>
                        <Link href={`/products/${product.id}`} className={styles.productName}>
                          {product.name}
                        </Link>
                        <div className={styles.productBrand}>
                          {product.brand} • {product.sku || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.productCategory}>
                      {product.category}
                    </span>
                  </td>
                  <td>
                    <div className={styles.productPrice}>
                      {formatPrice(product.price)}
                      {product.originalPrice && (
                        <span className={styles.originalPrice}>
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.stockStatus} ${styles[getStockStatus(product.stock)]}`}>
                      {product.stock}개
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.productStatus} ${styles[product.status || 'active']}`}>
                      {product.status === 'active' ? '판매중' : 
                       product.status === 'inactive' ? '판매중지' : '준비중'}
                    </span>
                  </td>
                  <td>{product.createdAt.toLocaleDateString()}</td>
                  <td>
                    <button className={`${styles.actionButton} ${styles.primary}`}>
                      수정
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.warning}`}
                      onClick={() => handleStatusChange(
                        product.id, 
                        product.status === 'active' ? 'inactive' : 'active'
                      )}
                    >
                      {product.status === 'active' ? '중지' : '활성'}
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.danger}`}
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 2
              )
              .map((page, index, array) => (
                <div key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                  <button
                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </div>
              ))}
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
