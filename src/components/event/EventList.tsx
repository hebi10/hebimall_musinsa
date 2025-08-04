'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/src/types/event';
import Button from '@/src/components/common/Button';
import styles from './EventList.module.css';

// Mock 데이터
const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: '신규 회원 가입 이벤트',
    description: '첫 구매 시 20% 할인 쿠폰 증정!',
    content: '신규 회원가입 후 첫 구매 시 20% 할인 쿠폰을 드립니다. 기간 내에 사용해주세요.',
    bannerImage: '/images/events/signup-event.jpg',
    thumbnailImage: '/images/events/signup-thumb.jpg',
    eventType: 'coupon',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    discountRate: 20,
    couponCode: 'WELCOME20',
    participantCount: 1245,
    maxParticipants: 5000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'event-2',
    title: '봄맞이 특가 세일',
    description: '봄 신상품 최대 50% 할인!',
    content: '따뜻한 봄을 맞아 신상품을 특가로 만나보세요. 기간 한정 특가입니다.',
    bannerImage: '/images/events/spring-sale.jpg',
    thumbnailImage: '/images/events/spring-thumb.jpg',
    eventType: 'sale',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    isActive: true,
    discountRate: 50,
    targetCategories: ['상의', '하의', '아우터'],
    participantCount: 892,
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date('2024-02-25')
  },
  {
    id: 'event-3',
    title: '리뷰 작성 이벤트',
    description: '리뷰 작성하고 적립금 받자!',
    content: '구매 후 리뷰 작성 시 1,000원 적립금을 드립니다.',
    bannerImage: '/images/events/review-event.jpg',
    thumbnailImage: '/images/events/review-thumb.jpg',
    eventType: 'special',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    isActive: true,
    discountAmount: 1000,
    participantCount: 2341,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'event-4',
    title: '신상품 출시 기념',
    description: '새로운 컬렉션을 만나보세요',
    content: '2024 S/S 신상품 컬렉션이 출시되었습니다. 트렌디한 스타일을 만나보세요.',
    bannerImage: '/images/events/new-collection.jpg',
    thumbnailImage: '/images/events/new-thumb.jpg',
    eventType: 'new',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-04-30'),
    isActive: true,
    participantCount: 567,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

export default function EventList() {
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'coupon' | 'special' | 'new'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  const filteredEvents = mockEvents.filter(event =>
    filterType === 'all' || event.eventType === filterType
  );

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const displayedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '세일';
      case 'coupon': return '쿠폰';
      case 'special': return '특별';
      case 'new': return '신상';
      default: return '';
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    if (now < event.startDate) return 'upcoming';
    if (now > event.endDate) return 'ended';
    return 'active';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* 진행 중인 이벤트 배너 */}
      <div className={styles.bannerSection}>
        <div className={styles.mainBanner}>
          <Image
            src={mockEvents[0].bannerImage}
            alt={mockEvents[0].title}
            width={1200}
            height={400}
            className={styles.bannerImage}
          />
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>{mockEvents[0].title}</h2>
            <p className={styles.bannerDescription}>{mockEvents[0].description}</p>
            <Button variant="primary" size="lg">
              이벤트 참여하기
            </Button>
          </div>
        </div>
      </div>

      {/* 이벤트 통계 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{mockEvents.filter(e => getEventStatus(e) === 'active').length}</div>
          <div className={styles.statLabel}>진행중</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{mockEvents.reduce((sum, e) => sum + e.participantCount, 0)}</div>
          <div className={styles.statLabel}>총 참여자</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{mockEvents.length}</div>
          <div className={styles.statLabel}>전체 이벤트</div>
        </div>
      </div>

      {/* 필터 */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
          onClick={() => setFilterType('all')}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'sale' ? styles.active : ''}`}
          onClick={() => setFilterType('sale')}
        >
          세일
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'coupon' ? styles.active : ''}`}
          onClick={() => setFilterType('coupon')}
        >
          쿠폰
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'special' ? styles.active : ''}`}
          onClick={() => setFilterType('special')}
        >
          특별 이벤트
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'new' ? styles.active : ''}`}
          onClick={() => setFilterType('new')}
        >
          신상품
        </button>
      </div>

      {/* 이벤트 목록 */}
      <div className={styles.eventGrid}>
        {displayedEvents.map(event => {
          const status = getEventStatus(event);
          return (
            <Link key={event.id} href={`/events/${event.id}`} className={styles.eventCard}>
              <div className={styles.eventImageContainer}>
                <Image
                  src={event.thumbnailImage}
                  alt={event.title}
                  width={300}
                  height={200}
                  className={styles.eventImage}
                />
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
                </div>
              </div>

              <div className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                
                <div className={styles.eventMeta}>
                  <div className={styles.eventPeriod}>
                    {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                  </div>
                  <div className={styles.eventParticipants}>
                    참여자: {event.participantCount.toLocaleString()}명
                    {event.maxParticipants && (
                      <span className={styles.maxParticipants}>
                        / {event.maxParticipants.toLocaleString()}명
                      </span>
                    )}
                  </div>
                </div>

                {event.discountRate && (
                  <div className={styles.eventDiscount}>
                    최대 {event.discountRate}% 할인
                  </div>
                )}
                {event.discountAmount && (
                  <div className={styles.eventDiscount}>
                    {event.discountAmount.toLocaleString()}원 적립
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
