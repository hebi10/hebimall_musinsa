import styles from './page.module.css';

export default function BusinessInfoPage() {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.title}>사업자 정보</h2>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoLabel}>회사명</div>
          <div className={styles.infoValue}>㈜스티나몰</div>
          
          <div className={styles.infoLabel}>대표자</div>
          <div className={styles.infoValue}>김스티나</div>
          
          <div className={styles.infoLabel}>사업자등록번호</div>
          <div className={styles.infoValue}>123-45-67890</div>
          
          <div className={styles.infoLabel}>통신판매업 신고번호</div>
          <div className={styles.infoValue}>제2024-서울강남-12345호</div>
          
          <div className={styles.infoLabel}>개인정보보호책임자</div>
          <div className={styles.infoValue}>이프라이버시 (privacy@hebimall.com)</div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.infoGrid}>
          <div className={styles.infoLabel}>주소</div>
          <div className={styles.infoValue}>
            서울특별시 강남구 테헤란로 123, 스티나타워 10층
            <br />
            (우편번호: 06234)
          </div>
          
          <div className={styles.infoLabel}>고객센터</div>
          <div className={styles.infoValue}>
            <span className={styles.highlight}>1588-1234</span>
            <br />
            평일 09:00~18:00 (점심시간 12:00~13:00)
            <br />
            토요일, 일요일, 공휴일 휴무
          </div>
          
          <div className={styles.infoLabel}>이메일</div>
          <div className={styles.infoValue}>
            고객문의: cs@hebimall.com
            <br />
            제휴문의: partnership@hebimall.com
          </div>
        </div>

        <div className={styles.note}>
          ※ 위 정보는 전자상거래 등에서의 소비자보호에 관한 법률에 따라 공개하는 정보입니다.
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.title}>호스팅 서비스</h2>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoLabel}>호스팅 제공업체</div>
          <div className={styles.infoValue}>Vercel Inc.</div>
          
          <div className={styles.infoLabel}>서비스 지역</div>
          <div className={styles.infoValue}>글로벌 CDN</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.title}>결제 및 환불 정보</h2>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoLabel}>결제 수단</div>
          <div className={styles.infoValue}>
            신용카드, 실시간 계좌이체, 무통장입금
            <br />
            카카오페이, 네이버페이, 페이코
          </div>
          
          <div className={styles.infoLabel}>배송업체</div>
          <div className={styles.infoValue}>
            CJ대한통운, 롯데택배, 한진택배
          </div>
          
          <div className={styles.infoLabel}>교환/반품 주소</div>
          <div className={styles.infoValue}>
            경기도 고양시 덕양구 권율대로 570
            <br />
            스티나몰 물류센터 (우편번호: 10326)
          </div>
        </div>

        <div className={styles.note}>
          ※ 상품별로 배송업체가 다를 수 있으며, 교환/반품 시에는 반드시 고객센터를 통해 사전 신청 후 발송해 주시기 바랍니다.
        </div>
      </div>
    </div>
  );
}
