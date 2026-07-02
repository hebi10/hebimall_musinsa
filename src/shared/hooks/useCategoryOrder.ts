'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoryOrderService } from '@/shared/services/categoryOrderService';

export const categoryOrderKeys = {
  all: ['categoryOrder'] as const,
  sorted: () => [...categoryOrderKeys.all, 'sorted'] as const,
  mainPage: (maxCount: number) => [...categoryOrderKeys.all, 'mainPage', maxCount] as const,
  config: (configId = 'mainPageOrder') => [...categoryOrderKeys.all, 'config', configId] as const,
};

export function useSortedCategories() {
  return useQuery({
    queryKey: categoryOrderKeys.sorted(),
    queryFn: () => CategoryOrderService.getSortedCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMainPageCategories(maxCount = 4) {
  return useQuery({
    queryKey: categoryOrderKeys.mainPage(maxCount),
    queryFn: () => CategoryOrderService.getMainPageCategories(maxCount),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryOrderConfig(configId = 'mainPageOrder') {
  return useQuery({
    queryKey: categoryOrderKeys.config(configId),
    queryFn: () => CategoryOrderService.getCategoryOrderConfig(configId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCategoryOrder(configId = 'mainPageOrder') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryOrder: string[]) =>
      CategoryOrderService.updateCategoryOrder(categoryOrder, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryOrderKeys.all });
    },
  });
}

export const getDefaultCategoryOrderNames = CategoryOrderService.getDefaultOrderNames.bind(CategoryOrderService);
