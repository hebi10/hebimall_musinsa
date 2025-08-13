'use client';

import { useState, useEffect } from 'react';
import { SimpleQnAService } from '@/shared/services/simpleQnAService';
import { QnA } from '@/shared/types/qna';
import styles from './page.module.css';

export default function AdminQnAPage() {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQnA, setSelectedQnA] = useState<QnA | null>(null);
  const [answerContent, setAnswerContent] = useState('');

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'waiting', label: '답변대기' },
    { value: 'answered', label: '답변완료' },
    { value: 'closed', label: '종료' },
  ];

  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: 'product', label: '상품문의' },
    { value: 'delivery', label: '배송문의' },
    { value: 'payment', label: '결제문의' },
    { value: 'general', label: '일반문의' },
  ];

  // QnA 목록 로드
  const loadQnAs = async () => {
    try {
      setLoading(true);
      const allQnAs = await SimpleQnAService.getAllQnAs(100);
      
      // 필터링
      let filteredQnAs = allQnAs;
      
      if (selectedFilter !== 'all') {
        filteredQnAs = filteredQnAs.filter(qna => qna.status === selectedFilter);
      }
      
      if (selectedCategory !== 'all') {
        filteredQnAs = filteredQnAs.filter(qna => qna.category === selectedCategory);
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredQnAs = filteredQnAs.filter(qna =>
          qna.title.toLowerCase().includes(searchLower) ||
          qna.content.toLowerCase().includes(searchLower) ||
          qna.userName.toLowerCase().includes(searchLower)
        );
      }
      
      setQnas(filteredQnAs);
    } catch (err) {
      setError('QnA 목록을 불러오는데 실패했습니다.');
      console.error('Error loading QnAs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQnAs();
  }, [selectedFilter, selectedCategory]);

  // 검색 처리
  const handleSearch = () => {
    loadQnAs();
  };

  // 답변 모달 열기
  const openAnswerModal = (qna: QnA) => {
    setSelectedQnA(qna);
    setAnswerContent(qna.answer?.content || '');
    setShowAnswerModal(true);
  };

  // 답변 저장
  const handleAnswerSubmit = async () => {
    if (!selectedQnA || !answerContent.trim()) return;

    try {
      // TODO: QnAService.answerQnA 구현 후 사용
      alert('답변이 저장되었습니다. (실제 구현 예정)');
      setShowAnswerModal(false);
      setSelectedQnA(null);
      setAnswerContent('');
      loadQnAs();
    } catch (err) {
      alert('답변 저장에 실패했습니다.');
      console.error('Error saving answer:', err);
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
    total: qnas.length,
    waiting: qnas.filter(q => q.status === 'waiting').length,
    answered: qnas.filter(q => q.status === 'answered').length,
    closed: qnas.filter(q => q.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>QnA 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>QnA 관리</h1>
        <p className={styles.subtitle}>고객 문의를 관리하고 답변할 수 있습니다</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💬</div>
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
            <h3>종료</h3>
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

      {/* QnA 목록 */}
      <div className={styles.qnaList}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadQnAs} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        )}

        {qnas.length === 0 && !error && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <h3>조건에 맞는 QnA가 없습니다</h3>
            <p>필터를 조정해보세요.</p>
          </div>
        )}

        {qnas.map((qna) => (
          <div key={qna.id} className={styles.qnaCard}>
            <div className={styles.qnaHeader}>
              <div className={styles.qnaInfo}>
                <span className={`${styles.category} ${styles[qna.category]}`}>
                  {getCategoryLabel(qna.category)}
                </span>
                <span className={`${styles.status} ${styles[qna.status]}`}>
                  {getStatusLabel(qna.status)}
                </span>
                {qna.isSecret && (
                  <span className={styles.secretBadge}>🔒 비밀글</span>
                )}
                <span className={styles.priority}>
                  {qna.status === 'waiting' && '🚨 처리필요'}
                </span>
              </div>
              <div className={styles.qnaStats}>
                <span className={styles.views}>👁 {qna.views}</span>
                <span className={styles.date}>{formatDate(qna.createdAt)}</span>
              </div>
            </div>

            <div className={styles.qnaContent}>
              <h3 className={styles.qnaTitle}>{qna.title}</h3>
              <div className={styles.qnaDetails}>
                <span className={styles.author}>작성자: {qna.userName}</span>
                <span className={styles.email}>({qna.userEmail})</span>
                {qna.productName && (
                  <span className={styles.product}>관련상품: {qna.productName}</span>
                )}
              </div>
              <div className={styles.qnaQuestion}>
                <strong>문의내용:</strong>
                <p>{qna.content}</p>
              </div>

              {qna.answer && (
                <div className={styles.qnaAnswer}>
                  <div className={styles.answerHeader}>
                    <strong>답변:</strong>
                    <span className={styles.answeredBy}>
                      {qna.answer.answeredBy} | {formatDate(qna.answer.answeredAt)}
                    </span>
                  </div>
                  <p>{qna.answer.content}</p>
                </div>
              )}
            </div>

            <div className={styles.qnaActions}>
              <button
                onClick={() => openAnswerModal(qna)}
                className={styles.answerButton}
              >
                {qna.answer ? '답변 수정' : '답변하기'}
              </button>
              <button className={styles.viewButton}>
                상세보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 답변 모달 */}
      {showAnswerModal && selectedQnA && (
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
                <p><strong>제목:</strong> {selectedQnA.title}</p>
                <p><strong>내용:</strong> {selectedQnA.content}</p>
                <p><strong>작성자:</strong> {selectedQnA.userName}</p>
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
