'use client';

import { Event } from '@/shared/types/event';
import Image from 'next/image';
import Link from 'next/link';
import styles from './EventDetailClient.module.css';

interface EventDetailClientProps {
  event: Event;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    if (now < event.startDate) return 'upcoming';
    if (now > event.endDate) return 'ended';
    return 'active';
  };

  const status = getEventStatus();
  const daysLeft = Math.ceil((event.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '세일';
      case 'coupon': return '쿠폰';
      case 'special': return '특별';
      case 'new': return '신상';
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>홈</Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <Link href="/events" className={styles.breadcrumbLink}>이벤트</Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span className={styles.breadcrumbCurrent}>{event.title}</span>
      </div>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
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
          
          <div className={styles.eventMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>이벤트 기간</span>
              <span className={styles.metaValue}>
                {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
              </span>
            </div>
            
            {(status === 'active' && daysLeft > 0) ? (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>남은 기간</span>
                <span className={`${styles.metaValue} ${styles.highlight}`}>
                  {daysLeft}일 남음
                </span>
              </div>
            ) : null}
            
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>참여자</span>
              <span className={styles.metaValue}>
                {event.participantCount.toLocaleString()}명
                {event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0 ? (
                  <span className={styles.maxParticipants}>
                    / {event.maxParticipants.toLocaleString()}명
                  </span>
                ) : (
                  <span className={styles.noLimit}> (제한 없음)</span>
                )}
              </span>
            </div>
          </div>

          {status === 'active' ? (
            <div className={styles.participateSection}>
              <button className={styles.participateButton}>
                이벤트 참여하기
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Event Banner Image */}
      {event.bannerImage && (
        <div className={styles.bannerSection}>
          <div className={styles.bannerImageContainer}>
            <Image
              src={event.bannerImage}
              alt={event.title}
              width={1200}
              height={600}
              className={styles.bannerImage}
              priority
            />
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className={styles.detailsSection}>
        <div className={styles.detailsContent}>
          <h2 className={styles.sectionTitle}>이벤트 상세 정보</h2>
          
          <div className={styles.detailsGrid}>
            {(event.discountRate && event.discountRate > 0) ? (
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🎁</div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>할인 혜택</h3>
                  <p className={styles.benefitValue}>최대 {event.discountRate}% 할인</p>
                </div>
              </div>
            ) : null}

            {(event.discountAmount && event.discountAmount > 0) ? (
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>💰</div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>적립 혜택</h3>
                  <p className={styles.benefitValue}>{event.discountAmount.toLocaleString()}원 적립</p>
                </div>
              </div>
            ) : null}

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>📅</div>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>이벤트 기간</h3>
                <p className={styles.benefitValue}>
                  {event.startDate.toLocaleDateString()} ~ {event.endDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            {(event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0) ? (
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>👥</div>
                <div className={styles.benefitContent}>
                  <h3 className={styles.benefitTitle}>참여 제한</h3>
                  <p className={styles.benefitValue}>
                    선착순 {event.maxParticipants.toLocaleString()}명
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Event Content */}
          <div className={styles.eventContent}>
            <h3 className={styles.contentTitle}>이벤트 내용</h3>
            <div className={styles.contentText}>
              <p>{event.description}</p>
              <p>이 이벤트는 <strong>{getEventTypeLabel(event.eventType)}</strong> 이벤트로, 특별한 혜택을 제공합니다.</p>
              <p>이벤트 기간 동안 다양한 상품을 할인된 가격으로 만나보실 수 있으며, 추가 적립 혜택도 받으실 수 있습니다.</p>
              {(status === 'active' && daysLeft > 0) ? (
                <div className={styles.urgencyText}>
                  이벤트가 <strong>{daysLeft}일</strong> 남았습니다. 서둘러 참여하세요!
                </div>
              ) : null}
            </div>
          </div>

          {/* Participation Guidelines */}
          <div className={styles.guidelinesSection}>
            <h3 className={styles.contentTitle}>참여 방법 및 주의사항</h3>
            <ul className={styles.guidelinesList}>
              <li>이벤트 페이지에서 '참여하기' 버튼을 클릭하세요</li>
              <li>회원가입 후 로그인이 필요합니다</li>
              <li>이벤트 기간 내에만 참여 가능합니다</li>
              <li>중복 참여는 제한될 수 있습니다</li>
              <li>이벤트 혜택은 기간 종료 후 자동 적용됩니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {status === 'active' ? (
        <div className={styles.bottomCta}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h3>지금 바로 참여하세요!</h3>
              <p>이벤트 마감까지 {daysLeft}일 남았습니다</p>
            </div>
            <button className={styles.ctaButton}>
              이벤트 참여하기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
