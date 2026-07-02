'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ReviewService } from '@/shared/services/reviewService';
import type { Review } from '@/shared/types/review';

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  summary: (productId: string) => [...reviewKeys.all, 'summary', productId] as const,
  list: (input: unknown = {}) => [...reviewKeys.all, 'list', input] as const,
};

export function useProductReviews(productId: string | null) {
  return useInfiniteQuery({
    queryKey: reviewKeys.product(productId || ''),
    queryFn: ({ pageParam }) => ReviewService.getProductReviews(productId!, 10, pageParam),
    enabled: !!productId,
    initialPageParam: undefined as QueryDocumentSnapshot<DocumentData> | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    staleTime: 60 * 1000,
  });
}

export function useReviewSummary(productId: string | null) {
  return useQuery({
    queryKey: reviewKeys.summary(productId || ''),
    queryFn: () => ReviewService.getReviewSummary(productId!),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useAllReviews(
  page = 1,
  rating?: number,
  sortBy: 'latest' | 'rating' | 'helpful' = 'latest',
  limitCount = 10
) {
  return useQuery({
    queryKey: reviewKeys.list({ page, rating, sortBy, limitCount }),
    queryFn: async () => {
      const [result, statistics] = await Promise.all([
        ReviewService.getAllReviews(page, limitCount, rating, sortBy),
        ReviewService.getReviewStatistics(rating),
      ]);

      return { ...result, statistics };
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) =>
      ReviewService.createReview(productId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => ReviewService.deleteReview(productId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}
