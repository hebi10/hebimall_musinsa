import { render, screen, waitFor } from '@testing-library/react';
import ProductList from './ProductList';

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

jest.mock('@/shared/hooks/useProducts', () => ({
  useProductSearch: jest.fn(),
}));

jest.mock('@/shared/hooks/useCategoriesQuery', () => ({
  useCategoriesQuery: jest.fn(),
}));

jest.mock('@/shared/utils/categoryUtils', () => ({
  getDefaultCategoryNames: () => ({
    bags: '가방',
  }),
}));

const { useProductSearch } = jest.requireMock('@/shared/hooks/useProducts') as {
  useProductSearch: jest.Mock;
};
const { useCategoriesQuery } = jest.requireMock('@/shared/hooks/useCategoriesQuery') as {
  useCategoriesQuery: jest.Mock;
};

describe('ProductList loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCategoriesQuery.mockReturnValue({ data: [] });
  });

  test('renders product-shaped skeleton cards during the first load', async () => {
    useProductSearch.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('상품 목록을 불러오는 중입니다');
    });
    expect(screen.getAllByLabelText('상품 목록 로딩 카드')).toHaveLength(6);
  });

  test('renders known category ids with Korean labels', async () => {
    useCategoriesQuery.mockReturnValue({ data: [{ id: 'bags', name: '가방' }] });
    useProductSearch.mockReturnValue({
      data: { pages: [{ items: [], hasMore: false }] },
      isLoading: false,
      error: null,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<ProductList />);

    expect(await screen.findByRole('option', { name: '가방' })).toHaveValue('bags');
  });
});
