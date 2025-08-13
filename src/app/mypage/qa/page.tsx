'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/authProvider';
import { SimpleQnAService } from '@/shared/services/simpleQnAService';
import { QnA } from '@/shared/types/qna';
import styles from './page.module.css';

export default function QAPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [showNewQAForm, setShowNewQAForm] = useState(false);
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typeOptions = ['전체', 'product', 'delivery', 'payment', 'general'];
  const statusOptions = ['전체', 'answered', 'waiting'];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return '상품문의';
      case 'delivery': return '배송문의';
      case 'payment': return '결제문의';
      case 'general': return '일반문의';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered': return '답변완료';
      case 'waiting': return '답변대기';
      case 'closed': return '종료';
      default: return status;
    }
  };

  // QnA 목록 로드
  const loadUserQnAs = async () => {
    if (!user?.uid) {
      console.log('User not logged in');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading QnAs for user:', user.uid);
      
      // 임시로 모든 QnA를 가져와서 확인
      const allQnAs = await SimpleQnAService.getAllQnAs(50);
      console.log('All QnAs:', allQnAs);
      
      // 실제 사용자 QnA 필터링
      const userQnAs = allQnAs.filter(qna => qna.userId === user.uid);
      console.log('User QnAs:', userQnAs);
      
      setQnas(userQnAs);
    } catch (err) {
      setError('문의 내역을 불러오는데 실패했습니다.');
      console.error('Error loading user QnAs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserQnAs();
  }, [user]);

  // 필터링된 QnA 목록
  const filteredQAs = qnas.filter(qa => {
    const typeMatch = selectedType === '전체' || qa.category === selectedType;
    const statusMatch = selectedStatus === '전체' || qa.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  // 통계 계산
  const stats = {
    total: qnas.length,
    waiting: qnas.filter(qa => qa.status === 'waiting').length,
    answered: qnas.filter(qa => qa.status === 'answered').length,
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>문의 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>총 문의</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.waiting}</div>
              <div className={styles.statLabel}>답변 대기</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.answered}</div>
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
                  {type === '전체' ? '전체' : getTypeLabel(type)}
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
                  {status === '전체' ? '전체' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.newQAButtonContainer}>
          <Link href="/qna/write" className={styles.newQAButton}>
            <span className={styles.buttonIcon}>✏️</span>
            새 문의 작성
          </Link>
        </div>
      </div>

      {/* QA List */}
      <div className={styles.qaSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>문의 내역</h3>
          <div className={styles.resultCount}>총 {filteredQAs.length}건</div>
        </div>

        <div className={styles.qaList}>
          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button onClick={loadUserQnAs} className={styles.retryButton}>
                다시 시도
              </button>
            </div>
          )}

          {filteredQAs.length > 0 ? (
            filteredQAs.map((qa) => (
              <div key={qa.id} className={styles.qaCard}>
                <div className={styles.qaHeader}>
                  <div className={styles.qaInfo}>
                    <span className={styles.qaType}>{getTypeLabel(qa.category)}</span>
                    <span className={styles.qaDate}>{formatDate(qa.createdAt)}</span>
                    <span className={styles.qaViews}>조회 {qa.views}</span>
                  </div>
                  <div className={`${styles.qaStatus} ${styles[`status-${qa.status}`]}`}>
                    <span className={styles.statusDot}></span>
                    {getStatusLabel(qa.status)}
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
                      <div className={styles.answerText}>{qa.answer.content}</div>
                      <div className={styles.answerInfo}>
                        답변자: {qa.answer.answeredBy} | {formatDate(qa.answer.answeredAt)}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.qaActions}>
                  <Link href={`/qna/${qa.id}`} className={styles.actionButton}>
                    상세보기
                  </Link>
                  {qa.status === 'waiting' && (
                    <button className={styles.actionButton}>수정</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>❓</div>
              <div className={styles.emptyTitle}>문의 내역이 없습니다</div>
              <div className={styles.emptyDesc}>궁금한 사항이 있으시면 언제든 문의해주세요.</div>
              <Link href="/qna/write" className={styles.newQAButton}>
                첫 문의 작성하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
