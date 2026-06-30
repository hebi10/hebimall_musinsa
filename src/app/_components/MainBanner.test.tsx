import React from 'react';
import { render, screen } from '@testing-library/react';
import MainBanner from './MainBanner';

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

describe('MainBanner', () => {
  test('renders event hero slides with generated images and event links', () => {
    const { container } = render(<MainBanner />);

    expect(screen.getByLabelText('메인 이벤트 배너')).toBeInTheDocument();
    expect(container.querySelector('.bannerPlaceholder')).toBeNull();
    expect(container.querySelectorAll('.bannerSlide')).toHaveLength(3);
    expect(container.querySelectorAll('img')).toHaveLength(3);

    expect(screen.getByRole('heading', { name: '상반기 베스트 최대 60%' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '미드이어 세일 보기' })).toHaveAttribute(
      'href',
      '/events/event-2026-06-midyear-sale',
    );
    expect(container.querySelector('a[href="/events/event-2026-07-vacation-coupon"]')).not.toBeNull();
    expect(container.querySelector('a[href="/events/event-2026-07-cool-touch"]')).not.toBeNull();
  });
});
