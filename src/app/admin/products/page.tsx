'use client';

import Link from 'next/link';
import { useAuth } from "../../auth/authProvider";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  image?: string;
  sku: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
}

export default function AdminProductsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
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
    const mockProducts: ProductData[] = [
      {
        id: '1',
        name: 'iPhone 14 Pro',
        brand: 'Apple',
        category: '스마트폰',
        price: 1490000,
        originalPrice: 1590000,
        stock: 25,
        status: 'active',
        sku: 'IPH14PRO001',
        description: '최신 iPhone 14 Pro 모델',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: '노트북',
        price: 1690000,
        stock: 12,
        status: 'active',
        sku: 'MBA2022001',
        description: 'M2 칩셋 탑재 MacBook Air',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18'
      },
      {
        id: '3',
        name: 'Galaxy S24 Ultra',
        brand: 'Samsung',
        category: '스마트폰',
        price: 1598000,
        stock: 3,
        status: 'active',
        sku: 'GS24U001',
        description: '최신 Galaxy S24 Ultra',
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19'
      },
      {
        id: '4',
        name: 'AirPods Pro 2세대',
        brand: 'Apple',
        category: '오디오',
        price: 359000,
        stock: 0,
        status: 'active',
        sku: 'APP2G001',
        description: '노이즈 캔슬링 이어폰',
        createdAt: '2024-01-08',
        updatedAt: '2024-01-16'
      },
      {
        id: '5',
        name: 'iPad Pro 12.9',
        brand: 'Apple',
        category: '태블릿',
        price: 1749000,
        stock: 18,
        status: 'active',
        sku: 'IPP129001',
        description: 'M2 칩셋 iPad Pro',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-14'
      },
      {
        id: '6',
        name: 'Surface Laptop 5',
        brand: 'Microsoft',
        category: '노트북',
        price: 1299000,
        stock: 8,
        status: 'inactive',
        sku: 'SL5001',
        description: 'Microsoft Surface Laptop',
        createdAt: '2024-01-03',
        updatedAt: '2024-01-12'
      },
      {
        id: '7',
        name: 'Nintendo Switch OLED',
        brand: 'Nintendo',
        category: '게임기',
        price: 419000,
        stock: 35,
        status: 'active',
        sku: 'NSW OLED001',
        description: 'OLED 모델 닌텐도 스위치',
        createdAt: '2023-12-28',
        updatedAt: '2024-01-10'
      },
      {
        id: '8',
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        category: '오디오',
        price: 449000,
        stock: 2,
        status: 'active',
        sku: 'SYWH1000XM5',
        description: '무선 노이즈 캔슬링 헤드폰',
        createdAt: '2023-12-25',
        updatedAt: '2024-01-08'
      },
      {
        id: '9',
        name: 'LG 그램 17인치',
        brand: 'LG',
        category: '노트북',
        price: 2299000,
        stock: 5,
        status: 'draft',
        sku: 'LGG17001',
        description: '초경량 17인치 노트북',
        createdAt: '2023-12-20',
        updatedAt: '2024-01-05'
      },
      {
        id: '10',
        name: 'Apple Watch Series 9',
        brand: 'Apple',
        category: '웨어러블',
        price: 599000,
        stock: 22,
        status: 'active',
        sku: 'AWS9001',
        description: '최신 Apple Watch',
        createdAt: '2023-12-15',
        updatedAt: '2024-01-02'
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, products]);

  const getProductStats = (): ProductStats => {
    return {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
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
        ? { ...product, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
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
              <h1 className={styles.adminTitle}>HEBiMALL 관리자</h1>
              <nav className={styles.adminNav}>
                <Link href="/admin/dashboard" className={styles.navLink}>
                  대시보드
                </Link>
                <Link href="/admin/users" className={styles.navLink}>
                  사용자 관리
                </Link>
                <Link href="/admin/orders" className={styles.navLink}>
                  주문 관리
                </Link>
                <Link href="/admin/products" className={`${styles.navLink} ${styles.active}`}>
                  상품 관리
                </Link>
              </nav>
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
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productBrand}>
                          {product.brand} • {product.sku}
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
                    <span className={`${styles.productStatus} ${styles[product.status]}`}>
                      {product.status === 'active' ? '판매중' : 
                       product.status === 'inactive' ? '판매중지' : '준비중'}
                    </span>
                  </td>
                  <td>{product.createdAt}</td>
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
