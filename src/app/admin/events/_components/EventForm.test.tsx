import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventForm from './EventForm';
import { Event } from '@/shared/types/event';
import { CategoryService } from '@/shared/services/categoryService';

jest.mock('./EventForm.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_target, prop) => String(prop),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/app/_components/Button', () => ({
  __esModule: true,
  default: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/app/_components/Input', () => ({
  __esModule: true,
  default: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/shared/services/categoryService', () => ({
  CategoryService: {
    getCategories: jest.fn(),
  },
}));

jest.mock('@/shared/services/eventService', () => ({
  EventService: {
    uploadImage: jest.fn(),
    updateEvent: jest.fn(),
    createEvent: jest.fn(),
  },
}));

const baseEvent: Event = {
  id: 'event-1',
  title: '상세 이미지 이벤트',
  description: '설명',
  content: '<p>본문</p>',
  bannerImage: '/banner.webp',
  thumbnailImage: '/thumb.webp',
  detailImage: '/detail.webp',
  eventType: 'sale',
  startDate: new Date('2026-06-01T00:00:00+09:00'),
  endDate: new Date('2026-06-30T23:59:59+09:00'),
  isActive: true,
  participantCount: 0,
  hasMaxParticipants: false,
  createdAt: new Date('2026-06-01T00:00:00+09:00'),
  updatedAt: new Date('2026-06-01T00:00:00+09:00'),
};

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('EventForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders an existing detail image for editing', async () => {
    jest.mocked(CategoryService.getCategories).mockResolvedValue([]);

    renderWithQueryClient(<EventForm event={baseEvent} isEdit />);

    await waitFor(() => {
      expect(screen.getByAltText('상세 이미지')).toHaveAttribute('src', '/detail.webp');
    });
  });
});
