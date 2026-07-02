'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FeaturedProductService,
  type FeaturedProductConfig,
} from '@/shared/services/featuredProductService';
import { productKeys } from '@/shared/hooks/useProducts';

export const featuredProductKeys = {
  all: ['featuredProducts'] as const,
  list: () => [...featuredProductKeys.all, 'list'] as const,
  config: (configId = 'mainPageFeatured') => [...featuredProductKeys.all, 'config', configId] as const,
  admin: () => [...featuredProductKeys.all, 'admin'] as const,
};

export function useFeaturedProductsSection() {
  return useQuery({
    queryKey: featuredProductKeys.admin(),
    queryFn: async () => {
      const [products, config] = await Promise.all([
        FeaturedProductService.getFeaturedProducts(),
        FeaturedProductService.getFeaturedProductConfig(),
      ]);

      return { products, config };
    },
    staleTime: 60 * 1000,
  });
}

export function useFeaturedProductConfig(configId = 'mainPageFeatured') {
  return useQuery({
    queryKey: featuredProductKeys.config(configId),
    queryFn: () => FeaturedProductService.getFeaturedProductConfig(configId),
    staleTime: 60 * 1000,
  });
}

export function useUpdateFeaturedProductConfig(configId = 'mainPageFeatured') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productIds, options }: {
      productIds: string[];
      options?: Partial<Omit<FeaturedProductConfig, 'id' | 'productIds' | 'createdAt' | 'updatedAt'>>;
    }) => FeaturedProductService.updateFeaturedProductConfig(productIds, configId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featuredProductKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
