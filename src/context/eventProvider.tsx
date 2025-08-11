'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Event, EventFilter } from '@/shared/types/event';
import { EventService } from '@/shared/services/eventService';

interface EventContextType {
  events: Event[];
  filteredEvents: Event[];
  filter: EventFilter;
  currentPage: number;
  eventsPerPage: number;
  loading: boolean;
  setFilter: (filter: EventFilter) => void;
  setCurrentPage: (page: number) => void;
  getEventById: (id: string) => Event | undefined;
  getActiveEvents: () => Event[];
  getEventsByType: (type: 'sale' | 'coupon' | 'special' | 'new') => Event[];
  getTotalParticipants: () => number | string;
  resetFilter: () => void;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
}

export function EventProvider({ children }: EventProviderProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<EventFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const eventsPerPage = 6;

  // Firebase에서 이벤트 데이터 로드
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      // 에러 발생 시 mock 데이터로 fallback
      const { mockEvents } = await import('@/mocks/event');
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  // 필터링된 이벤트 목록
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filter.eventType && event.eventType !== filter.eventType) {
        return false;
      }
      if (filter.isActive !== undefined && event.isActive !== filter.isActive) {
        return false;
      }
      if (filter.startDate && event.startDate < filter.startDate) {
        return false;
      }
      if (filter.endDate && event.endDate > filter.endDate) {
        return false;
      }
      return true;
    });
  }, [events, filter]);

  // 이벤트 ID로 이벤트 찾기
  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  // 활성 이벤트만 가져오기
  const getActiveEvents = (): Event[] => {
    const now = new Date();
    return events.filter(event => 
      event.isActive && 
      now >= event.startDate && 
      now <= event.endDate
    );
  };

  // 타입별 이벤트 가져오기
  const getEventsByType = (type: 'sale' | 'coupon' | 'special' | 'new'): Event[] => {
    return events.filter(event => event.eventType === type);
  };

  // 전체 참여자 수 계산
  const getTotalParticipants = (): number | string => {
    // 모든 이벤트가 제한 없음인지 확인
    const hasUnlimitedEvents = events.some(event => !event.hasMaxParticipants);
    
    if (hasUnlimitedEvents) {
      return "제한 없음";
    }
    
    return events.reduce((total, event) => total + event.participantCount, 0);
  };

  // 필터 초기화
  const resetFilter = () => {
    setFilter({});
    setCurrentPage(1);
  };

  const contextValue: EventContextType = {
    events,
    filteredEvents,
    filter,
    currentPage,
    eventsPerPage,
    loading,
    setFilter,
    setCurrentPage,
    getEventById,
    getActiveEvents,
    getEventsByType,
    getTotalParticipants,
    resetFilter,
    refreshEvents,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent(): EventContextType {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
