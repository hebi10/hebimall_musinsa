'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '@/shared/services/categoryService';
import { DEFAULT_CATEGORY_IDS, getDefaultCategoryNames } from '@/shared/utils/categoryUtils';

export interface CategoryView {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
};

const fallbackCategories: CategoryView[] = DEFAULT_CATEGORY_IDS.map((id, index) => {
  const categoryNames = getDefaultCategoryNames();
  const now = new Date();

  return {
    id,
    name: categoryNames[id] || id,
    description: `${categoryNames[id] || id} category`,
    icon: '',
    color: '#000000',
    order: index + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
});

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const categoryNames = getDefaultCategoryNames();
      const categories = (await CategoryService.getCategories())
        .map((category) => ({
          id: category.id,
          name: categoryNames[category.name.toLowerCase()] || categoryNames[category.id.toLowerCase()] || category.name || category.id,
          description: category.description || '',
          order: category.order || 0,
          isActive: category.isActive,
          icon: category.icon || '',
          color: '#000000',
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        } satisfies CategoryView))
        .filter((category) => category.id && category.name);

      return categories.length > 0
        ? categories.filter((category) => category.isActive).sort((a, b) => a.order - b.order)
        : fallbackCategories;
    },
    staleTime: 5 * 60 * 1000,
  });
}
