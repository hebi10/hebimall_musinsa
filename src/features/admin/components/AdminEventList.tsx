'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Event } from '@/shared/types/event';
import Button from '@/shared/components/Button';
import styles from './AdminEventList.module.css';

// Mock 데이터
const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: '신규 회원 가입 이벤트',
    description: '첫 구매 시 20% 할인 쿠폰 증정!',
    content: '신규 회원가입 후 첫 구매 시 20% 할인 쿠폰을 드립니다.',
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
    content: '따뜻한 봄을 맞아 신상품을 특가로 만나보세요.',
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
    title: '종료된 이벤트',
    description: '지난 이벤트입니다',
    content: '이미 종료된 이벤트입니다.',
    bannerImage: '/images/events/ended-event.jpg',
    thumbnailImage: '/images/events/ended-thumb.jpg',
    eventType: 'special',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-31'),
    isActive: false,
    discountAmount: 1000,
    participantCount: 2341,
    createdAt: new Date('2023-11-25'),
    updatedAt: new Date('2023-11-25')
  }
];

export default function AdminEventList() {
  const [events, setEvents] = useState(mockEvents);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('all');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'coupon' | 'special' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    if (now < event.startDate) return 'upcoming';
    if (now > event.endDate) return 'ended';
    return 'active';
  };

  const filteredEvents = events.filter(event => {
    const status = getEventStatus(event);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && status === 'active') ||
      (filterStatus === 'ended' && status === 'ended');
    
    const matchesType = filterType === 'all' || event.eventType === filterType;
    
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(filteredEvents.map(event => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, eventId]);
    } else {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    }
  };

  const handleToggleActive = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, isActive: !event.isActive }
        : event
    ));
  };

  const handleDeleteEvents = () => {
    if (selectedEvents.length === 0) {
      alert('삭제할 이벤트를 선택해주세요.');
      return;
    }
    
    if (confirm(`선택한 ${selectedEvents.length}개의 이벤트를 삭제하시겠습니까?`)) {
      setEvents(events.filter(event => !selectedEvents.includes(event.id)));
      setSelectedEvents([]);
      alert('선택한 이벤트가 삭제되었습니다.');
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '세일';
      case 'coupon': return '쿠폰';
      case 'special': return '특별';
      case 'new': return '신상';
      default: return type;
    }
  };

  return (
    <div className={styles.container}>
      {/* 통계 정보 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{events.length}</div>
          <div className={styles.statLabel}>전체 이벤트</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {events.filter(e => getEventStatus(e) === 'active').length}
          </div>
          <div className={styles.statLabel}>진행중</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {events.reduce((sum, e) => sum + e.participantCount, 0).toLocaleString()}
          </div>
          <div className={styles.statLabel}>총 참여자</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {events.filter(e => getEventStatus(e) === 'ended').length}
          </div>
          <div className={styles.statLabel}>종료</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="이벤트 제목, 설명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'ended')}
            className={styles.statusFilter}
          >
            <option value="all">전체 상태</option>
            <option value="active">진행중</option>
            <option value="ended">종료</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'sale' | 'coupon' | 'special' | 'new')}
            className={styles.typeFilter}
          >
            <option value="all">전체 유형</option>
            <option value="sale">세일</option>
            <option value="coupon">쿠폰</option>
            <option value="special">특별</option>
            <option value="new">신상</option>
          </select>
        </div>

        <div className={styles.actionSection}>
          <Button variant="primary">새 이벤트 생성</Button>
        </div>
      </div>

      {/* 일괄 작업 */}
      <div className={styles.bulkActions}>
        <label className={styles.selectAll}>
          <input
            type="checkbox"
            checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          전체 선택 ({selectedEvents.length}개 선택됨)
        </label>

        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            onClick={handleDeleteEvents}
            disabled={selectedEvents.length === 0}
          >
            선택 삭제
          </Button>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className={styles.eventList}>
        {filteredEvents.map(event => {
          const status = getEventStatus(event);
          return (
            <div key={event.id} className={styles.eventItem}>
              <div className={styles.eventHeader}>
                <label className={styles.eventSelect}>
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                  />
                </label>

                <div className={styles.eventImage}>
                  <Image
                    src={event.thumbnailImage}
                    alt={event.title}
                    width={80}
                    height={60}
                    className={styles.thumbnail}
                  />
                </div>

                <div className={styles.eventInfo}>
                  <div className={styles.eventTitle}>
                    {event.title}
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
                  </div>
                  <div className={styles.eventDescription}>{event.description}</div>
                  <div className={styles.eventMeta}>
                    <span className={styles.period}>
                      {event.startDate.toLocaleDateString()} ~ {event.endDate.toLocaleDateString()}
                    </span>
                    <span className={styles.participants}>
                      참여자: {event.participantCount.toLocaleString()}명
                      {event.maxParticipants && (
                        <span className={styles.maxParticipants}>
                          / {event.maxParticipants.toLocaleString()}명
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.eventActions}>
                  <Button variant="outline" size="sm">수정</Button>
                  <Button
                    variant={event.isActive ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handleToggleActive(event.id)}
                  >
                    {event.isActive ? '비활성화' : '활성화'}
                  </Button>
                </div>
              </div>

              <div className={styles.eventDetails}>
                {event.discountRate && (
                  <div className={styles.eventBenefit}>
                    할인율: {event.discountRate}%
                  </div>
                )}
                {event.discountAmount && (
                  <div className={styles.eventBenefit}>
                    적립금: {event.discountAmount.toLocaleString()}원
                  </div>
                )}
                {event.couponCode && (
                  <div className={styles.eventBenefit}>
                    쿠폰코드: {event.couponCode}
                  </div>
                )}
                {event.targetCategories && (
                  <div className={styles.eventBenefit}>
                    대상 카테고리: {event.targetCategories.join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className={styles.emptyState}>
          <p>조건에 맞는 이벤트가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
