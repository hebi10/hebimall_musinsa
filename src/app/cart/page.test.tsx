import { render, screen } from '@testing-library/react';
import CartPage from './page';

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

jest.mock('../_components/PageHeader', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <header>{title}</header>,
}));

jest.mock('../_components/Button', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('./page.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_target, property) => String(property),
  }),
}));

describe('CartPage mobile-friendly structure', () => {
  test('keeps each item price inside the item details block', () => {
    const { container } = render(<CartPage />);

    const firstItem = container.querySelector('.cartItem');
    const firstDetails = firstItem?.querySelector('.itemDetails');

    expect(firstDetails).not.toBeNull();
    expect(firstDetails?.querySelector('.itemPrice')).not.toBeNull();
    expect(screen.getByText('89,000원')).toBeInTheDocument();
  });
});

