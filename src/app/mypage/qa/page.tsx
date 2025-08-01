'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface QAItem {
  id: string;
  type: '상품문의' | '배송문의' | '교환/반품' | '기타';
  title: string;
  content: string;
  answer?: string;
  status: '답변완료' | '답변대기';
  date: string;
  productName?: string;
}

export default function QAPage() {
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [showNewQAForm, setShowNewQAForm] = useState(false);

  const typeOptions = ['전체', '상품문의', '배송문의', '교환/반품', '기타'];
  const statusOptions = ['전체', '답변완료', '답변대기'];

  const qaItems: QAItem[] = [
    {
      id: 'QA-001',
      type: '상품문의',
      title: '사이즈 문의드립니다',
      content: '오버핏 후드 스웨트셔츠 L사이즈 실제 치수가 궁금합니다.',
      answer: '안녕하세요. 해당 상품의 L사이즈 실측은 가슴단면 60cm, 총장 70cm입니다.',
      status: '답변완료',
      date: '2024.11.28',
      productName: '오버핏 후드 스웨트셔츠'
    },
    {
      id: 'QA-002',
      type: '배송문의',
      title: '배송 지연 문의',
      content: '주문한 상품이 예정일보다 늦어지고 있는데 언제쯤 받을 수 있을까요?',
      status: '답변대기',
      date: '2024.11.30'
    },
    {
      id: 'QA-003',
      type: '교환/반품',
      title: '교환 가능한가요?',
      content: '색상이 생각했던 것과 달라서 교환하고 싶습니다.',
      answer: '구매일로부터 7일 이내 미착용 상품에 한해 교환이 가능합니다.',
      status: '답변완료',
      date: '2024.11.25',
      productName: '와이드 데님 팬츠'
    }
  ];

  const filteredQAs = qaItems.filter(qa => {
    const typeMatch = selectedType === '전체' || qa.type === selectedType;
    const statusMatch = selectedStatus === '전체' || qa.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>1:1 문의</h2>
        <p className={styles.pageDesc}>궁금한 사항을 문의해보세요. 빠르게 답변해드리겠습니다.</p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>❓</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>총 문의</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>2</div>
            <div className={styles.statLabel}>답변 대기</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>6</div>
            <div className={styles.statLabel}>답변 완료</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>2.5시간</div>
            <div className={styles.statLabel}>평균 답변시간</div>
          </div>
        </div>
      </div>

      {/* Filter and New QA Section */}
      <div className={styles.filterSection}>
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>문의 유형</label>
            <div className={styles.filterButtons}>
              {typeOptions.map((type) => (
                <button
                  key={type}
                  className={`${styles.filterButton} ${selectedType === type ? styles.active : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>답변 상태</label>
            <div className={styles.filterButtons}>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  className={`${styles.filterButton} ${selectedStatus === status ? styles.active : ''}`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.newQAButtonContainer}>
          <button 
            className={styles.newQAButton}
            onClick={() => setShowNewQAForm(!showNewQAForm)}
          >
            <span className={styles.buttonIcon}>✏️</span>
            새 문의 작성
          </button>
        </div>
      </div>

      {/* New QA Form */}
      {showNewQAForm && (
        <div className={styles.newQAForm}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>새 문의 작성</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setShowNewQAForm(false)}
            >
              ✕
            </button>
          </div>
          <form className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>문의 유형</label>
                <select className={styles.formSelect}>
                  <option>상품문의</option>
                  <option>배송문의</option>
                  <option>교환/반품</option>
                  <option>기타</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>관련 상품 (선택)</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  placeholder="상품명을 입력하세요"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>문의 제목</label>
              <input 
                type="text" 
                className={styles.formInput}
                placeholder="문의 제목을 입력하세요"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>문의 내용</label>
              <textarea 
                className={styles.formTextarea}
                placeholder="문의 내용을 상세히 입력해주세요"
                rows={5}
              />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setShowNewQAForm(false)}>
                취소
              </button>
              <button type="submit" className={styles.submitButton}>
                문의 등록
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QA List */}
      <div className={styles.qaSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>문의 내역</h3>
          <div className={styles.resultCount}>총 {filteredQAs.length}건</div>
        </div>

        <div className={styles.qaList}>
          {filteredQAs.length > 0 ? (
            filteredQAs.map((qa) => (
              <div key={qa.id} className={styles.qaCard}>
                <div className={styles.qaHeader}>
                  <div className={styles.qaInfo}>
                    <span className={styles.qaType}>{qa.type}</span>
                    <span className={styles.qaDate}>{qa.date}</span>
                  </div>
                  <div className={`${styles.qaStatus} ${styles[`status-${qa.status}`]}`}>
                    <span className={styles.statusDot}></span>
                    {qa.status}
                  </div>
                </div>

                <div className={styles.qaContent}>
                  <h4 className={styles.qaTitle}>{qa.title}</h4>
                  {qa.productName && (
                    <div className={styles.relatedProduct}>
                      관련 상품: {qa.productName}
                    </div>
                  )}
                  <div className={styles.qaQuestion}>
                    <div className={styles.questionLabel}>Q</div>
                    <div className={styles.questionText}>{qa.content}</div>
                  </div>
                  
                  {qa.answer && (
                    <div className={styles.qaAnswer}>
                      <div className={styles.answerLabel}>A</div>
                      <div className={styles.answerText}>{qa.answer}</div>
                    </div>
                  )}
                </div>

                <div className={styles.qaActions}>
                  <button className={styles.actionButton}>수정</button>
                  <button className={styles.actionButton}>삭제</button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>❓</div>
              <div className={styles.emptyTitle}>문의 내역이 없습니다</div>
              <div className={styles.emptyDesc}>궁금한 사항이 있으시면 언제든 문의해주세요.</div>
              <button 
                className={styles.newQAButton}
                onClick={() => setShowNewQAForm(true)}
              >
                첫 문의 작성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
