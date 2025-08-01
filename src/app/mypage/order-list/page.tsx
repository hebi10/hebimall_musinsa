'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Order {
  id: string;
  date: string;
  status: '배송완료' | '배송중' | '주문확인' | '취소' | '교환' | '반품';
  totalAmount: number;
  products: {
    id: string;
    name: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

export default function OrderListPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3개월');

  const statusOptions = ['전체', '배송완료', '배송중', '주문확인', '취소', '교환', '반품'];
  const periodOptions = ['1개월', '3개월', '6개월', '1년'];

  const orders: Order[] = [
    {
      id: 'ORD-20241201-001',
      date: '2024.12.01',
      status: '배송완료',
      totalAmount: 298000,
      products: [
        {
          id: 'P001',
          name: '오버핏 후드 스웨트셔츠',
          brand: 'MUSINSA STANDARD',
          size: 'L',
          color: 'Black',
          quantity: 1,
          price: 49000,
          image: '/api/placeholder/80/80'
        },
        {
          id: 'P002',
          name: '와이드 데님 팬츠',
          brand: 'THISISNEVERTHAT',
          size: '32',
          color: 'Indigo',
          quantity: 2,
          price: 124500,
          image: '/api/placeholder/80/80'
        }
      ]
    },
    {
      id: 'ORD-20241125-002',
      date: '2024.11.25',
      status: '배송중',
      totalAmount: 159000,
      products: [
        {
          id: 'P003',
          name: '베이직 크루넥 니트',
          brand: 'UNIQLO',
          size: 'M',
          color: 'Navy',
          quantity: 3,
          price: 53000,
          image: '/api/placeholder/80/80'
        }
      ]
    }
  ];

  const filteredOrders = orders.filter(order => 
    selectedStatus === '전체' || order.status === selectedStatus
  );

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>주문/배송 조회</h2>
        <p className={styles.pageDesc}>주문하신 상품의 주문내역을 확인하실 수 있습니다.</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>12</div>
            <div className={styles.statLabel}>총 주문</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚚</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>2</div>
            <div className={styles.statLabel}>배송중</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>10</div>
            <div className={styles.statLabel}>배송완료</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>1,250,000원</div>
            <div className={styles.statLabel}>총 구매금액</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>주문상태</label>
          <div className={styles.filterButtons}>
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`${styles.filterButton} ${selectedStatus === status ? styles.active : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>조회기간</label>
          <div className={styles.filterButtons}>
            {periodOptions.map((period) => (
              <button
                key={period}
                className={`${styles.filterButton} ${selectedPeriod === period ? styles.active : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>주문 목록</h3>
          <div className={styles.resultCount}>총 {filteredOrders.length}건</div>
        </div>

        <div className={styles.ordersList}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <div className={styles.orderStatusBadge}>
                    <span className={`${styles.statusDot} ${styles[`status-${order.status}`]}`}></span>
                    {order.status}
                  </div>
                </div>

                <div className={styles.orderProducts}>
                  {order.products.map((product) => (
                    <div key={product.id} className={styles.productItem}>
                      <div className={styles.productImage}>
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className={styles.productInfo}>
                        <div className={styles.productBrand}>{product.brand}</div>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productOption}>
                          {product.color} / {product.size} / 수량 {product.quantity}개
                        </div>
                      </div>
                      <div className={styles.productPrice}>
                        {product.price.toLocaleString()}원
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    총 주문금액: <strong>{order.totalAmount.toLocaleString()}원</strong>
                  </div>
                  <div className={styles.orderActions}>
                    <button className={styles.actionButton}>주문상세</button>
                    <button className={styles.actionButton}>배송조회</button>
                    {order.status === '배송완료' && (
                      <button className={styles.actionButton}>리뷰작성</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <div className={styles.emptyTitle}>주문 내역이 없습니다</div>
              <div className={styles.emptyDesc}>조건에 맞는 주문 내역을 찾을 수 없습니다.</div>
              <Link href="/" className={styles.shopButton}>
                쇼핑하러 가기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
