"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function TermsPage() {
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
          <h1 className={styles.pageTitle}>이용약관</h1>
          <p className={styles.pageDescription}>
            HEBIMALL 서비스 이용에 관한 약관입니다
          </p>
        </div>

        {/* 최종 업데이트 일자 */}
        <div className={styles.lastUpdated}>
          📅 최종 업데이트: 2024년 1월 1일
        </div>

        {/* 문서 컨테이너 */}
        <div className={styles.documentContainer}>
          {/* 목차 */}
          <div className={styles.tableOfContents}>
            <h2 className={styles.tocTitle}>
              🗂️ 목차
            </h2>
            <ul className={styles.tocList}>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section1')}
                  className={styles.tocLink}
                >
                  제1조 목적
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section2')}
                  className={styles.tocLink}
                >
                  제2조 정의
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section3')}
                  className={styles.tocLink}
                >
                  제3조 약관의 공지 및 효력과 변경
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section4')}
                  className={styles.tocLink}
                >
                  제4조 회원가입
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section5')}
                  className={styles.tocLink}
                >
                  제5조 개인정보 보호
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section6')}
                  className={styles.tocLink}
                >
                  제6조 서비스 이용
                </button>
              </li>
              <li className={styles.tocItem}>
                <button 
                  onClick={() => scrollToSection('section7')}
                  className={styles.tocLink}
                >
                  제7조 책임제한
                </button>
              </li>
            </ul>
          </div>

          {/* 문서 내용 */}
          <div className={styles.documentContent}>
            {/* 제1조 */}
            <section id="section1" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                📝 제1조 (목적)
              </h2>
              <p className={styles.paragraph}>
                이 약관은 HEBIMALL(전자상거래 사업자)이 운영하는 HEBIMALL 사이버 몰(이하 "몰"이라 한다)에서 
                제공하는 인터넷 관련 서비스(이하 "서비스"라 한다)를 이용함에 있어 사이버 몰과 이용자의 
                권리·의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
              <div className={styles.highlight}>
                <div className={styles.highlightTitle}>
                  ⚠️ 중요 안내
                </div>
                <p className={styles.paragraph}>
                  본 약관은 PC통신, 무선 등을 이용하는 전자상거래에 대해서도 그 성질에 반하지 않는 한 준용됩니다.
                </p>
              </div>
            </section>

            {/* 제2조 */}
            <section id="section2" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🔍 제2조 (정의)
              </h2>
              <ul className={styles.list}>
                <li className={styles.listItem}>
                  "몰"이란 HEBIMALL이 재화 또는 용역(이하 "재화 등"이라 함)을 이용자에게 제공하기 위하여 
                  컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 
                  아울러 사이버몰을 운영하는 사업자의 의미로도 사용합니다.
                </li>
                <li className={styles.listItem}>
                  "이용자"란 "몰"에 접속하여 이 약관에 따라 "몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
                </li>
                <li className={styles.listItem}>
                  "회원"이란 "몰"에 회원등록을 한 자로서, 계속적으로 "몰"이 제공하는 서비스를 이용할 수 있는 자를 말합니다.
                </li>
                <li className={styles.listItem}>
                  "비회원"이란 회원에 가입하지 않고 "몰"이 제공하는 서비스를 이용하는 자를 말합니다.
                </li>
              </ul>
            </section>

            {/* 제3조 */}
            <section id="section3" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                📢 제3조 (약관의 공지 및 효력과 변경)
              </h2>
              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>① 약관의 공지</h3>
                <p className={styles.paragraph}>
                  "몰"은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소(소비자의 불만을 처리할 수 있는 곳의 주소를 포함), 
                  전화번호·모사전송번호·전자우편주소, 사업자등록번호, 통신판매업 신고번호, 개인정보보호책임자 등을 
                  이용자가 쉽게 알 수 있도록 HEBIMALL 사이버몰의 초기 서비스화면(전면)에 게시합니다.
                </p>
              </div>
              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>② 약관의 변경</h3>
                <p className={styles.paragraph}>
                  "몰"은 「약관의 규제에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」, 
                  「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
                </p>
              </div>
            </section>

            {/* 제4조 */}
            <section id="section4" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                👤 제4조 (회원가입)
              </h2>
              <p className={styles.paragraph}>
                이용자는 "몰"이 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
              </p>
              <p className={styles.paragraph}>
                "몰"은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              </p>
              <ul className={styles.list}>
                <li className={styles.listItem}>가입신청자가 이 약관 제7조제3항에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li className={styles.listItem}>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li className={styles.listItem}>기타 회원으로 등록하는 것이 "몰"의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </section>

            {/* 제5조 */}
            <section id="section5" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🔒 제5조 (개인정보 보호)
              </h2>
              <p className={styles.paragraph}>
                "몰"은 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.
              </p>
              <p className={styles.paragraph}>
                "몰"은 회원가입시 구매계약이행에 필요한 정보를 미리 수집하지 않습니다. 
                다만, 관련 법령상 의무이행을 위하여 구매계약 이전에 본인확인이 필요한 경우로서 최소한의 특정 개인정보를 수집하는 경우에는 그러하지 아니합니다.
              </p>
              <div className={styles.highlight}>
                <div className={styles.highlightTitle}>
                  🛡️ 개인정보 보호 원칙
                </div>
                <p className={styles.paragraph}>
                  "몰"은 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.
                </p>
              </div>
            </section>

            {/* 제6조 */}
            <section id="section6" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                🛒 제6조 (서비스 이용)
              </h2>
              <p className={styles.paragraph}>
                회원은 "몰"에서 다음과 같은 서비스를 제공받을 수 있습니다.
              </p>
              <ul className={styles.list}>
                <li className={styles.listItem}>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
                <li className={styles.listItem}>구매계약이 체결된 재화 또는 용역의 배송</li>
                <li className={styles.listItem}>기타 "몰"이 정하는 업무</li>
              </ul>
              <p className={styles.paragraph}>
                "몰"은 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 
                제공할 재화 또는 용역의 내용을 변경할 수 있습니다. 이 경우에는 변경된 재화 또는 용역의 내용 및 
                제공일자를 명시하여 현재의 재화 또는 용역의 내용을 게시한 곳에 즉시 공지합니다.
              </p>
            </section>

            {/* 제7조 */}
            <section id="section7" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                ⚖️ 제7조 (책임제한)
              </h2>
              <p className={styles.paragraph}>
                "몰"은 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p className={styles.paragraph}>
                "몰"은 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </p>
              <p className={styles.paragraph}>
                "몰"은 이용자가 서비스를 이용하여 기대하는 손익이나 서비스를 통하여 얻은 자료로 인한 손해에 관하여 
                책임을 지지 않으며, 이용자가 "몰"에 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.
              </p>
            </section>

            {/* 연락처 정보 */}
            <div className={styles.contactInfo}>
              <h2 className={styles.contactTitle}>
                📞 문의사항
              </h2>
              <p className={styles.paragraph}>
                본 약관에 대한 문의사항이 있으시면 아래 연락처로 문의해 주세요.
              </p>
              <div className={styles.contactDetails}>
                <div className={styles.contactDetail}>
                  📧 이메일: legal@hebimall.com
                </div>
                <div className={styles.contactDetail}>
                  ☎️ 전화: 1588-1234
                </div>
                <div className={styles.contactDetail}>
                  🏢 주소: 서울시 강남구 테헤란로 123
                </div>
                <div className={styles.contactDetail}>
                  🕘 운영시간: 평일 09:00-18:00
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
