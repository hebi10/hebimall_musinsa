'use client';

import { useState, useEffect } from 'react';
import { InquiryService } from '@/shared/services/inquiryService';
import { Inquiry } from '@/shared/types/inquiry';
import styles from './page.module.css';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [answerContent, setAnswerContent] = useState('');

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'waiting', label: '답변대기' },
    { value: 'answered', label: '답변완료' },
    { value: 'closed', label: '처리완료' },
  ];

  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: 'order', label: '주문/결제' },
    { value: 'delivery', label: '배송' },
    { value: 'exchange', label: '교환/반품' },
    { value: 'product', label: '상품문의' },
    { value: 'account', label: '회원정보' },
    { value: 'other', label: '기타' },
  ];

  // 문의 목록 로드
  const loadInquiries = async () => {
    try {
      setLoading(true);
      const allInquiries = await InquiryService.getAllInquiries(100);
      
      // 필터링
      let filteredInquiries = allInquiries;
      
      if (selectedFilter !== 'all') {
        filteredInquiries = filteredInquiries.filter(inquiry => inquiry.status === selectedFilter);
      }
      
      if (selectedCategory !== 'all') {
        filteredInquiries = filteredInquiries.filter(inquiry => inquiry.category === selectedCategory);
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredInquiries = filteredInquiries.filter(inquiry =>
          inquiry.title.toLowerCase().includes(searchLower) ||
          inquiry.content.toLowerCase().includes(searchLower) ||
          inquiry.userName.toLowerCase().includes(searchLower)
        );
      }
      
      setInquiries(filteredInquiries);
    } catch (err) {
      setError('문의 목록을 불러오는데 실패했습니다.');
      console.error('Error loading inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [selectedFilter, selectedCategory]);

  // 검색 처리
  const handleSearch = () => {
    loadInquiries();
  };

  // 답변 모달 열기
  const openAnswerModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswerContent(inquiry.answer?.content || '');
    setShowAnswerModal(true);
  };

  // 답변 저장
  const handleAnswerSubmit = async () => {
    if (!selectedInquiry || !answerContent.trim()) return;

    try {
      await InquiryService.answerInquiry(selectedInquiry.id, {
        content: answerContent,
        answeredBy: 'Admin', // 실제 관리자 정보로 대체 가능
      });

      alert('답변이 저장되었습니다.');
      setShowAnswerModal(false);
      setSelectedInquiry(null);
      setAnswerContent('');
      loadInquiries();
    } catch (err) {
      alert('답변 저장에 실패했습니다.');
      console.error('Error saving answer:', err);
    }
  };

  // 상태 변경
  const handleStatusChange = async (inquiryId: string, newStatus: Inquiry['status']) => {
    try {
      await InquiryService.updateInquiryStatus(inquiryId, newStatus);
      loadInquiries();
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error('Error updating status:', err);
    }
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 카테고리 라벨
  const getCategoryLabel = (category: string) => {
    const found = categoryOptions.find(opt => opt.value === category);
    return found ? found.label : category;
  };

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    const found = statusOptions.find(opt => opt.value === status);
    return found ? found.label : status;
  };

  // 통계 계산
  const stats = {
    total: inquiries.length,
    waiting: inquiries.filter(i => i.status === 'waiting').length,
    answered: inquiries.filter(i => i.status === 'answered').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>문의 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>1:1 문의 관리</h1>
        <p className={styles.subtitle}>고객 문의를 관리하고 답변할 수 있습니다</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <h3>전체 문의</h3>
            <span className={styles.statNumber}>{stats.total}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <h3>답변 대기</h3>
            <span className={`${styles.statNumber} ${styles.waiting}`}>{stats.waiting}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3>답변 완료</h3>
            <span className={`${styles.statNumber} ${styles.answered}`}>{stats.answered}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔒</div>
          <div className={styles.statContent}>
            <h3>처리 완료</h3>
            <span className={`${styles.statNumber} ${styles.closed}`}>{stats.closed}</span>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="제목, 내용, 작성자로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.searchInput}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            검색
          </button>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>상태</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>카테고리</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className={styles.inquiryList}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadInquiries} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        )}

        {inquiries.length === 0 && !error && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>조건에 맞는 문의가 없습니다</h3>
            <p>필터를 조정해보세요.</p>
          </div>
        )}

        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className={styles.inquiryCard}>
            <div className={styles.inquiryHeader}>
              <div className={styles.inquiryInfo}>
                <span className={`${styles.category} ${styles[inquiry.category]}`}>
                  {getCategoryLabel(inquiry.category)}
                </span>
                <span className={`${styles.status} ${styles[inquiry.status]}`}>
                  {getStatusLabel(inquiry.status)}
                </span>
                {inquiry.status === 'waiting' && (
                  <span className={styles.priority}>🚨 처리필요</span>
                )}
              </div>
              <div className={styles.inquiryStats}>
                <span className={styles.date}>{formatDate(inquiry.createdAt)}</span>
              </div>
            </div>

            <div className={styles.inquiryContent}>
              <h3 className={styles.inquiryTitle}>{inquiry.title}</h3>
              <div className={styles.inquiryDetails}>
                <span className={styles.author}>작성자: {inquiry.userName}</span>
                <span className={styles.email}>({inquiry.userEmail})</span>
              </div>
              <div className={styles.inquiryQuestion}>
                <strong>문의내용:</strong>
                <p>{inquiry.content}</p>
              </div>

              {inquiry.answer && (
                <div className={styles.inquiryAnswer}>
                  <div className={styles.answerHeader}>
                    <strong>답변:</strong>
                    <span className={styles.answeredBy}>
                      {inquiry.answer.answeredBy} | {formatDate(inquiry.answer.answeredAt)}
                    </span>
                  </div>
                  <p>{inquiry.answer.content}</p>
                </div>
              )}
            </div>

            <div className={styles.inquiryActions}>
              <button
                onClick={() => openAnswerModal(inquiry)}
                className={styles.answerButton}
              >
                {inquiry.answer ? '답변 수정' : '답변하기'}
              </button>
              
              <select
                value={inquiry.status}
                onChange={(e) => handleStatusChange(inquiry.id, e.target.value as Inquiry['status'])}
                className={styles.statusSelect}
              >
                <option value="waiting">답변대기</option>
                <option value="answered">답변완료</option>
                <option value="closed">처리완료</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* 답변 모달 */}
      {showAnswerModal && selectedInquiry && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>문의 답변</h3>
              <button
                onClick={() => setShowAnswerModal(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.originalQuestion}>
                <h4>원본 문의</h4>
                <p><strong>제목:</strong> {selectedInquiry.title}</p>
                <p><strong>내용:</strong> {selectedInquiry.content}</p>
                <p><strong>작성자:</strong> {selectedInquiry.userName}</p>
              </div>
              <div className={styles.answerForm}>
                <label htmlFor="answer">답변 내용</label>
                <textarea
                  id="answer"
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="고객에게 전달할 답변을 작성해주세요..."
                  rows={8}
                  className={styles.answerTextarea}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowAnswerModal(false)}
                className={styles.cancelButton}
              >
                취소
              </button>
              <button
                onClick={handleAnswerSubmit}
                className={styles.submitButton}
                disabled={!answerContent.trim()}
              >
                답변 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
