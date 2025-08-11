'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/shared/types/event';
import { EventService } from '@/shared/services/eventService';
import { useAuth } from '@/context/authProvider';
import Button from '@/app/_components/Button';
import styles from './EventDetail.module.css';

interface Props {
  event: Event & {
    content: string;
  };
}

export default function EventDetailClient({ event }: Props) {
  const [isParticipated, setIsParticipated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingParticipation, setCheckingParticipation] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isFirstTimeParticipation, setIsFirstTimeParticipation] = useState(false);
  
  const { user } = useAuth();

  // 사용자 참여 여부 확인
  useEffect(() => {
    const checkParticipation = async () => {
      if (!user?.uid) {
        setCheckingParticipation(false);
        return;
      }

      try {
        const participated = await EventService.checkEventParticipation(event.id, user.uid);
        setIsParticipated(participated);
      } catch (error) {
        console.error('Error checking participation:', error);
      } finally {
        setCheckingParticipation(false);
      }
    };

    checkParticipation();
  }, [event.id, user?.uid]);

  const getEventStatus = () => {
    const now = new Date();
    if (now < event.startDate) return 'upcoming';
    if (now > event.endDate) return 'ended';
    return 'active';
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '세일';
      case 'coupon': return '쿠폰';
      case 'special': return '특별';
      case 'new': return '신상';
      default: return '';
    }
  };

  const handleParticipate = async () => {
    if (!user?.uid) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 참여한 경우 쿠폰 모달만 표시 (쿠폰 이벤트인 경우)
    if (isParticipated) {
      if (event.eventType === 'coupon' && event.couponCode) {
        setIsFirstTimeParticipation(false); // 재확인
        setShowCouponModal(true);
      } else {
        alert('이미 참여한 이벤트입니다.');
      }
      return;
    }

    const status = getEventStatus();
    if (status === 'ended') {
      alert('종료된 이벤트입니다.');
      return;
    }

    if (status === 'upcoming') {
      alert('아직 시작되지 않은 이벤트입니다.');
      return;
    }

    // manual 쿠폰 타입 체크
    if (event.eventType === 'coupon' && event.couponType === 'manual') {
      alert('이 이벤트는 고객센터를 통해서만 참여 가능합니다.');
      return;
    }

    setLoading(true);
    try {
      await EventService.participateInEvent(event.id, user.uid, user.displayName || user.email || '익명');
      setIsParticipated(true);
      
      // 쿠폰 이벤트인 경우 쿠폰 모달 표시
      if (event.eventType === 'coupon' && event.couponCode) {
        setIsFirstTimeParticipation(true); // 첫 참여
        setShowCouponModal(true);
      } else {
        alert('이벤트에 참여되었습니다!');
      }
    } catch (error: any) {
      alert(error.message || '이벤트 참여 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 쿠폰 코드 복사 기능
  const handleCopyCoupon = async () => {
    if (!event.couponCode) return;
    
    try {
      await navigator.clipboard.writeText(event.couponCode);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000); // 2초 후 복사 상태 리셋
    } catch (error) {
      // 클립보드 API가 지원되지 않는 경우 fallback
      const textArea = document.createElement('textarea');
      textArea.value = event.couponCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  const status = getEventStatus();
  const participationRate = (event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0)
    ? (event.participantCount / event.maxParticipants) * 100 
    : 0;

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (!user?.uid) return '로그인 필요';
    if (checkingParticipation) return '확인 중...';
    if (loading) return '참여 중...';
    if (status === 'ended') return '종료된 이벤트';
    if (status === 'upcoming') return '시작 예정';
    if (event.eventType === 'coupon' && event.couponType === 'manual') return '고객센터 문의';
    
    // 참여 완료 후 쿠폰 이벤트인 경우 쿠폰 보기 가능
    if (isParticipated) {
      if (event.eventType === 'coupon' && event.couponCode) {
        return '쿠폰 확인하기';
      }
      return '참여 완료';
    }
    
    return '이벤트 참여하기';
  };

  // 버튼 비활성화 조건
  const isButtonDisabled = () => {
    if (!user?.uid) return true;
    if (checkingParticipation || loading) return true;
    if (status !== 'active') return true;
    if (event.eventType === 'coupon' && event.couponType === 'manual') return true;
    
    // 참여 완료 후 쿠폰 이벤트가 아닌 경우에만 비활성화
    if (isParticipated && !(event.eventType === 'coupon' && event.couponCode)) {
      return true;
    }
    
    return false;
  };

  return (
    <div className={styles.container}>
      {/* 로딩 상태 */}
      {checkingParticipation && (
        <div className={styles.loadingState}>
          <p>이벤트 정보를 확인하는 중...</p>
        </div>
      )}

      {/* 이벤트 헤더 */}
      <div className={styles.eventHeader}>
        <div className={styles.eventBanner}>
          <Image
            src={event.bannerImage}
            alt={event.title}
            width={1200}
            height={400}
            className={styles.bannerImage}
            priority
          />
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerContent}>
              <div className={styles.eventBadges}>
                <span className={`${styles.typeBadge} ${styles[event.eventType]}`}>
                  {getEventTypeLabel(event.eventType)}
                </span>
                {status === 'active' && (
                  <span className={`${styles.statusBadge} ${styles.active}`}>
                    진행중
                  </span>
                )}
                {status === 'ended' && (
                  <span className={`${styles.statusBadge} ${styles.ended}`}>
                    종료
                  </span>
                )}
                {status === 'upcoming' && (
                  <span className={`${styles.statusBadge} ${styles.upcoming}`}>
                    예정
                  </span>
                )}
              </div>
              <h1 className={styles.eventTitle}>{event.title}</h1>
              <p className={styles.eventDescription}>{event.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.eventBody}>
        {/* 이벤트 정보 */}
        <div className={styles.eventInfo}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>이벤트 기간</div>
              <div className={styles.infoValue}>
                {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>참여자 수</div>
              <div className={styles.infoValue}>
                {event.participantCount.toLocaleString()}명
                {event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0 ? (
                  <span className={styles.maxParticipants}>
                    / {event.maxParticipants.toLocaleString()}명
                  </span>
                ) : (
                  <span className={styles.noLimit}>
                    (제한 없음)
                  </span>
                )}
              </div>
            </div>

            {event.discountRate && event.discountRate > 0 ? (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>할인율</div>
                <div className={styles.infoValue}>최대 {event.discountRate}%</div>
              </div>
            ) : null}

            {event.discountAmount && event.discountAmount > 0 ? (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>적립금</div>
                <div className={styles.infoValue}>{event.discountAmount.toLocaleString()}원</div>
              </div>
            ) : null}
            
          </div>

          {/* 참여 현황 */}
          {event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0 && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>참여 현황</span>
                <span className={styles.progressPercent}>
                  {participationRate.toFixed(1)}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${participationRate}%` }}
                />
              </div>
            </div>
          )}

          {/* 참여 버튼 */}
          <div className={styles.participateSection}>
            <Button
              variant={isParticipated && event.eventType === 'coupon' && event.couponCode ? "secondary" : "primary"}
              size="lg"
              onClick={handleParticipate}
              disabled={isButtonDisabled()}
              className={styles.participateButton}
            >
              {getButtonText()}
            </Button>

            {/* manual 쿠폰 타입일 때 안내 메시지 */}
            {event.eventType === 'coupon' && event.couponType === 'manual' && (
              <div className={styles.manualCouponNotice}>
                <p>이 이벤트는 고객센터를 통해서만 참여 가능합니다.</p>
                <p>문의: 1588-1234 또는 event@hebimall.com</p>
              </div>
            )}
          </div>
        </div>

        {/* 이벤트 상세 내용 */}
        <div className={styles.eventContent}>
          <div 
            className={styles.contentBody}
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        </div>

        {/* 관련 정보 */}
        <div className={styles.relatedInfo}>
          <h3 className={styles.relatedTitle}>이벤트 문의</h3>
          <div className={styles.contactInfo}>
            <p>이벤트에 관한 문의사항이 있으시면 고객센터로 연락해주세요.</p>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>전화:</span>
                <span className={styles.contactValue}>1588-1234</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>이메일:</span>
                <span className={styles.contactValue}>event@hebimall.com</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>운영시간:</span>
                <span className={styles.contactValue}>평일 09:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 쿠폰 발급 모달 */}
      {showCouponModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCouponModal(false)}>
          <div className={styles.couponModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isFirstTimeParticipation ? '🎉 쿠폰 발급 완료!' : '💳 내 쿠폰 확인'}
              </h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCouponModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.congratsMessage}>
                {isFirstTimeParticipation ? (
                  <>
                    <p>이벤트 참여가 완료되었습니다!</p>
                    <p>아래 쿠폰 코드를 복사하여 사용해보세요.</p>
                  </>
                ) : (
                  <>
                    <p>이미 참여하신 이벤트입니다.</p>
                    <p>발급받은 쿠폰 코드를 다시 확인해보세요.</p>
                  </>
                )}
              </div>

              <div className={styles.couponCard}>
                <div className={styles.couponInfo}>
                  <div className={styles.couponTitle}>{event.title}</div>
                  <div className={styles.couponDiscount}>
                    {event.discountRate && `${event.discountRate}% 할인`}
                    {event.discountAmount && `${event.discountAmount.toLocaleString()}원 적립`}
                  </div>
                </div>
                
                <div className={styles.couponCodeSection}>
                  <div className={styles.couponCodeLabel}>쿠폰 코드</div>
                  <div className={styles.couponCodeBox}>
                    <code className={styles.couponCodeText}>{event.couponCode}</code>
                    <button 
                      className={styles.copyButton}
                      onClick={handleCopyCoupon}
                    >
                      {copiedCoupon ? '복사됨!' : '복사'}
                    </button>
                  </div>
                </div>

                <div className={styles.couponExpiry}>
                  {/* 쿠폰 유효기간 표시 */}
                  <p>유효기간: 발급일로부터 30일</p>
                  <p>최소 주문금액: 50,000원 이상</p>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button 
                variant="secondary" 
                onClick={() => setShowCouponModal(false)}
                className={styles.modalButton}
              >
                닫기
              </Button>
              <Link href="/mypage/coupons">
                <Button 
                  variant="primary"
                  className={styles.modalButton}
                >
                  쿠폰함 가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
