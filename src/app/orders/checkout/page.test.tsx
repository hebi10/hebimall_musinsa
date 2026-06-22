import { render, screen } from '@testing-library/react';
import CheckoutPage from './page';
import { useAuth } from '@/context/authProvider';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

jest.mock('../../_components/PageHeader', () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description?: string }) => (
    <header>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  ),
}));

jest.mock('@/context/authProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/context/couponProvider', () => ({
  useCoupon: () => ({ userCoupons: [] }),
}));

jest.mock('@/context/pointProvider', () => ({
  usePoint: () => ({ pointBalance: 0 }),
}));

jest.mock('@/shared/services/orderService', () => ({
  OrderService: {
    createOrder: jest.fn(),
  },
}));

jest.mock('./page.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_target, property) => String(property),
  }),
}));

describe('CheckoutPage recovery state', () => {
  beforeEach(() => {
    sessionStorage.clear();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'user-1', displayName: '구매자' },
      userData: { name: '구매자' },
      loading: false,
    });
  });

  test('shows a cart recovery link when checkout data is missing', async () => {
    render(<CheckoutPage />);

    expect(await screen.findByRole('status')).toHaveTextContent('주문 정보를 불러올 수 없습니다');
    expect(screen.getByRole('link', { name: '장바구니로 돌아가기' })).toHaveAttribute('href', '/orders/cart');
  });
});
