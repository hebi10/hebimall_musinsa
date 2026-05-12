import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProductDetailPage from './page';
import { ProductService } from '@/shared/services/productService';
import { useAuth } from '@/context/authProvider';
import { useAddToCart } from '@/shared/hooks/useCart';
import { Product } from '@/shared/types/product';

const push = jest.fn();
const mutateAsync = jest.fn();

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/shared/services/productService', () => ({
  ProductService: {
    getProductById: jest.fn(),
    getRelatedProducts: jest.fn(),
  },
}));

jest.mock('@/shared/utils/categoryUtils', () => ({
  getCategoryName: jest.fn().mockResolvedValue('상의'),
}));

jest.mock('@/context/authProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/shared/hooks/useCart', () => ({
  useAddToCart: jest.fn(),
}));

jest.mock('./ProductDetail.module.css', () => new Proxy({}, {
  get: (_, property) => String(property),
}));

const product: Product = {
  id: 'product-1',
  name: '테스트 셔츠',
  description: '테스트 상품 설명',
  price: 12000,
  originalPrice: 15000,
  brand: 'HEBI',
  category: 'tops',
  images: ['/shirt.jpg'],
  sizes: ['M'],
  colors: ['black'],
  stock: 3,
  rating: 4.5,
  reviewCount: 12,
  isNew: false,
  isSale: true,
  tags: [],
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  details: {
    material: 'cotton',
    origin: 'Korea',
    manufacturer: 'HEBI',
    precautions: '단독 세탁',
    sizes: {},
  },
  mainImage: '/shirt.jpg',
};

describe('category product detail purchase actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    push.mockClear();
    mutateAsync.mockResolvedValue({});
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'user-1' } });
    (useAddToCart as jest.Mock).mockReturnValue({ mutateAsync });
    (ProductService.getProductById as jest.Mock).mockResolvedValue(product);
    (ProductService.getRelatedProducts as jest.Mock).mockResolvedValue([]);
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('adds the selected product option to the real cart service', async () => {
    render(<ProductDetailPage params={Promise.resolve({ category: 'tops', productId: 'product-1' })} />);

    fireEvent.click(await screen.findByRole('button', { name: '장바구니 담기' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        userId: 'user-1',
        product,
        request: {
          productId: 'product-1',
          size: 'M',
          color: 'black',
          quantity: 1,
        },
      });
    });
  });

  test('writes checkout draft and moves to checkout on buy now', async () => {
    render(<ProductDetailPage params={Promise.resolve({ category: 'tops', productId: 'product-1' })} />);

    fireEvent.click(await screen.findByRole('button', { name: '바로 구매' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/orders/checkout');
    });
    expect(JSON.parse(sessionStorage.getItem('orderData') || '{}')).toMatchObject({
      items: [{
        productId: 'product-1',
        id: 'product-1-M-black',
        productName: '테스트 셔츠',
        productImage: '/shirt.jpg',
        brand: 'HEBI',
        size: 'M',
        color: 'black',
        quantity: 1,
        price: 12000,
        discountAmount: 3000,
      }],
      selectedCoupon: '',
      deliveryOption: 'standard',
    });
  });
});
