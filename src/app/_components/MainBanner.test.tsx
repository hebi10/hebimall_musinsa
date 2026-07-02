import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainBanner from './MainBanner';
import { SiteContentService } from '@/shared/services/siteContentService';

jest.mock('./MainBanner.module.css', () => ({
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
    delete (imageProps as React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }).fill;

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

jest.mock('@/shared/services/siteContentService', () => ({
  SiteContentService: {
    getMainBanners: jest.fn(),
  },
}));

const bannerSlides = [
  {
    id: 'event-2026-06-midyear-sale',
    eyebrow: '오늘 마감',
    title: '상반기 베스트 최대 60%',
    description: '인기 아이템을 강한 혜택으로 정리했습니다.',
    ctaLabel: '세일 보기',
    href: '/events/event-2026-06-midyear-sale',
    image: '/main/main_event_midyear_sale.webp',
    backgroundColor: '#c9c0b3',
    order: 1,
  },
  {
    id: 'event-2026-07-vacation-coupon',
    eyebrow: '7월 쿠폰팩',
    title: '휴가룩 쿠폰 3종',
    description: '여름 준비에 바로 쓰는 쿠폰 혜택입니다.',
    ctaLabel: '쿠폰팩 보기',
    href: '/events/event-2026-07-vacation-coupon',
    image: '/main/main_event_vacation_coupon.webp',
    backgroundColor: '#d4c4ad',
    order: 2,
  },
  {
    id: 'event-2026-07-cool-touch',
    eyebrow: '한여름 데일리 세일',
    title: '쿨터치 최대 35%',
    description: '시원한 소재 아이템을 모았습니다.',
    ctaLabel: '쿨터치 세일 보기',
    href: '/events/event-2026-07-cool-touch',
    image: '/main/main_event_cool_touch.webp',
    mobileImage: '/main/main_event_cool_touch_mobile.webp',
    backgroundColor: '#b9c8cf',
    order: 3,
  },
];

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('MainBanner', () => {
  beforeEach(() => {
    jest.mocked(SiteContentService.getMainBanners).mockResolvedValue([bannerSlides[0]]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders Firebase banner slides with generated images and event links', async () => {
    const { container } = renderWithQueryClient(<MainBanner />);

    await waitFor(() => expect(screen.getByRole('link', { name: '세일 보기' })).toHaveAttribute(
      'href',
      '/events/event-2026-06-midyear-sale',
    ));
    expect(container.querySelector('.bannerPlaceholder')).toBeNull();
    expect(container.querySelectorAll('.bannerSlide')).toHaveLength(1);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: '상반기 베스트 최대 60%' })).toBeInTheDocument();
  });

  test('renders fallback event banners when Firebase load fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(SiteContentService.getMainBanners).mockRejectedValue(new Error('permission'));

    renderWithQueryClient(<MainBanner />);

    await waitFor(() => expect(screen.getByText('쿨터치 최대 35%')).toBeInTheDocument());
    expect(screen.getByText('쿨터치 세일 보기').closest('a')).toHaveAttribute(
      'href',
      '/events/event-2026-07-cool-touch',
    );

    consoleError.mockRestore();
  });

  test('restarts auto rotation after manual navigation', async () => {
    jest.useFakeTimers();
    jest.mocked(SiteContentService.getMainBanners).mockResolvedValue(bannerSlides);

    const { container } = renderWithQueryClient(<MainBanner />);

    await act(async () => {
      await Promise.resolve();
    });

    const slides = Array.from(container.querySelectorAll<HTMLElement>('.bannerSlide'));
    expect(slides[0]).toHaveClass('activeSlide');
    expect(slides[2].style.getPropertyValue('--banner-image-position')).toBe('25% top');
    expect(container.querySelector('img[src="/main/main_event_cool_touch_mobile.webp"]')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4400);
    });
    fireEvent.click(screen.getByRole('button', { name: '다음 배너' }));

    expect(slides[1]).toHaveClass('activeSlide');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(slides[1]).toHaveClass('activeSlide');

    act(() => {
      jest.advanceTimersByTime(4400);
    });

    expect(slides[2]).toHaveClass('activeSlide');
  });
});
