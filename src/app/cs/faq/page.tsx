"use client";

import { useState } from 'react';
import styles from './page.module.css';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQ[] = [
  {
    id: 1,
    category: "주문/결제",
    question: "주문 취소는 언제까지 가능한가요?",
    answer: "상품 발송 전까지 주문 취소가 가능합니다. 마이페이지 > 주문내역에서 직접 취소하거나 고객센터로 연락해 주세요. 이미 발송된 상품은 배송완료 후 교환/반품 절차를 진행해 주시기 바랍니다."
  },
  {
    id: 2,
    category: "배송",
    question: "배송기간은 얼마나 걸리나요?",
    answer: "일반 배송의 경우 주문일 기준 1-3일(영업일) 내 배송됩니다. 도서산간 지역은 추가 1-2일이 소요될 수 있습니다. 당일배송 서비스 지역의 경우 오후 3시 이전 주문 시 당일 배송이 가능합니다."
  },
  {
    id: 3,
    category: "교환/반품",
    question: "교환/반품은 어떻게 하나요?",
    answer: "배송완료일로부터 7일 이내에 마이페이지 > 주문내역에서 교환/반품 신청이 가능합니다. 상품택 제거, 착용흔적, 세탁 등으로 상품가치가 훼손된 경우 교환/반품이 어려울 수 있습니다."
  },
  {
    id: 4,
    category: "회원정보",
    question: "비밀번호를 잊어버렸어요.",
    answer: "로그인 페이지의 '비밀번호 찾기'를 클릭하여 가입 시 등록한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다. 이메일을 받지 못하신 경우 스팸함을 확인해 주세요."
  },
  {
    id: 5,
    category: "적립금/쿠폰",
    question: "적립금은 언제 지급되나요?",
    answer: "구매확정일로부터 24시간 이내에 적립됩니다. 적립금은 다음 주문 시 1원 단위부터 사용 가능하며, 유효기간은 적립일로부터 1년입니다."
  },
  {
    id: 6,
    category: "사이즈",
    question: "사이즈 교환이 가능한가요?",
    answer: "사이즈가 맞지 않는 경우 배송완료일로부터 7일 이내에 1회에 한해 무료 사이즈 교환이 가능합니다. 단, 상품택 제거나 착용흔적이 있는 경우 교환이 어려울 수 있습니다."
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categoryStats = faqData.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.faqContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>자주 묻는 질문</h1>
        <p className={styles.pageSubtitle}>
          STYNA 이용 중 궁금한 점을 빠르게 해결해보세요
        </p>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{faqData.length}</span>
          <span className={styles.statLabel}>총 FAQ</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{Object.keys(categoryStats).length}</span>
          <span className={styles.statLabel}>카테고리</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{filteredFAQs.length}</span>
          <span className={styles.statLabel}>검색 결과</span>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchIcon}>🔍</div>
        <input
          type="text"
          placeholder="궁금한 내용을 검색해보세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.faqList}>
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => (
            <div key={faq.id} className={styles.faqItem}>
              <button
                className={styles.question}
                onClick={() => toggleItem(faq.id)}
              >
                <div className={styles.questionText}>
                  <div className={styles.category}>{faq.category}</div>
                  {faq.question}
                </div>
                <span className={`${styles.icon} ${openItems.includes(faq.id) ? styles.iconRotated : ''}`}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M6 9L12 15L18 9" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              {openItems.includes(faq.id) && (
                <div className={styles.answer}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 키워드로 검색해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
