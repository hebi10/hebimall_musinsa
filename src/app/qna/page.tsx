'use client';

import { useState, useEffect } from 'react';
import { SimpleQnAService } from '@/shared/services/simpleQnAService';
import { QnA, QnAFilter } from '@/shared/types/qna';
import { useAuth } from '@/context/authProvider';
import styles from './page.module.css';

export default function QnAListPage() {
  const { user } = useAuth();
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<QnAFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Record<string, number>>({});

  const categories = [
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
      
      // 임시로 간단한 목록 조회 사용
      const allQnAs = await SimpleQnAService.getAllQnAs(50);
      
      // 클라이언트 사이드 필터링
      let filteredQnas = allQnAs;
      
      if (selectedCategory !== 'all') {
        filteredQnas = filteredQnas.filter(qna => qna.category === selectedCategory);
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredQnas = filteredQnas.filter(qna =>
          qna.title.toLowerCase().includes(searchLower) ||
          qna.content.toLowerCase().includes(searchLower) ||
          qna.userName.toLowerCase().includes(searchLower)
        );
      }
      
      setQnas(filteredQnas);
      setTotalPages(1); // 임시로 페이지네이션 비활성화
    } catch (err) {
      setError('QnA 목록을 불러오는데 실패했습니다.');
      console.error('Error loading QnAs:', err);
    } finally {
      setLoading(false);
    }
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      // 임시로 로드된 QnA에서 통계 계산
      const statsData: Record<string, number> = {};
      qnas.forEach(qna => {
        statsData[qna.category] = (statsData[qna.category] || 0) + 1;
      });
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadQnAs();
  }, [selectedCategory]);

  useEffect(() => {
    if (qnas.length > 0) {
      loadStats();
    }
  }, [qnas]);

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(1);
    loadQnAs();
  };

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting':
        return '답변대기';
      case 'answered':
        return '답변완료';
      case 'closed':
        return '종료';
      default:
        return status;
    }
  };

  // 카테고리 라벨
  const getCategoryLabel = (category: string) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
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
        <div className={styles.titleSection}>
          <h1 className={styles.title}>QnA</h1>
          <p className={styles.subtitle}>궁금한 점이 있으시면 언제든 문의해 주세요</p>
        </div>
        
        {/* 통계 */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>전체 문의</h3>
            <span className={styles.statNumber}>
              {Object.values(stats).reduce((sum, count) => sum + count, 0)}
            </span>
          </div>
          <div className={styles.statCard}>
            <h3>답변 대기</h3>
            <span className={`${styles.statNumber} ${styles.waiting}`}>
              {qnas.filter(q => q.status === 'waiting').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <h3>답변 완료</h3>
            <span className={`${styles.statNumber} ${styles.answered}`}>
              {qnas.filter(q => q.status === 'answered').length}
            </span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
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

        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`${styles.categoryButton} ${
                selectedCategory === category.value ? styles.active : ''
              }`}
            >
              {category.label}
              {category.value !== 'all' && stats[category.value] && (
                <span className={styles.categoryCount}>({stats[category.value]})</span>
              )}
            </button>
          ))}
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

        {qnas.length === 0 && !loading && !error && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>등록된 QnA가 없습니다</h3>
            <p>첫 번째 질문을 등록해보세요!</p>
          </div>
        )}

        {qnas.map((qna) => (
          <div key={qna.id} className={styles.qnaItem}>
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
              </div>
              <div className={styles.qnaStats}>
                <span className={styles.views}>👁 {qna.views}</span>
                <span className={styles.date}>{formatDate(qna.createdAt)}</span>
              </div>
            </div>

            <div className={styles.qnaContent}>
              <h3 className={styles.qnaTitle}>
                <a href={`/qna/${qna.id}`} className={styles.titleLink}>
                  {qna.title}
                </a>
              </h3>
              <div className={styles.qnaDetails}>
                <span className={styles.author}>작성자: {qna.userName}</span>
                {qna.productName && (
                  <span className={styles.product}>상품: {qna.productName}</span>
                )}
              </div>
              {qna.answer && (
                <div className={styles.answerPreview}>
                  <span className={styles.answerLabel}>✅ 답변완료</span>
                  <span className={styles.answerDate}>
                    {formatDate(qna.answer.answeredAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.pageButton} ${
                currentPage === page ? styles.active : ''
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            다음
          </button>
        </div>
      )}

      {/* 문의하기 버튼 */}
      <div className={styles.writeSection}>
        <a href="/qna/write" className={styles.writeButton}>
          💬 문의하기
        </a>
      </div>
    </div>
  );
}
