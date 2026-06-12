import { render, screen, waitFor } from '@testing-library/react';
import ProductList from './ProductList';
import { ProductService } from '@/shared/services/productService';

jest.mock('./ProductList.module.css', () => ({
  __esModule: true,
  default: new Proxy({}, {
    get: (_target, property) => String(property),
  }),
}));

jest.mock('./ProductCard', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <article>{name}</article>,
}));

jest.mock('@/shared/services/productService', () => ({
  ProductService: {
    getCategories: jest.fn(),
    queryProducts: jest.fn(),
  },
}));

describe('ProductList loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ProductService.getCategories as jest.Mock).mockResolvedValue([]);
  });

  test('renders product-shaped skeleton cards during the first load', async () => {
    (ProductService.queryProducts as jest.Mock).mockReturnValue(new Promise(() => undefined));

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('상품 목록을 불러오는 중입니다');
    });
    expect(screen.getAllByLabelText('상품 목록 로딩 카드')).toHaveLength(6);
  });
});
