'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/app/_components/Button';
import {
  getEventUiMeta,
  getEventUiVariant,
} from '@/shared/constants/eventUiMeta';
import { getEventStatus, getFeaturedEvent } from '@/shared/services/eventService';
import { Event } from '@/shared/types/event';
import styles from './EventList.module.css';
import { useEvent } from '@/context/eventProvider';

const FILTER_OPTIONS = [
  { type: 'all', label: '전체' },
  { type: 'sale', label: '세일' },
  { type: 'coupon', label: '쿠폰' },
  { type: 'special', label: '특별 이벤트' },
  { type: 'new', label: '신상품' },
] as const;

type EventFilterButton = (typeof FILTER_OPTIONS)[number]['type'];

const formatDate = (date: Date) =>
  date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const getCardHighlightText = (event: Event, fallbackLabel: string) => {
  if (event.discountRate && event.discountRate > 0) {
    return `최대 ${event.discountRate}% 할인`;
  }

  if (event.discountAmount && event.discountAmount > 0) {
    return `${event.discountAmount.toLocaleString()}원 적립`;
  }

  if (event.couponCode) {
    return `쿠폰 코드 ${event.couponCode}`;
  }

  return fallbackLabel;
};

export default function EventList() {
  const {
    events,
    filteredEvents,
    filter,
    currentPage,
    eventsPerPage,
    loading,
    error,
    setFilter,
    setCurrentPage,
    getActiveEvents,
    getTotalParticipants,
    refreshEvents,
  } = useEvent();

  const activeFilterType: EventFilterButton = filter.eventType ?? 'all';
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage));
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const displayedEvents = filteredEvents.slice(startIndex, endIndex);

  const handleFilterChange = (type: EventFilterButton) => {
    setFilter(type === 'all' ? {} : { eventType: type });
  };

  const featuredEvent = getFeaturedEvent(filteredEvents);
  const featuredMeta = featuredEvent ? getEventUiMeta(featuredEvent) : null;
  const featuredVariant = featuredEvent ? getEventUiVariant(featuredEvent) : null;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={`${styles.statePanel} ${styles.loadingState}`}>
          <p className={styles.stateTitle}>이벤트를 불러오는 중입니다.</p>
          <p className={styles.stateDescription}>
            최신 이벤트 정보와 배너를 준비하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={`${styles.statePanel} ${styles.errorState}`}>
          <p className={styles.stateTitle}>이벤트 정보를 불러오지 못했습니다.</p>
          <p className={styles.stateDescription}>{error}</p>
          <Button variant="outline" onClick={refreshEvents}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  const emptyStateMessage =
    events.length === 0
      ? '진행 중인 이벤트가 없습니다.'
      : activeFilterType === 'all'
      ? '현재 노출할 이벤트가 없습니다.'
      : `"${FILTER_OPTIONS.find(option => option.type === activeFilterType)?.label}" 조건에 맞는 이벤트가 없습니다.`;
  const showEmptyState = filteredEvents.length === 0;

  return (
    <div className={styles.container}>
      {!showEmptyState && featuredEvent ? (
        <div className={styles.bannerSection}>
          <div
            className={`${styles.mainBanner} ${featuredVariant ? styles[`${featuredVariant}BannerTheme`] : ''}`}
          >
            <Image
              src={featuredEvent.bannerImage}
              alt={featuredEvent.title}
              width={1200}
              height={400}
              className={styles.bannerImage}
            />
            <div className={styles.bannerContent}>
              {featuredMeta ? (
                <>
                  <span className={styles.bannerEyebrow}>{featuredMeta.featuredEyebrow}</span>
                  <span className={styles.bannerAccent}>{featuredMeta.featuredAccentText}</span>
                </>
              ) : null}
              <h2 className={styles.bannerTitle}>{featuredEvent.title}</h2>
              <p className={styles.bannerDescription}>{featuredEvent.description}</p>
              <Link href={`/events/${featuredEvent.id}`} className={styles.featuredCta}>
                {featuredMeta?.featuredCtaLabel ?? '이벤트 보기'}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{getActiveEvents().length}</div>
          <div className={styles.statLabel}>진행중</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{getTotalParticipants()}</div>
          <div className={styles.statLabel}>총 참여자</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{events.length}</div>
          <div className={styles.statLabel}>전체 이벤트</div>
        </div>
      </div>

      <div className={styles.filters}>
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.type}
            className={`${styles.filterButton} ${activeFilterType === option.type ? styles.active : ''}`}
            onClick={() => handleFilterChange(option.type)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showEmptyState ? (
        <div className={`${styles.statePanel} ${styles.emptyState}`}>
          <p className={styles.stateTitle}>{emptyStateMessage}</p>
          <p className={styles.stateDescription}>
            {events.length === 0
              ? '등록된 이벤트가 아직 없어 준비되는 대로 바로 노출됩니다.'
              : '다른 필터를 선택하면 현재 노출 가능한 이벤트를 다시 확인할 수 있습니다.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.eventGrid}>
            {displayedEvents.map(event => {
              const status = getEventStatus(event);
              const uiVariant = getEventUiVariant(event);
              const uiMeta = getEventUiMeta(event);
              const cardHighlightText = getCardHighlightText(event, uiMeta.cardAccentLabel);

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={`${styles.eventCard} ${styles[`${uiVariant}CardTheme`]}`}
                >
                  <div className={styles.eventImageContainer}>
                    <Image
                      src={event.thumbnailImage}
                      alt={event.title}
                      width={300}
                      height={200}
                      className={styles.eventImage}
                    />
                    <div className={styles.eventBadges}>
                      <span className={styles.typeBadge}>{uiMeta.badgeLabel}</span>
                      {status === 'ongoing' && (
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
                  </div>

                  <div className={styles.eventInfo}>
                    <div className={styles.eventSignatureRow}>
                      <span className={styles.eventEyebrow}>{uiMeta.cardEyebrow}</span>
                      <span className={styles.eventAccentTag}>{uiMeta.typeLabel}</span>
                    </div>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDescription}>{event.description}</p>

                    <div className={styles.eventMeta}>
                      <div className={styles.eventPeriod}>
                        {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                      </div>
                      <div className={styles.eventParticipants}>
                        참여자: {event.participantCount.toLocaleString()}명
                        {event.hasMaxParticipants && event.maxParticipants && event.maxParticipants > 0 ? (
                          <span className={styles.maxParticipants}>
                            / {event.maxParticipants.toLocaleString()}명
                          </span>
                        ) : (
                          <span className={styles.noLimit}>(제한 없음)</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.eventFooter}>
                      <div className={styles.eventDiscount}>{cardHighlightText}</div>
                      <span className={styles.cardCta}>{uiMeta.cardCtaLabel}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
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
        </>
      )}
    </div>
  );
}
