'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ProductService, type ProductQueryInput } from '@/shared/services/productService';
import type { Product } from '@/shared/types/product';

type ProductCursor = QueryDocumentSnapshot<DocumentData> | null;

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  query: (input: Omit<ProductQueryInput, 'startAfterDoc'>) => [...productKeys.lists(), input] as const,
  detail: (productId: string) => [...productKeys.all, 'detail', productId] as const,
  related: (productId: string, limit: number) => [...productKeys.all, 'related', productId, limit] as const,
  home: () => [...productKeys.all, 'home'] as const,
  category: (categorySlug: string, limitCount?: number) =>
    [...productKeys.all, 'category', categorySlug, limitCount || 'all'] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
  recommended: (kind: string, limitCount: number) =>
    [...productKeys.all, 'recommended', kind, limitCount] as const,
  map: (productIds: string[]) => [...productKeys.all, 'map', productIds] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => ProductService.getAllProducts(),
    staleTime: 60 * 1000,
  });
}

export function useProductSearch(input: Omit<ProductQueryInput, 'startAfterDoc'>, enabled = true) {
  return useInfiniteQuery({
    queryKey: productKeys.query(input),
    queryFn: ({ pageParam }) => ProductService.queryProducts({
      ...input,
      startAfterDoc: pageParam,
    }),
    enabled,
    initialPageParam: null as ProductCursor,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 60 * 1000,
  });
}

export function useHomePageProducts() {
  return useQuery({
    queryKey: productKeys.home(),
    queryFn: () => ProductService.getHomePageProducts(),
    staleTime: 60 * 1000,
  });
}

export function useProductDetail(productId: string | null) {
  return useQuery({
    queryKey: productKeys.detail(productId || ''),
    queryFn: () => ProductService.getProductById(productId!),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useProductsByCategory(categorySlug: string | null, limitCount?: number) {
  return useQuery({
    queryKey: productKeys.category(categorySlug || '', limitCount),
    queryFn: () => ProductService.getProductsByCategory(categorySlug!, limitCount),
    enabled: !!categorySlug,
    staleTime: 60 * 1000,
  });
}

export function useBrandSummaries() {
  return useQuery({
    queryKey: productKeys.brands(),
    queryFn: () => ProductService.getBrandSummaries(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecommendedProducts(kind: 'recommended' | 'topRated' | 'reviewPopular' | 'sale' | 'new', limitCount = 24) {
  return useQuery({
    queryKey: productKeys.recommended(kind, limitCount),
    queryFn: () => {
      switch (kind) {
        case 'topRated':
          return ProductService.getTopRatedProducts(limitCount);
        case 'reviewPopular':
          return ProductService.getReviewPopularProducts(limitCount);
        case 'sale':
          return ProductService.getSaleProducts(limitCount);
        case 'new':
          return ProductService.getNewProducts(limitCount);
        default:
          return ProductService.getRecommendedProducts(limitCount);
      }
    },
    staleTime: 60 * 1000,
  });
}

export function useRelatedProducts(productId: string | null, limit = 4) {
  return useQuery({
    queryKey: productKeys.related(productId || '', limit),
    queryFn: () => ProductService.getRelatedProducts(productId!, limit),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useProductMap(productIds: string[]) {
  const stableIds = Array.from(new Set(productIds.filter(Boolean))).sort();

  return useQuery({
    queryKey: productKeys.map(stableIds),
    queryFn: async () => {
      const entries = await Promise.all(
        stableIds.map(async (productId) => {
          const product = await ProductService.getProductById(productId);
          return [productId, product] as const;
        })
      );

      return Object.fromEntries(entries.filter(([, product]) => product)) as Record<string, Product>;
    },
    enabled: stableIds.length > 0,
    staleTime: 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      ProductService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, updates }: {
      productId: string;
      updates: Partial<Omit<Product, 'id' | 'createdAt'>>;
    }) => ProductService.updateProduct(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => ProductService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
