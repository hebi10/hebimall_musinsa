import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProductDetailClient from './ProductDetailClient';
import { Product } from '@/shared/types/product';
import { useUserActivity } from '@/context/userActivityProvider';

const push = jest.fn();
const addRecentProduct = jest.fn();
const addToWishlist = jest.fn();
const removeFromWishlist = jest.fn();
const loadRelatedProducts = jest.fn();

let mockWishlistItems: Array<{ id: string; productId: string; userId: string; addedAt: Date }> = [];

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/context/authProvider', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

jest.mock('@/context/userActivityProvider', () => ({
  useUserActivity: jest.fn(),
}));

jest.mock('@/context/productProvider', () => ({
  useProduct: () => ({
    relatedProducts: [],
    loadRelatedProducts,
    calculateDiscountPrice: (price: number, saleRate: number) => Math.floor(price * (1 - saleRate / 100)),
    isInStock: (product: Product) => product.stock > 0,
  }),
}));

jest.mock('@/shared/hooks/useCart', () => ({
  useAddToCart: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@/shared/hooks/useImageCache', () => ({
  useProductImageCache: jest.fn(),
}));

jest.mock('@/shared/utils/syncProductReviews', () => ({
  getProductReviewStats: jest.fn(() => new Promise(() => undefined)),
}));

jest.mock('@/app/_components/Button', () => function MockButton({
  children,
  className,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
});

jest.mock('./ProductCard', () => function MockProductCard() {
  return <div data-testid="product-card" />;
});

jest.mock('./ProductReviews', () => function MockProductReviews() {
  return <div data-testid="product-reviews" />;
});

jest.mock('./ProductDetail.module.css', () => new Proxy({}, {
  get: (_, property) => String(property),
}));

const product: Product = {
  id: 'product-1',
  name: '블루 사파이어 칵테일 반지',
  description: '테스트 상품 설명',
  price: 985000,
  originalPrice: 1250000,
  brand: 'SAPPHIRE ROYAL',
  category: 'jewelry',
  images: ['/ring.jpg'],
  sizes: ['13호'],
  colors: ['white gold'],
  stock: 12,
  rating: 4.5,
  reviewCount: 13,
  isNew: true,
  isSale: true,
  saleRate: 21,
  tags: ['신상'],
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  details: {
    material: '18K 골드',
    origin: 'Korea',
    manufacturer: 'SAPPHIRE ROYAL',
    precautions: '보관 주의',
    sizes: {},
  },
  mainImage: '/ring.jpg',
};

describe('ProductDetailClient wishlist button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    mockWishlistItems = [{
      id: 'wishlist-1',
      productId: 'product-1',
      userId: 'user-1',
      addedAt: new Date('2026-05-01T00:00:00.000Z'),
    }];
    (useUserActivity as jest.Mock).mockReturnValue({
      wishlistItems: mockWishlistItems,
      addRecentProduct,
      addToWishlist,
      removeFromWishlist,
      isInWishlist: jest.fn().mockResolvedValue(true),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('reflects wishlist removal immediately without a blocking alert', async () => {
    let resolveRemove!: () => void;
    removeFromWishlist.mockReturnValue(new Promise<void>((resolve) => {
      resolveRemove = resolve;
    }));

    render(<ProductDetailClient product={product} />);

    const wishlistButton = screen.getByRole('button', { name: '찜 해제' });
    fireEvent.click(wishlistButton);

    expect(screen.getByRole('button', { name: '찜하기' })).toBeInTheDocument();
    expect(window.alert).not.toHaveBeenCalledWith('찜 목록에서 제거되었습니다.');

    resolveRemove();

    await waitFor(() => {
      expect(removeFromWishlist).toHaveBeenCalledWith('product-1');
    });
    expect(window.alert).not.toHaveBeenCalledWith('찜 목록에서 제거되었습니다.');
  });
});

describe('ProductDetailClient detail images', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWishlistItems = [];
    (useUserActivity as jest.Mock).mockReturnValue({
      wishlistItems: mockWishlistItems,
      addRecentProduct,
      addToWishlist,
      removeFromWishlist,
      isInWishlist: jest.fn().mockResolvedValue(false),
    });
  });

  test('renders product detail images in the detail tab', () => {
    const productWithDetailImages = {
      ...product,
      detailImages: ['/detail-ring.webp'],
    } as Product & { detailImages: string[] };

    render(<ProductDetailClient product={productWithDetailImages} />);

    const detailImage = screen.getByRole('img', { name: '블루 사파이어 칵테일 반지 상세 이미지 1' });
    expect(decodeURIComponent(detailImage.getAttribute('src') || '')).toContain('/detail-ring.webp');
  });

  test('names color swatches for assistive technology', () => {
    render(<ProductDetailClient product={product} />);

    expect(screen.getByRole('button', { name: 'white gold 색상 선택' })).toBeInTheDocument();
  });
});
