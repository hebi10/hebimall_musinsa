import { CategoryService } from '@/shared/services/categoryService';
import {
  getCategoryName,
  getDefaultCategoryNames,
  invalidateCategoryNamesCache,
} from './categoryUtils';

jest.mock('@/shared/services/categoryService', () => ({
  CategoryService: {
    getCategories: jest.fn(),
  },
}));

describe('categoryUtils', () => {
  beforeEach(() => {
    invalidateCategoryNamesCache();
    jest.clearAllMocks();
  });

  test('falls back to default Korean names when remote category list is incomplete', async () => {
    (CategoryService.getCategories as jest.Mock).mockResolvedValue([]);

    await expect(getCategoryName('tops')).resolves.toBe('상의');
    expect(getDefaultCategoryNames().tops).toBe('상의');
  });
});
