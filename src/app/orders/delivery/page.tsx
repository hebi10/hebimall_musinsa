"use client";

import { useState, FormEvent } from "react";
import styles from "./page.module.css";

interface DeliveryData {
  trackingNumber: string;
  status: string;
  statusText: string;
  courier: string;
  estimatedDelivery: string;
  currentLocation: string;
  recipient: {
    name: string;
    address: string;
    phone: string;
  };
  history: Array<{
    time: string;
    status: string;
    location: string;
    icon: string;
  }>;
}

export default function DeliveryPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchResult, setSearchResult] = useState<DeliveryData | null>(null);

  // 예시 배송 데이터
  const mockDeliveryData: DeliveryData = {
    trackingNumber: "1234567890123",
    status: "shipping",
    statusText: "배송 중",
    courier: "CJ대한통운",
    estimatedDelivery: "2024-01-22 (월)",
    currentLocation: "서울 강남구 배송센터",
    recipient: {
      name: "김**",
      address: "서울특별시 강남구 테헤란로 ***",
      phone: "010-****-5678"
    },
    history: [
      {
        time: "2024-01-20 14:30",
        status: "배송 출발",
        location: "서울 강남구 배송센터",
        icon: "🚚"
      },
      {
        time: "2024-01-20 09:15",
        status: "배송센터 도착",
        location: "서울 강남구 배송센터",
        icon: "🏢"
      },
      {
        time: "2024-01-19 18:45",
        status: "중간 경유지 출발",
        location: "경기 성남시 물류센터",
        icon: "📦"
      },
      {
        time: "2024-01-19 10:20",
        status: "상품 준비 완료",
        location: "HEBIMALL 물류센터",
        icon: "✅"
      }
    ]
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      // 실제로는 API 호출
      setSearchResult(mockDeliveryData);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "preparing": return "preparing";
      case "shipping": return "shipping";
      case "delivered": return "delivered";
      default: return "preparing";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>배송 조회</h1>
          <p className={styles.pageDescription}>
            운송장 번호로 실시간 배송 상태를 확인하세요
          </p>
        </div>

        {/* 검색 섹션 */}
        <div className={styles.searchSection}>
          <h2 className={styles.searchTitle}>
            🔍 운송장 번호 입력
          </h2>
          
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="운송장 번호를 입력하세요 (예: 1234567890123)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              🔎 조회하기
            </button>
          </form>

          <div className={styles.searchTips}>
            <div className={styles.tipsTitle}>
              💡 조회 안내
            </div>
            <ul className={styles.tipsList}>
              <li className={styles.tipsItem}>운송장 번호는 주문 완료 후 발송 시 SMS/이메일로 안내됩니다</li>
              <li className={styles.tipsItem}>배송 정보는 실시간으로 업데이트되며, 다소 지연될 수 있습니다</li>
              <li className={styles.tipsItem}>배송 관련 문의는 각 택배사 고객센터로 연락해 주세요</li>
            </ul>
          </div>
        </div>

        {/* 배송 조회 결과 */}
        {searchResult && (
          <div className={styles.deliveryResult}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>
                📦 배송 조회 결과
              </h3>
              <div className={styles.trackingNumber}>
                운송장 번호: {searchResult.trackingNumber}
              </div>
              <div className={`${styles.statusBadge} ${styles[getStatusBadgeClass(searchResult.status)]}`}>
                {searchResult.statusText}
              </div>
            </div>

            {/* 배송 진행 상태 */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={`${styles.progressStep} ${styles.completed}`}>
                  📦
                </div>
                <div className={`${styles.progressStep} ${styles.completed}`}>
                  🏢
                </div>
                <div className={`${styles.progressStep} ${styles.active}`}>
                  🚚
                </div>
                <div className={styles.progressStep}>
                  🏠
                </div>
              </div>
              <div className={styles.stepLabels}>
                <div className={`${styles.stepLabel} ${styles.completed}`}>
                  상품준비
                </div>
                <div className={`${styles.stepLabel} ${styles.completed}`}>
                  배송센터
                </div>
                <div className={`${styles.stepLabel} ${styles.active}`}>
                  배송중
                </div>
                <div className={styles.stepLabel}>
                  배송완료
                </div>
              </div>
            </div>

            {/* 배송 정보 */}
            <div className={styles.deliveryInfo}>
              <div className={styles.infoCard}>
                <h4 className={styles.infoTitle}>
                  🚚 배송 정보
                </h4>
                <div className={styles.infoContent}>
                  <strong>택배사:</strong> {searchResult.courier}<br />
                  <strong>예상 도착:</strong> {searchResult.estimatedDelivery}<br />
                  <strong>현재 위치:</strong> {searchResult.currentLocation}
                </div>
              </div>

              <div className={styles.infoCard}>
                <h4 className={styles.infoTitle}>
                  📋 수령인 정보
                </h4>
                <div className={styles.infoContent}>
                  <strong>수령인:</strong> {searchResult.recipient.name}<br />
                  <strong>주소:</strong> {searchResult.recipient.address}<br />
                  <strong>연락처:</strong> {searchResult.recipient.phone}
                </div>
              </div>
            </div>

            {/* 배송 추적 기록 */}
            <div className={styles.trackingHistory}>
              <h4 className={styles.historyTitle}>
                📄 배송 추적 기록
              </h4>
              <ul className={styles.historyList}>
                {searchResult.history.map((item, index) => (
                  <li key={index} className={styles.historyItem}>
                    <div className={styles.historyIcon}>
                      {item.icon}
                    </div>
                    <div className={styles.historyContent}>
                      <div className={styles.historyTime}>{item.time}</div>
                      <div className={styles.historyStatus}>{item.status}</div>
                      <div className={styles.historyLocation}>{item.location}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 조회 결과가 없을 때 */}
        {!searchResult && (
          <div className={styles.deliveryResult}>
            <div className={styles.resultHeader}>
              <h3 className={styles.resultTitle}>
                📋 배송 조회 가이드
              </h3>
            </div>
            
            <div className={styles.deliveryInfo}>
              <div className={styles.infoCard}>
                <h4 className={styles.infoTitle}>
                  📞 택배사 고객센터
                </h4>
                <div className={styles.infoContent}>
                  <strong>CJ대한통운:</strong> 1588-1255<br />
                  <strong>롯데택배:</strong> 1588-2121<br />
                  <strong>한진택배:</strong> 1588-0011<br />
                  <strong>우체국택배:</strong> 1588-1300
                </div>
              </div>

              <div className={styles.infoCard}>
                <h4 className={styles.infoTitle}>
                  💡 배송 안내
                </h4>
                <div className={styles.infoContent}>
                  • 평일 오후 5시 이전 주문: 당일 발송<br />
                  • 주말/공휴일 주문: 익일 발송<br />
                  • 도서산간 지역: 1-2일 추가 소요<br />
                  • 제주도: 2-3일 추가 소요
                </div>
              </div>

              <div className={styles.infoCard}>
                <h4 className={styles.infoTitle}>
                  🎯 배송 옵션
                </h4>
                <div className={styles.infoContent}>
                  • 일반배송: 2-3일 소요<br />
                  • 익일배송: 다음날 오후 도착<br />
                  • 당일배송: 서울/경기 일부 지역<br />
                  • 새벽배송: 오전 7시 전 배송
                </div>
              </div>

              <div className={styles.infoCard}>
                <h4 className={styles.infoTitle}>
                  📱 고객센터
                </h4>
                <div className={styles.infoContent}>
                  <strong>HEBIMALL 고객센터</strong><br />
                  📞 1588-1234<br />
                  ⏰ 평일 09:00-18:00<br />
                  ✉️ cs@hebimall.com
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
