"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/authProvider';
import PageHeader from '@/app/_components/PageHeader';
import styles from './page.module.css';

export default function DeliveryPage() {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setSearched(true);
  };

  return (
    <>
      <PageHeader title="배송조회" />
      <div className={styles.deliveryContainer}>
        <div className={styles.searchSection}>
          <h2 className={styles.searchTitle}>배송 조회</h2>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label htmlFor="searchValue" className={styles.label}>
                주문번호 또는 송장번호
              </label>
              <input
                type="text"
                id="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={styles.input}
                placeholder="주문번호 또는 송장번호를 입력하세요"
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              조회
            </button>
          </form>
          
          <div className={styles.note}>
            ※ 주문번호는 주문완료 시 발송되는 이메일에서 확인하실 수 있습니다.
            <br />
            ※ 송장번호는 상품 발송 후 SMS로 안내됩니다.
          </div>
        </div>

        <div className={styles.resultSection}>
          <div className={styles.loginPrompt}>
            <h3>
              {user
                ? '주문내역에서 배송 현황을 확인해 주세요'
                : '로그인하면 주문별 배송 현황을 확인할 수 있습니다'}
            </h3>
            <p>
              {user
                ? '현재 배송조회는 주문내역과 연결된 배송 정보 기준으로 제공됩니다.'
                : '회원 주문은 로그인 후 마이페이지 주문내역에서 더 정확하게 확인할 수 있습니다.'}
            </p>
            <Link
              href={user ? '/mypage/order-list' : '/auth/login?redirect=/mypage/order-list'}
              className={styles.loginButton}
            >
              {user ? '주문내역 보기' : '로그인하기'}
            </Link>
          </div>
        </div>

        {searched && (
          <div className={styles.resultSection}>
            <div className={styles.noResult}>
              <h3>바로 조회할 수 있는 배송 정보가 없습니다</h3>
              <p>
                입력하신 번호를 다시 확인해 주세요. 회원 주문은 마이페이지 주문내역에서
                주문 상태와 배송 진행 정보를 함께 확인할 수 있습니다.
              </p>
              {user && (
                <Link href="/mypage/order-list" className={styles.loginButton}>
                  주문내역에서 확인
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
