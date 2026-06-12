import React from 'react';
import { render, screen } from '@testing-library/react';
import EventList from './EventList';
import { Event } from '@/shared/types/event';

jest.mock('./EventList.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_target, prop) => String(prop),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const { alt, ...imageProps } = props;
    delete imageProps.priority;

    return React.createElement('img', { alt, ...imageProps });
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/app/_components/Button', () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/shared/services/eventService', () => ({
  getEventStatus: () => 'ongoing',
  getFeaturedEvent: (events: Event[]) => events[0],
}));

jest.mock('@/context/eventProvider', () => ({
  useEvent: jest.fn(),
}));

const { useEvent } = jest.requireMock('@/context/eventProvider') as {
  useEvent: jest.Mock;
};

const baseEvent = (overrides: Partial<Event>): Event => ({
  id: 'event-1',
  title: '미드이어 세일',
  description: '여름 인기 상품을 큰 혜택으로 만나는 기간 한정 세일입니다.',
  content: '<p>이벤트 소개</p>',
  bannerImage: '/events/2026/event-2026-06-midyear-sale-banner.webp',
  thumbnailImage: '/events/2026/event-2026-06-midyear-sale-thumb.webp',
  eventType: 'sale',
  startDate: new Date('2026-06-01T00:00:00+09:00'),
  endDate: new Date('2026-06-30T23:59:59+09:00'),
  isActive: true,
  discountRate: 60,
  participantCount: 120,
  hasMaxParticipants: false,
  createdAt: new Date('2026-06-01T00:00:00+09:00'),
  updatedAt: new Date('2026-06-05T00:00:00+09:00'),
  ...overrides,
});

const renderEventList = () => {
  const events = [
    baseEvent({ id: 'featured-event', title: '미드이어 세일' }),
    baseEvent({
      id: 'coupon-event',
      title: '바캉스 쿠폰팩',
      eventType: 'coupon',
      couponCode: 'VACANCE12',
      bannerImage: '/events/2026/event-2026-07-vacation-coupon-banner.webp',
      thumbnailImage: '/events/2026/event-2026-07-vacation-coupon-thumb.webp',
      createdAt: new Date('2026-05-20T00:00:00+09:00'),
    }),
  ];

  useEvent.mockReturnValue({
    events,
    filteredEvents: events,
    filter: {},
    currentPage: 1,
    eventsPerPage: 6,
    loading: false,
    error: null,
    setFilter: jest.fn(),
    setCurrentPage: jest.fn(),
    getActiveEvents: () => events,
    getTotalParticipants: () => '제한 없음',
    refreshEvents: jest.fn(),
  });

  return render(<EventList />);
};

describe('EventList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders events as image-led poster surfaces with text overlays', () => {
    const { container } = renderEventList();

    const posterHero = container.querySelector('.posterHero');

    expect(posterHero).not.toBeNull();
    expect(container.querySelector('.posterHeroOverlay')).not.toBeNull();
    expect(container.querySelectorAll('.eventPosterCard')).toHaveLength(2);
    expect(container.querySelectorAll('.posterCardOverlay')).toHaveLength(2);
    expect(container.querySelector('.eventInfo')).toBeNull();

    expect(posterHero).toHaveAttribute('href', '/events/featured-event');
    expect(screen.getAllByText('미드이어 세일').length).toBeGreaterThan(0);
  });

  test('renders event-shaped skeleton cards while loading', () => {
    useEvent.mockReturnValue({
      events: [],
      filteredEvents: [],
      filter: {},
      currentPage: 1,
      eventsPerPage: 6,
      loading: true,
      error: null,
      setFilter: jest.fn(),
      setCurrentPage: jest.fn(),
      getActiveEvents: () => [],
      getTotalParticipants: () => 0,
      refreshEvents: jest.fn(),
    });

    render(<EventList />);

    expect(screen.getByRole('status')).toHaveTextContent('이벤트를 불러오는 중입니다');
    expect(screen.getAllByLabelText('이벤트 로딩 카드')).toHaveLength(3);
  });
});
