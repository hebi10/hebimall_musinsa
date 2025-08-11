'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

interface Coupon {
  id: string;
  name: string;
  type: string;
  value: number;
  isDirectAssign: boolean;
  isActive: boolean;
}

export default function AdminUserCouponsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDirectAssignCoupons();
  }, []);

  const loadDirectAssignCoupons = async () => {
    try {
      setLoading(true);
      // 임시로 목 데이터 사용 (관리자 직접 할당 쿠폰만)
      const mockCoupons: Coupon[] = [
        {
          id: 'COUPON002',
          name: '10% 할인 쿠폰',
          type: '할인율',
          value: 10,
          isDirectAssign: true,
          isActive: true
        },
        {
          id: 'COUPON003',
          name: 'VIP 회원 특별 할인',
          type: '할인금액',
          value: 20000,
          isDirectAssign: true,
          isActive: true
        },
        {
          id: 'COUPON004',
          name: '무료배송 쿠폰',
          type: '무료배송',
          value: 0,
          isDirectAssign: true,
          isActive: true
        }
      ];
      
      setCoupons(mockCoupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      // 임시로 목 데이터 사용
      const mockUser: User = {
        id: 'user123',
        email: searchEmail,
        displayName: '김사용자',
        createdAt: new Date('2024-01-01')
      };
      
      setSelectedUser(mockUser);
    } catch (error) {
      console.error('Error searching user:', error);
      alert('사용자를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const assignCouponToUser = async () => {
    if (!selectedUser || !selectedCoupon) {
      alert('사용자와 쿠폰을 선택해주세요.');
      return;
    }

    try {
      setIsAssigning(true);
      
      // 임시로 성공 처리
      alert(`${selectedUser.displayName}님에게 쿠폰이 성공적으로 지급되었습니다!`);
      
      // 폼 리셋
      setSelectedUser(null);
      setSelectedCoupon('');
      setSearchEmail('');
      
    } catch (error) {
      console.error('Error assigning coupon:', error);
      alert('쿠폰 지급에 실패했습니다.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>사용자 쿠폰 지급</h1>
        <p>관리자가 직접 할당 방식의 쿠폰을 사용자에게 지급할 수 있습니다</p>
      </div>

      <div className={styles.content}>
        {/* 사용자 검색 */}
        <div className={styles.section}>
          <h3>1️⃣ 사용자 검색</h3>
          <div className={styles.userSearch}>
            <div className={styles.searchGroup}>
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="사용자 이메일을 입력하세요"
                className={styles.searchInput}
              />
              <button 
                onClick={searchUser}
                className={styles.searchBtn}
                disabled={loading}
              >
                {loading ? '검색 중...' : '검색'}
              </button>
            </div>
          </div>

          {selectedUser && (
            <div className={styles.userInfo}>
              <h4>선택된 사용자</h4>
              <div className={styles.userCard}>
                <div className={styles.userDetails}>
                  <p><strong>이름:</strong> {selectedUser.displayName}</p>
                  <p><strong>이메일:</strong> {selectedUser.email}</p>
                  <p><strong>가입일:</strong> {selectedUser.createdAt.toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchEmail('');
                  }}
                  className={styles.clearBtn}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 쿠폰 선택 */}
        <div className={styles.section}>
          <h3>2️⃣ 지급할 쿠폰 선택</h3>
          <div className={styles.couponSelect}>
            <select
              value={selectedCoupon}
              onChange={(e) => setSelectedCoupon(e.target.value)}
              className={styles.select}
            >
              <option value="">쿠폰을 선택하세요</option>
              {coupons.map((coupon) => (
                <option key={coupon.id} value={coupon.id}>
                  {coupon.name} - {coupon.type === '할인율' ? `${coupon.value}%` : 
                    coupon.type === '할인금액' ? `${coupon.value.toLocaleString()}원` : '무료배송'}
                </option>
              ))}
            </select>
          </div>

          {selectedCoupon && (
            <div className={styles.couponInfo}>
              {(() => {
                const coupon = coupons.find(c => c.id === selectedCoupon);
                if (!coupon) return null;
                
                return (
                  <div className={styles.couponPreview}>
                    <h4>선택된 쿠폰</h4>
                    <div className={styles.couponCard}>
                      <div className={styles.couponType}>
                        {coupon.type === '할인금액' && '💰'}
                        {coupon.type === '할인율' && '📊'}
                        {coupon.type === '무료배송' && '🚚'}
                      </div>
                      <div className={styles.couponDetails}>
                        <h5>{coupon.name}</h5>
                        <p>
                          {coupon.type === '할인율' && `${coupon.value}% 할인`}
                          {coupon.type === '할인금액' && `${coupon.value.toLocaleString()}원 할인`}
                          {coupon.type === '무료배송' && '무료배송'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* 지급 실행 */}
        <div className={styles.section}>
          <h3>3️⃣ 쿠폰 지급</h3>
          <div className={styles.assignSection}>
            {selectedUser && selectedCoupon ? (
              <div className={styles.assignConfirm}>
                <div className={styles.confirmInfo}>
                  <p>
                    <strong>{selectedUser.displayName}</strong>님에게 
                    <strong> {coupons.find(c => c.id === selectedCoupon)?.name}</strong>을(를) 지급하시겠습니까?
                  </p>
                </div>
                <button
                  onClick={assignCouponToUser}
                  className={styles.assignBtn}
                  disabled={isAssigning}
                >
                  {isAssigning ? '지급 중...' : '쿠폰 지급하기'}
                </button>
              </div>
            ) : (
              <div className={styles.assignDisabled}>
                <p>사용자와 쿠폰을 모두 선택해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 지급 내역 */}
      <div className={styles.historySection}>
        <h3>📋 최근 지급 내역</h3>
        <div className={styles.historyList}>
          <div className={styles.historyItem}>
            <div className={styles.historyDate}>2024.08.11 14:30</div>
            <div className={styles.historyContent}>
              <span className={styles.historyUser}>김사용자(user@example.com)</span>에게 
              <span className={styles.historyCoupon}>10% 할인 쿠폰</span> 지급
            </div>
            <div className={styles.historyStatus}>완료</div>
          </div>
          
          <div className={styles.historyItem}>
            <div className={styles.historyDate}>2024.08.11 12:15</div>
            <div className={styles.historyContent}>
              <span className={styles.historyUser}>이고객(customer@example.com)</span>에게 
              <span className={styles.historyCoupon}>무료배송 쿠폰</span> 지급
            </div>
            <div className={styles.historyStatus}>완료</div>
          </div>
        </div>
      </div>
    </div>
  );
}
