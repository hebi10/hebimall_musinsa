import Link from "next/link";
import styles from "./page.module.css";

export default function OfflinePage() {
  const stores = [
    {
      id: 1,
      name: "STYNA 강남점",
      type: "플래그십 스토어",
      address: "서울특별시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      hours: "10:00 - 22:00",
      transport: "지하철 2호선 강남역 11번 출구 도보 3분",
      features: ["주차가능", "피팅룸", "개인상담", "당일배송"]
    },
    {
      id: 2,
      name: "STYNA 홍대점",
      type: "컨셉 스토어",
      address: "서울특별시 마포구 양화로 456",
      phone: "02-2345-6789",
      hours: "11:00 - 23:00",
      transport: "지하철 2호선 홍대입구역 9번 출구 도보 5분",
      features: ["24시간 픽업", "스타일링", "이벤트홀"]
    },
    {
      id: 3,
      name: "STYNA 명동점",
      type: "아울렛 스토어",
      address: "서울특별시 중구 명동길 789",
      phone: "02-3456-7890",
      hours: "10:30 - 21:30",
      transport: "지하철 4호선 명동역 6번 출구 도보 2분",
      features: ["할인상품", "면세서비스", "관광객할인"]
    }
  ];

  const services = [
    {
      icon: "👗",
      title: "스타일링 서비스",
      description: "전문 스타일리스트가 개인 맞춤 코디를 제안해드립니다."
    },
    {
      icon: "📦",
      title: "픽업 서비스",
      description: "온라인 주문 상품을 매장에서 편리하게 픽업하세요."
    },
    {
      icon: "✂️",
      title: "수선 서비스",
      description: "구매하신 의류의 길이나 사이즈 수선을 도와드립니다."
    },
    {
      icon: "🔄",
      title: "교환/반품",
      description: "매장에서 직접 교환이나 반품 처리가 가능합니다."
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>오프라인 매장</h1>
          <p className={styles.pageDescription}>
            전국 STYNA 매장에서 직접 체험하고 구매하세요
          </p>
        </div>

        {/* 매장 목록 */}
        <div className={styles.storeGrid}>
          {stores.map(store => (
            <div key={store.id} className={styles.storeCard}>
              <div className={styles.storeImage}>
                🏪
              </div>
              <div className={styles.storeContent}>
                <h3 className={styles.storeName}>{store.name}</h3>
                <div className={styles.storeType}>{store.type}</div>
                
                <div className={styles.storeInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>📍</span>
                    <span className={styles.infoText}>{store.address}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>📞</span>
                    <span className={styles.infoText}>{store.phone}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>🕒</span>
                    <span className={styles.infoText}>{store.hours}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>🚇</span>
                    <span className={styles.infoText}>{store.transport}</span>
                  </div>
                </div>

                <div className={styles.storeFeatures}>
                  {store.features.map((feature, index) => (
                    <span key={index} className={styles.feature}>
                      {feature}
                    </span>
                  ))}
                </div>

                <div className={styles.storeActions}>
                  <Link href={`/offline/${store.id}`} className={`${styles.actionButton} ${styles.primaryAction}`}>
                    상세보기
                  </Link>
                  <button className={`${styles.actionButton} ${styles.secondaryAction}`}>
                    길찾기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 매장 서비스 */}
        <div className={styles.servicesSection}>
          <h2 className={styles.servicesTitle}>
            🛍️ 매장 서비스
          </h2>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceItem}>
                <span className={styles.serviceIcon}>{service.icon}</span>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 운영시간 */}
        <div className={styles.hoursSection}>
          <h2 className={styles.hoursTitle}>
            ⏰ 운영시간
          </h2>
          <div className={styles.hoursGrid}>
            <div className={styles.hoursCard}>
              <h3 className={styles.hoursCardTitle}>
                🏪 평일/주말 운영시간
              </h3>
              <div className={styles.hoursTable}>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>월요일 - 금요일</span>
                  <span className={styles.timeLabel}>10:00 - 22:00</span>
                </div>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>토요일</span>
                  <span className={styles.timeLabel}>10:00 - 23:00</span>
                </div>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>일요일</span>
                  <span className={styles.timeLabel}>11:00 - 22:00</span>
                </div>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>공휴일</span>
                  <span className={`${styles.timeLabel} ${styles.closed}`}>휴무</span>
                </div>
              </div>
            </div>

            <div className={styles.hoursCard}>
              <h3 className={styles.hoursCardTitle}>
                🎯 특별 서비스 시간
              </h3>
              <div className={styles.hoursTable}>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>스타일링 상담</span>
                  <span className={styles.timeLabel}>10:00 - 20:00</span>
                </div>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>수선 서비스</span>
                  <span className={styles.timeLabel}>10:00 - 19:00</span>
                </div>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>픽업 서비스</span>
                  <span className={styles.timeLabel}>24시간</span>
                </div>
                <div className={styles.hoursRow}>
                  <span className={styles.dayLabel}>고객 상담</span>
                  <span className={styles.timeLabel}>09:00 - 21:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 특별 안내사항 */}
        <div className={styles.specialNotice}>
          <h3 className={styles.noticeTitle}>
            📢 특별 안내사항
          </h3>
          <p className={styles.noticeText}>
            • 매장 방문 전 재고 확인을 위해 전화 문의를 권장합니다.<br />
            • 주차공간이 한정되어 있으니 대중교통 이용을 권장합니다.<br />
            • 스타일링 상담은 사전 예약제로 운영됩니다.<br />
            • 코로나19 방역수칙에 따라 운영시간이 변경될 수 있습니다.<br />
            • 매장 이벤트 및 할인 정보는 각 매장별로 상이할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
