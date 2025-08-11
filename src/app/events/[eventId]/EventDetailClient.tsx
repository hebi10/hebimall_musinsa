'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Event } from '@/shared/types/event';
import Button from '@/app/_components/Button';
import styles from './EventDetail.module.css';

interface Props {
  event: Event & {
    content: string;
  };
}

export default function EventDetailClient({ event }: Props) {
  const [isParticipated, setIsParticipated] = useState(false);

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

  const handleParticipate = () => {
    if (isParticipated) {
      alert('이미 참여한 이벤트입니다.');
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

    // 이벤트 참여 로직
    setIsParticipated(true);
    alert('이벤트에 참여되었습니다!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const status = getEventStatus();
  const participationRate = (event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0)
    ? (event.participantCount / event.maxParticipants) * 100 
    : 0;

  return (
    <div className={styles.container}>
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

            {event.discountRate && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>할인율</div>
                <div className={styles.infoValue}>최대 {event.discountRate}%</div>
              </div>
            )}

            {event.discountAmount && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>적립금</div>
                <div className={styles.infoValue}>{event.discountAmount.toLocaleString()}원</div>
              </div>
            )}

            {event.couponCode && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>쿠폰 코드</div>
                <div className={styles.infoValue}>
                  <code className={styles.couponCode}>{event.couponCode}</code>
                </div>
              </div>
            )}
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
              variant="primary"
              size="lg"
              onClick={handleParticipate}
              disabled={status !== 'active' || isParticipated}
              className={styles.participateButton}
            >
              {isParticipated ? '참여 완료' : 
               status === 'ended' ? '종료된 이벤트' :
               status === 'upcoming' ? '시작 예정' :
               '이벤트 참여하기'}
            </Button>
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
    </div>
  );
}
