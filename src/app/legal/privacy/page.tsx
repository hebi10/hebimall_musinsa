"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function PrivacyPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>개인정보처리방침</h1>
          <p className={styles.pageDescription}>
            고객의 개인정보 보호를 위한 HEBIMALL의 정책입니다
          </p>
        </div>

        {/* 최종 업데이트 일자 */}
        <div className={styles.lastUpdated}>
          🔄 최종 업데이트: 2024년 1월 1일 | 시행일자: 2024년 1월 1일
        </div>

        {/* 문서 컨테이너 */}
        <div className={styles.documentContainer}>
          {/* 목차 */}
          <div className={styles.tableOfContents}>
            <h2 className={styles.tocTitle}>
              📋 목차
            </h2>
            <ul className={styles.tocList}>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section1')}
                  className={styles.tocLink}
                >
                  1. 개인정보의 처리목적
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section2')}
                  className={styles.tocLink}
                >
                  2. 개인정보의 처리 및 보유기간
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section3')}
                  className={styles.tocLink}
                >
                  3. 개인정보의 제3자 제공
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section4')}
                  className={styles.tocLink}
                >
                  4. 개인정보처리의 위탁
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section5')}
                  className={styles.tocLink}
                >
                  5. 정보주체의 권리·의무
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section6')}
                  className={styles.tocLink}
                >
                  6. 개인정보의 안전성 확보조치
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section7')}
                  className={styles.tocLink}
                >
                  7. 개인정보보호책임자
                </button>
              </li>
            </ul>
          </div>

          {/* 문서 내용 */}
          <div className={styles.documentContent}>
            {/* 전문 */}
            <div className={styles.highlight}>
              <div className={styles.highlightTitle}>
                🛡️ 개인정보 보호 약속
              </div>
              <p className={styles.paragraph}>
                HEBIMALL은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 
                이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 
                개인정보 처리방침을 수립·공개합니다.
              </p>
            </div>

            {/* 제1조 */}
            <section id="section1" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🎯 1. 개인정보의 처리목적
              </h2>
              <p className={styles.paragraph}>
                HEBIMALL은 다음의 목적을 위하여 개인정보를 처리합니다. 
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              
              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>① 홈페이지 회원가입 및 관리</h3>
                <ul className={styles.list}>
                  <li className={styles.listItem}>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li className={styles.listItem}>회원자격 유지·관리, 서비스 부정이용 방지</li>
                  <li className={styles.listItem}>각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>② 재화 또는 서비스 제공</h3>
                <ul className={styles.list}>
                  <li className={styles.listItem}>물품배송, 서비스 제공, 계약서·청구서 발송</li>
                  <li className={styles.listItem}>콘텐츠 제공, 맞춤서비스 제공, 본인인증</li>
                  <li className={styles.listItem}>요금결제·정산 목적으로 개인정보를 처리합니다.</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>③ 고충처리</h3>
                <p className={styles.paragraph}>
                  민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 
                  처리결과 통보 목적으로 개인정보를 처리합니다.
                </p>
              </div>
            </section>

            {/* 제2조 */}
            <section id="section2" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                ⏱️ 2. 개인정보의 처리 및 보유기간
              </h2>
              <p className={styles.paragraph}>
                HEBIMALL은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 
                수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>처리목적</th>
                    <th>개인정보 항목</th>
                    <th>보유기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>회원가입 및 관리</td>
                    <td className={styles.tableCell}>이름, 이메일, 전화번호, 주소</td>
                    <td className={styles.tableCell}>회원탈퇴 후 5년</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>재화 또는 서비스 제공</td>
                    <td className={styles.tableCell}>이름, 전화번호, 주소, 결제정보</td>
                    <td className={styles.tableCell}>계약 종료 후 5년</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>고객상담, 불만처리</td>
                    <td className={styles.tableCell}>이름, 이메일, 전화번호</td>
                    <td className={styles.tableCell}>처리 완료 후 3년</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 제3조 */}
            <section id="section3" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🤝 3. 개인정보의 제3자 제공
              </h2>
              <p className={styles.paragraph}>
                HEBIMALL은 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
              
              <div className={styles.warningBox}>
                <div className={styles.warningTitle}>
                  ⚠️ 중요사항
                </div>
                <p className={styles.paragraph}>
                  HEBIMALL은 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서 처리하며, 
                  정보주체의 사전 동의 없이는 본래의 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
                </p>
              </div>

              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>다음의 경우에는 예외적으로 제3자 제공이 가능합니다:</h3>
                <ul className={styles.list}>
                  <li className={styles.listItem}>정보주체로부터 별도의 동의를 받은 경우</li>
                  <li className={styles.listItem}>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                  <li className={styles.listItem}>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
                </ul>
              </div>
            </section>

            {/* 제4조 */}
            <section id="section4" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🏢 4. 개인정보처리의 위탁
              </h2>
              <p className={styles.paragraph}>
                HEBIMALL은 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>위탁받는 자</th>
                    <th>위탁하는 업무의 내용</th>
                    <th>위탁기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>CJ대한통운</td>
                    <td className={styles.tableCell}>상품 배송 서비스</td>
                    <td className={styles.tableCell}>위탁계약 종료시까지</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>KG이니시스</td>
                    <td className={styles.tableCell}>결제 처리 서비스</td>
                    <td className={styles.tableCell}>위탁계약 종료시까지</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>AWS</td>
                    <td className={styles.tableCell}>클라우드 서버 호스팅</td>
                    <td className={styles.tableCell}>위탁계약 종료시까지</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 제5조 */}
            <section id="section5" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                ✋ 5. 정보주체의 권리·의무 및 행사방법
              </h2>
              <p className={styles.paragraph}>
                정보주체는 HEBIMALL에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              </p>

              <ul className={styles.list}>
                <li className={styles.listItem}>개인정보 처리현황 통지요구</li>
                <li className={styles.listItem}>개인정보 열람요구</li>
                <li className={styles.listItem}>개인정보 정정·삭제요구</li>
                <li className={styles.listItem}>개인정보 처리정지요구</li>
              </ul>

              <div className={styles.highlight}>
                <div className={styles.highlightTitle}>
                  📞 권리 행사 방법
                </div>
                <p className={styles.paragraph}>
                  위의 권리 행사는 HEBIMALL에 대해 「개인정보 보호법」 시행령 제41조제1항에 따라 
                  서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며, 
                  HEBIMALL은 이에 대해 지체 없이 조치하겠습니다.
                </p>
              </div>
            </section>

            {/* 제6조 */}
            <section id="section6" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🔒 6. 개인정보의 안전성 확보조치
              </h2>
              <p className={styles.paragraph}>
                HEBIMALL은 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.
              </p>

              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>① 기술적 조치</h3>
                <ul className={styles.list}>
                  <li className={styles.listItem}>개인정보처리시스템 등의 접근권한 관리</li>
                  <li className={styles.listItem}>접근통제시스템 설치 및 접근통제</li>
                  <li className={styles.listItem}>개인정보의 암호화</li>
                  <li className={styles.listItem}>보안프로그램 설치 및 갱신</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>② 관리적 조치</h3>
                <ul className={styles.list}>
                  <li className={styles.listItem}>개인정보 취급 직원의 최소화 및 교육</li>
                  <li className={styles.listItem}>개인정보 취급자에 대한 접근 권한의 제한조치</li>
                  <li className={styles.listItem}>개인정보 취급 직원에 대한 정기적인 교육 실시</li>
                </ul>
              </div>

              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>③ 물리적 조치</h3>
                <ul className={styles.list}>
                  <li className={styles.listItem}>전산실, 자료보관실 등의 접근통제</li>
                  <li className={styles.listItem}>개인정보가 포함된 서류, 보조저장매체 등의 잠금장치 사용</li>
                </ul>
              </div>
            </section>

            {/* 제7조 */}
            <section id="section7" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                👨‍💼 7. 개인정보보호책임자
              </h2>
              <p className={styles.paragraph}>
                HEBIMALL은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>

              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>구분</th>
                    <th>개인정보보호책임자</th>
                    <th>개인정보보호담당자</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>성명</td>
                    <td className={styles.tableCell}>김개인</td>
                    <td className={styles.tableCell}>이정보</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>직책</td>
                    <td className={styles.tableCell}>개인정보보호책임자</td>
                    <td className={styles.tableCell}>개인정보보호담당자</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell}>연락처</td>
                    <td className={styles.tableCell}>privacy@hebimall.com<br/>02-1234-5678</td>
                    <td className={styles.tableCell}>info@hebimall.com<br/>02-1234-5679</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 연락처 정보 */}
            <div className={styles.contactInfo}>
              <h2 className={styles.contactTitle}>
                📞 개인정보 침해신고센터
              </h2>
              <p className={styles.paragraph}>
                개인정보 침해로 인한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
              </p>
              <div className={styles.contactDetails}>
                <div className={styles.contactDetail}>
                  🏛️ 개인정보침해신고센터: privacy.go.kr (국번없이 182)
                </div>
                <div className={styles.contactDetail}>
                  🏛️ 개인정보 분쟁조정위원회: www.kopico.go.kr (국번없이 1833-6972)
                </div>
                <div className={styles.contactDetail}>
                  🏛️ 대검찰청 사이버범죄수사단: www.spo.go.kr (국번없이 1301)
                </div>
                <div className={styles.contactDetail}>
                  🏛️ 경찰청 사이버테러대응센터: cctc.police.go.kr (국번없이 182)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 맨 위로 버튼 */}
        <button
          onClick={scrollToTop}
          className={`${styles.backToTop} ${showBackToTop ? styles.visible : ''}`}
        >
          ⬆️
        </button>
      </div>
    </div>
  );
}
