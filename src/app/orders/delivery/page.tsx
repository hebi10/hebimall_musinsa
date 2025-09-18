"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/authProvider';
import PageHeader from '@/app/_components/PageHeader';
import styles from './page.module.css';

interface DeliveryInfo {
  orderNumber: string;
  trackingNumber: string;
  courier: string;
  status: 'preparing' | 'shipping' | 'delivered';
  statusText: string;
  recipient: string;
  address: string;
  orderDate: string;
  estimatedDelivery: string;
  history: {
    status: string;
    time: string;
    location: string;
  }[];
}

// 모크 데이터
const mockDeliveryData: { [key: string]: DeliveryInfo } = {
  "240101-12345": {
    orderNumber: "240101-12345",
    trackingNumber: "1234567890123",
    courier: "CJ대한통운",
    status: "shipping",
    statusText: "배송중",
    recipient: "김고객",
    address: "서울특별시 강남구 테헤란로 123, 스티나타워 10층",
    orderDate: "2024-12-10",
    estimatedDelivery: "2024-12-13",
    history: [
      { status: "상품준비완료", time: "2024-12-10 14:30", location: "스티나몰 물류센터" },
      { status: "물류센터 출고", time: "2024-12-11 09:15", location: "고양 물류센터" },
      { status: "간선상차", time: "2024-12-11 18:20", location: "고양 물류센터" },
      { status: "간선하차", time: "2024-12-12 06:30", location: "강남 배송센터" },
      { status: "배송출발", time: "2024-12-12 08:45", location: "강남 배송센터" }
    ]
  },
  "1234567890123": {
    orderNumber: "240101-12345",
    trackingNumber: "1234567890123",
    courier: "CJ대한통운",
    status: "shipping",
    statusText: "배송중",
    recipient: "김고객",
    address: "서울특별시 강남구 테헤란로 123, 스티나타워 10층",
    orderDate: "2024-12-10",
    estimatedDelivery: "2024-12-13",
    history: [
      { status: "상품준비완료", time: "2024-12-10 14:30", location: "스티나몰 물류센터" },
      { status: "물류센터 출고", time: "2024-12-11 09:15", location: "고양 물류센터" },
      { status: "간선상차", time: "2024-12-11 18:20", location: "고양 물류센터" },
      { status: "간선하차", time: "2024-12-12 06:30", location: "강남 배송센터" },
      { status: "배송출발", time: "2024-12-12 08:45", location: "강남 배송센터" }
    ]
  }
};

export default function DeliveryPage() {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    const info = mockDeliveryData[searchValue];
    setDeliveryInfo(info || null);
    setSearched(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'preparing':
        return styles.statusPreparing;
      case 'shipping':
        return styles.statusShipping;
      case 'delivered':
        return styles.statusDelivered;
      default:
        return '';
    }
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
                placeholder="주문번호(240101-12345) 또는 송장번호(1234567890123)를 입력하세요"
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

        {!user && (
          <div className={styles.resultSection}>
            <div className={styles.loginPrompt}>
              <h3>로그인하시면 더 편리하게 이용하실 수 있습니다</h3>
              <p>로그인 후 마이페이지에서 주문내역과 배송현황을 한번에 확인해보세요.</p>
              <Link href="/auth/login" className={styles.loginButton}>
                로그인하기
              </Link>
            </div>
          </div>
        )}

        {searched && (
          <div className={styles.resultSection}>
            {deliveryInfo ? (
              <div className={styles.deliveryInfo}>
                <div className={styles.deliveryHeader}>
                  <div className={styles.orderNumber}>
                    주문번호: {deliveryInfo.orderNumber}
                  </div>
                  <div className={styles.deliveryMeta}>
                    <span>주문일: {deliveryInfo.orderDate}</span>
                    <span className={`${styles.status} ${getStatusClass(deliveryInfo.status)}`}>
                      {deliveryInfo.statusText}
                    </span>
                  </div>
                </div>
                
                <div className={styles.deliveryBody}>
                  <div className={styles.trackingInfo}>
                    <div className={styles.infoLabel}>택배사</div>
                    <div className={styles.infoValue}>{deliveryInfo.courier}</div>
                    
                    <div className={styles.infoLabel}>송장번호</div>
                    <div className={styles.infoValue}>{deliveryInfo.trackingNumber}</div>
                    
                    <div className={styles.infoLabel}>받는 분</div>
                    <div className={styles.infoValue}>{deliveryInfo.recipient}</div>
                    
                    <div className={styles.infoLabel}>배송 주소</div>
                    <div className={styles.infoValue}>{deliveryInfo.address}</div>
                    
                    <div className={styles.infoLabel}>예상 도착일</div>
                    <div className={styles.infoValue}>{deliveryInfo.estimatedDelivery}</div>
                  </div>
                  
                  <div className={styles.trackingHistory}>
                    <div className={styles.historyTitle}>배송 현황</div>
                    {deliveryInfo.history.map((item, index) => (
                      <div key={index} className={styles.historyItem}>
                        <div>
                          <div className={styles.historyStatus}>{item.status}</div>
                          <div>{item.location}</div>
                        </div>
                        <div className={styles.historyTime}>{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.noResult}>
                <h3>조회 결과가 없습니다</h3>
                <p>주문번호 또는 송장번호를 다시 확인해 주세요.</p>
                <div className={styles.note}>
                  • 주문번호: 240101-12345 (테스트용)
                  <br />
                  • 송장번호: 1234567890123 (테스트용)
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
