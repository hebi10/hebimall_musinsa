'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HybridUserActivityService } from '@/shared/services/hybridUserActivityService';

export const userActivityKeys = {
  all: ['userActivity'] as const,
  recent: (userId: string) => [...userActivityKeys.all, 'recent', userId] as const,
  wishlist: (userId: string) => [...userActivityKeys.all, 'wishlist', userId] as const,
};

export function useRecentProducts(userId: string | null, limit = 10) {
  return useQuery({
    queryKey: [...userActivityKeys.recent(userId || ''), limit],
    queryFn: () => HybridUserActivityService.getRecentProducts(userId!, limit),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useWishlistItems(userId: string | null) {
  return useQuery({
    queryKey: userActivityKeys.wishlist(userId || ''),
    queryFn: () => HybridUserActivityService.getWishlist(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useAddRecentProduct(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => HybridUserActivityService.addRecentProduct(userId!, productId),
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: userActivityKeys.recent(userId) });
    },
  });
}

export function useRemoveWishlistItem(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => HybridUserActivityService.removeFromWishlist(userId!, productId),
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: userActivityKeys.wishlist(userId) });
    },
  });
}

export function useToggleWishlist(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, wished }: { productId: string; wished: boolean }) => {
      if (wished) {
        await HybridUserActivityService.removeFromWishlist(userId!, productId);
        return false;
      }

      await HybridUserActivityService.addToWishlist(userId!, productId);
      return true;
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: userActivityKeys.wishlist(userId) });
    },
  });
}

export function useClearUserActivity(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => HybridUserActivityService.clearAllUserData(userId!),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: userActivityKeys.recent(userId) });
      queryClient.invalidateQueries({ queryKey: userActivityKeys.wishlist(userId) });
    },
  });
}
