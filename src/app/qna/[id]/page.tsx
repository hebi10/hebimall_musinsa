'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/authProvider';
import { QnAService } from '@/shared/services/qnaService';
import { QnA } from '@/shared/types/qna';
import styles from './page.module.css';

export default function QnADetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [qna, setQna] = useState<QnA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secretPassword, setSecretPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const qnaId = params.id as string;

  // QnA 데이터 로드
  useEffect(() => {
    if (qnaId) {
      loadQnA();
    }
  }, [qnaId]);

  const loadQnA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const qnaData = await QnAService.getQnA(qnaId, true); // 조회수 증가
      
      if (!qnaData) {
        setError('존재하지 않는 QnA입니다.');
        return;
      }

      // 비밀글인 경우 권한 확인
      if (qnaData.isSecret) {
        // 작성자 본인이거나 관리자가 아닌 경우 비밀번호 확인 필요
        const isOwner = user && user.uid === qnaData.userId;
        const isAdmin = user && user.email?.includes('admin'); // 간단한 관리자 체크
        
        if (!isOwner && !isAdmin) {
          setShowPasswordModal(true);
          return;
        }
      }

      setQna(qnaData);
    } catch (err) {
      console.error('Error loading QnA:', err);
      setError('QnA를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 확인
  const handlePasswordSubmit = async () => {
    try {
      setPasswordError(null);
      
      const isValid = await QnAService.verifySecretPassword(qnaId, secretPassword);
      
      if (isValid) {
        setShowPasswordModal(false);
        loadQnA();
      } else {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      setPasswordError('비밀번호 확인에 실패했습니다.');
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
    const categoryMap: Record<string, string> = {
      product: '상품문의',
      size: '사이즈문의',
      delivery: '배송문의',
      return: '교환/반품',
      payment: '결제문의',
      general: '일반문의',
      other: '기타'
    };
    return categoryMap[category] || category;
  };

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      waiting: '답변대기',
      answered: '답변완료',
      closed: '종료'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>QnA를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>오류 발생</h2>
          <p>{error}</p>
          <div className={styles.buttonGroup}>
            <button onClick={() => router.back()} className={styles.backButton}>
              뒤로가기
            </button>
            <button onClick={loadQnA} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>비밀글 확인</h3>
            </div>
            <div className={styles.modalContent}>
              <p>이 글은 비밀글입니다. 비밀번호를 입력해주세요.</p>
              <input
                type="password"
                value={secretPassword}
                onChange={(e) => setSecretPassword(e.target.value)}
                placeholder="비밀번호 (숫자 4자리)"
                maxLength={4}
                className={styles.passwordInput}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className={styles.passwordError}>{passwordError}</p>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                취소
              </button>
              <button
                onClick={handlePasswordSubmit}
                className={styles.submitButton}
                disabled={!secretPassword.trim()}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {qna && (
        <>
          {/* 헤더 */}
          <div className={styles.header}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← 뒤로가기
            </button>
            <div className={styles.breadcrumb}>
              <span>QnA</span>
              <span>/</span>
              <span>{getCategoryLabel(qna.category)}</span>
            </div>
          </div>

          {/* QnA 내용 */}
          <div className={styles.qnaCard}>
            <div className={styles.qnaHeader}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>{qna.title}</h1>
                <div className={styles.badges}>
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
              </div>
              <div className={styles.metaInfo}>
                <div className={styles.authorInfo}>
                  <span className={styles.author}>작성자: {qna.userName}</span>
                  <span className={styles.date}>작성일: {formatDate(qna.createdAt)}</span>
                </div>
                <div className={styles.statsInfo}>
                  <span className={styles.views}>조회수: {qna.views}</span>
                  {qna.productName && (
                    <span className={styles.product}>관련상품: {qna.productName}</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.qnaContent}>
              <div className={styles.questionSection}>
                <h3>문의 내용</h3>
                <div className={styles.content}>
                  {qna.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                {qna.images && qna.images.length > 0 && (
                  <div className={styles.images}>
                    {qna.images.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`첨부 이미지 ${index + 1}`}
                        className={styles.attachedImage}
                      />
                    ))}
                  </div>
                )}
              </div>

              {qna.answer && (
                <div className={styles.answerSection}>
                  <div className={styles.answerHeader}>
                    <h3>답변</h3>
                    <div className={styles.answerMeta}>
                      <span className={styles.answeredBy}>
                        답변자: {qna.answer.answeredBy}
                      </span>
                      <span className={styles.answeredDate}>
                        답변일: {formatDate(qna.answer.answeredAt)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.answerContent}>
                    {qna.answer.content.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {!qna.answer && qna.status === 'waiting' && (
                <div className={styles.waitingAnswer}>
                  <div className={styles.waitingIcon}>⏳</div>
                  <h3>답변 대기중</h3>
                  <p>빠른 시일 내에 답변해드리겠습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className={styles.actions}>
            <button
              onClick={() => router.push('/qna')}
              className={styles.listButton}
            >
              목록으로
            </button>
            
            {user && user.uid === qna.userId && qna.status === 'waiting' && (
              <button
                onClick={() => router.push(`/qna/edit/${qna.id}`)}
                className={styles.editButton}
              >
                수정하기
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
