import styles from "./page.module.css";

export default function BusinessInfoPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>사업자 정보</h1>
          <p className={styles.pageDescription}>
            HEBIMALL의 사업자 정보 및 연락처를 확인하세요
          </p>
        </div>

        {/* 사업자 정보 그리드 */}
        <div className={styles.infoGrid}>
          {/* 기본 사업자 정보 */}
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>
              🏢 기본 사업자 정보
            </h2>
            <div className={styles.infoTable}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>상호명</span>
                <span className={`${styles.infoValue} ${styles.highlight}`}>
                  주식회사 헤비몰
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>대표자</span>
                <span className={styles.infoValue}>김헤비</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>사업자등록번호</span>
                <span className={styles.infoValue}>123-45-67890</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>통신판매업신고</span>
                <span className={styles.infoValue}>제2024-서울강남-1234호</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>사업장 소재지</span>
                <span className={styles.infoValue}>
                  서울특별시 강남구 테헤란로 123<br />
                  헤비빌딩 5층
                </span>
              </div>
            </div>
          </div>

          {/* 고객서비스 정보 */}
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>
              📞 고객서비스 정보
            </h2>
            <div className={styles.infoTable}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>고객센터</span>
                <span className={`${styles.infoValue} ${styles.highlight}`}>
                  1588-1234
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>운영시간</span>
                <span className={styles.infoValue}>
                  평일 09:00 - 18:00<br />
                  (주말, 공휴일 휴무)
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>이메일</span>
                <span className={styles.infoValue}>cs@hebimall.com</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>팩스</span>
                <span className={styles.infoValue}>02-1234-5679</span>
              </div>
            </div>

            {/* 연락 방법 */}
            <div className={styles.contactMethods}>
              <div className={styles.contactMethod}>
                <span className={styles.contactIcon}>📞</span>
                <div className={styles.contactTitle}>전화 문의</div>
                <div className={styles.contactDetail}>
                  신속한 상담을 원하시면<br />
                  전화로 문의해 주세요
                </div>
              </div>
              <div className={styles.contactMethod}>
                <span className={styles.contactIcon}>✉️</span>
                <div className={styles.contactTitle}>이메일 문의</div>
                <div className={styles.contactDetail}>
                  자세한 내용은<br />
                  이메일로 보내주세요
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오프라인 매장 위치 */}
        <div className={styles.locationSection}>
          <h2 className={styles.locationTitle}>
            📍 오프라인 매장 위치
          </h2>
          
          <div className={styles.mapContainer}>
            <div className={styles.mapPlaceholder}>
              <span className={styles.mapIcon}>🗺️</span>
              <div>지도가 여기에 표시됩니다</div>
              <div>서울시 강남구 테헤란로 123</div>
            </div>
          </div>

          <div className={styles.addressInfo}>
            <div className={styles.addressGrid}>
              <div className={styles.addressItem}>
                <span className={styles.addressIcon}>🏢</span>
                <div className={styles.addressText}>
                  서울특별시 강남구 테헤란로 123<br />
                  헤비빌딩 5층
                </div>
              </div>
              <div className={styles.addressItem}>
                <span className={styles.addressIcon}>🚇</span>
                <div className={styles.addressText}>
                  지하철 2호선 강남역<br />
                  11번 출구에서 도보 5분
                </div>
              </div>
              <div className={styles.addressItem}>
                <span className={styles.addressIcon}>🚌</span>
                <div className={styles.addressText}>
                  강남역 정류장<br />
                  143, 146, 360, 740번
                </div>
              </div>
              <div className={styles.addressItem}>
                <span className={styles.addressIcon}>🚗</span>
                <div className={styles.addressText}>
                  헤비빌딩 지하주차장<br />
                  방문 시 주차 가능
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 법적 정보 */}
        <div className={styles.legalInfo}>
          <h2 className={styles.legalTitle}>
            ⚖️ 법적 정보
          </h2>
          
          <div className={styles.legalGrid}>
            <div className={styles.legalItem}>
              <h3 className={styles.legalItemTitle}>
                📝 개인정보보호책임자
              </h3>
              <div className={styles.legalItemContent}>
                <strong>성명:</strong> 박개인<br />
                <strong>연락처:</strong> privacy@hebimall.com<br />
                <strong>전화:</strong> 02-1234-5680
              </div>
            </div>

            <div className={styles.legalItem}>
              <h3 className={styles.legalItemTitle}>
                🏦 호스팅 서비스
              </h3>
              <div className={styles.legalItemContent}>
                <strong>제공업체:</strong> Amazon Web Services<br />
                <strong>위치:</strong> 아시아 태평양 (서울)<br />
                <strong>보안등급:</strong> ISO 27001 인증
              </div>
            </div>

            <div className={styles.legalItem}>
              <h3 className={styles.legalItemTitle}>
                💳 전자결제 대행
              </h3>
              <div className={styles.legalItemContent}>
                <strong>제공업체:</strong> KG이니시스<br />
                <strong>고객센터:</strong> 1588-4954<br />
                <strong>보안인증:</strong> PCI-DSS Level 1
              </div>
            </div>

            <div className={styles.legalItem}>
              <h3 className={styles.legalItemTitle}>
                🚚 물류 서비스
              </h3>
              <div className={styles.legalItemContent}>
                <strong>제공업체:</strong> CJ대한통운<br />
                <strong>고객센터:</strong> 1588-1255<br />
                <strong>배송조회:</strong> doortodoor.co.kr
              </div>
            </div>
          </div>
        </div>

        {/* 중요 안내사항 */}
        <div className={styles.warningBox}>
          <h3 className={styles.warningTitle}>
            ⚠️ 중요 안내사항
          </h3>
          <p className={styles.warningText}>
            • 전자상거래 등에서의 소비자보호에 관한 법률에 따른 반품, 교환, 환불 등은 
            각 상품별 상세페이지 및 고객센터를 통해 안내받으실 수 있습니다.<br />
            • 미성년자가 결제하는 경우, 법정대리인이 그 거래를 취소할 수 있습니다.<br />
            • 상품의 색상은 모니터 사양에 따라 실제와 다를 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
