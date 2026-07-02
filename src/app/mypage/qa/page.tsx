'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/authProvider';
import { useUserSimpleQnAs } from '@/shared/hooks/useQnaQuery';
import { QnA } from '@/shared/types/qna';
import styles from './page.module.css';

export default function QAPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refetch: refetchQnAs } = useUserSimpleQnAs(user?.uid ?? null);

  const typeOptions = ['전체', 'product', 'delivery', 'payment', 'general'];
  const statusOptions = ['전체', 'answered', 'waiting'];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return '상품문의';
      case 'delivery':
        return '배송문의';
      case 'payment':
        return '결제문의';
      case 'general':
        return '일반문의';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered':
        return '답변완료';
      case 'waiting':
        return '대기중';
      case 'closed':
        return '종료';
      default:
        return status;
    }
  };

  const loadUserQnAs = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const { data: userQnAs = [] } = await refetchQnAs();
      setQnas(userQnAs);
    } catch (err) {
      setError('문의 목록을 불러오지 못했습니다.');
      console.error('Error loading user QnAs:', err);
    } finally {
      setLoading(false);
    }
  }, [refetchQnAs, user?.uid]);

  useEffect(() => {
    loadUserQnAs();
  }, [loadUserQnAs]);

  const filteredQAs = qnas.filter(qa => {
    const typeMatch = selectedType === '전체' || qa.category === selectedType;
    const statusMatch = selectedStatus === '전체' || qa.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const stats = {
    total: qnas.length,
    waiting: qnas.filter(qa => qa.status === 'waiting').length,
    answered: qnas.filter(qa => qa.status === 'answered').length,
  };

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
          <p>문의 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>1:1 문의</h2>
        <p className={styles.pageDesc}>문의내역과 답변 현황을 확인할 수 있습니다.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>총 문의</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.waiting}</div>
            <div className={styles.statLabel}>대기중</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}></div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{stats.answered}</div>
            <div className={styles.statLabel}>답변완료</div>
          </div>
        </div>
      </div>

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
            <label className={styles.filterLabel}>상태</label>
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
            <span className={styles.buttonIcon}></span>
            새 문의
          </Link>
        </div>
      </div>

      <div className={styles.qaSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>문의 목록</h3>
          <div className={styles.resultCount}>총 {filteredQAs.length}개</div>
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
                      상품: {qa.productName}
                    </div>
                  )}
                  <div className={styles.qaQuestion}>
                    <div className={styles.questionLabel}>Q</div>
                    <div className={styles.questionText}>{qa.content}</div>
                  </div>
                </div>

                <div className={styles.qaActions}>
                  <Link href={`/qna/${qa.id}`} className={styles.actionButton}>
                    상세보기
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}></div>
              <div className={styles.emptyTitle}>문의가 없습니다</div>
              <div className={styles.emptyDesc}>새 문의를 작성해 주세요.</div>
              <Link href="/qna/write" className={styles.newQAButton}>
                새 문의 등록
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
