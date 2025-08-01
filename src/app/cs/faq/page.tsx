"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'order', name: '주문/결제' },
    { id: 'delivery', name: '배송' },
    { id: 'return', name: '교환/반품' },
    { id: 'member', name: '회원' },
    { id: 'product', name: '상품' }
  ];

  const faqData = [
    {
      id: '1',
      category: 'order',
      question: '주문 취소는 어떻게 하나요?',
      answer: '주문 완료 후 배송 준비 중 상태가 되기 전까지 마이페이지 > 주문내역에서 직접 취소하실 수 있습니다. 배송 준비 중 이후에는 고객센터로 문의해 주세요.'
    },
    {
      id: '2',
      category: 'delivery',
      question: '배송비는 얼마인가요?',
      answer: '30,000원 이상 구매 시 무료배송이며, 30,000원 미만 구매 시 배송비 2,500원이 부과됩니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.'
    },
    {
      id: '3',
      category: 'return',
      question: '교환/반품 기간은 얼마나 되나요?',
      answer: '상품 수령일로부터 7일 이내에 교환/반품 신청이 가능합니다. 단, 상품의 포장이 훼손되거나 사용 흔적이 있는 경우 교환/반품이 제한될 수 있습니다.'
    },
    {
      id: '4',
      category: 'member',
      question: '회원가입 혜택이 있나요?',
      answer: '신규 회원가입 시 10% 할인 쿠폰과 2,000원 적립금을 지급해 드립니다. 또한 등급별로 다양한 혜택을 제공합니다.'
    },
    {
      id: '5',
      category: 'product',
      question: '품절된 상품은 언제 재입고되나요?',
      answer: '재입고 일정은 상품별로 다르며, 재입고 알림 신청을 해두시면 재입고 시 SMS 또는 이메일로 알려드립니다.'
    },
    {
      id: '6',
      category: 'order',
      question: '결제 수단은 어떤 것들이 있나요?',
      answer: '신용카드, 계좌이체, 무통장입금, 카카오페이, 네이버페이, 페이코 등 다양한 결제 수단을 지원합니다.'
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>자주 묻는 질문</h1>
          <p className={styles.pageDescription}>
            궁금한 점이 있으시면 먼저 FAQ를 확인해보세요
          </p>
        </div>

        {/* 검색 섹션 */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="궁금한 점을 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              🔍
            </button>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`${styles.categoryButton} ${
                activeCategory === category.id ? styles.active : ''
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ 목록 */}
        <div className={styles.faqGrid}>
          {filteredFAQs.map(faq => (
            <div 
              key={faq.id} 
              className={`${styles.faqItem} ${
                openItems.includes(faq.id) ? styles.active : ''
              }`}
            >
              <div 
                className={styles.faqQuestion}
                onClick={() => toggleItem(faq.id)}
              >
                <h3 className={styles.questionText}>
                  Q. {faq.question}
                </h3>
                <span className={styles.questionIcon}>
                  ▼
                </span>
              </div>
              <div className={styles.faqAnswer}>
                <p className={styles.answerText}>
                  A. {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 연락처 섹션 */}
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>
            원하는 답변을 찾지 못하셨나요?
          </h2>
          <p className={styles.contactDescription}>
            고객센터를 통해 1:1 문의를 남겨주시면<br />
            빠르고 정확한 답변을 드리겠습니다.
          </p>
          <Link href="/cs/contact" className={styles.contactButton}>
            📞 고객센터 문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
