import React from 'react';
import { render, screen } from '@testing-library/react';
import EditEventPage from './page';
import { Event } from '@/shared/types/event';
import { EventService } from '@/shared/services/eventService';

jest.mock('@/app/admin/events/[eventId]/edit/page.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_target, prop) => String(prop),
  }),
}));

jest.mock('@/app/admin/events/_components/EventNavigation', () => ({
  __esModule: true,
  default: () => <nav>이벤트 관리 메뉴</nav>,
}));

jest.mock('@/app/admin/events/_components/EventForm', () => ({
  __esModule: true,
  default: ({ event, isEdit }: { event: Event; isEdit: boolean }) => (
    <div data-testid="event-form">{isEdit ? event.title : 'create'}</div>
  ),
}));

jest.mock('@/shared/services/eventService', () => ({
  EventService: {
    getEventById: jest.fn(),
  },
}));

describe('EditEventPage', () => {
  test('loads the Firebase event and renders the edit form', async () => {
    jest.mocked(EventService.getEventById).mockResolvedValue({
      id: 'event-1',
      title: '관리자 수정 이벤트',
      description: '설명',
      bannerImage: '/banner.webp',
      thumbnailImage: '/thumb.webp',
      eventType: 'sale',
      startDate: new Date('2026-06-01T00:00:00+09:00'),
      endDate: new Date('2026-06-30T23:59:59+09:00'),
      isActive: true,
      participantCount: 0,
      hasMaxParticipants: false,
      createdAt: new Date('2026-06-01T00:00:00+09:00'),
      updatedAt: new Date('2026-06-01T00:00:00+09:00'),
    });

    const element = await EditEventPage({
      params: Promise.resolve({ eventId: 'event-1' }),
    });

    render(element);

    expect(screen.getByTestId('event-form')).toHaveTextContent('관리자 수정 이벤트');
  });
});
