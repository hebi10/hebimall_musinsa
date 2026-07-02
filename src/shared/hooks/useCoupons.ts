'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CouponService } from '@/shared/services/couponService';
import type { Coupon, CouponFilter } from '@/shared/types/coupon';

export const couponKeys = {
  all: ['coupons'] as const,
  admin: () => [...couponKeys.all, 'admin'] as const,
  user: (userId: string, filter?: CouponFilter) => [...couponKeys.all, 'user', userId, filter || {}] as const,
  userStats: (userId: string) => [...couponKeys.all, 'userStats', userId] as const,
};

export function useAdminCoupons() {
  return useQuery({
    queryKey: couponKeys.admin(),
    queryFn: async () => {
      const [coupons, stats] = await Promise.all([
        CouponService.getAllCoupons(),
        CouponService.getCouponStats(),
      ]);

      return { coupons, stats };
    },
    staleTime: 60 * 1000,
  });
}

export function useUserCoupons(userId: string | null, filter?: CouponFilter) {
  return useQuery({
    queryKey: couponKeys.user(userId || '', filter),
    queryFn: () => CouponService.getUserCoupons(userId!, filter),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useUserCouponStats(userId: string | null) {
  return useQuery({
    queryKey: couponKeys.userStats(userId || ''),
    queryFn: () => CouponService.getUserCouponStats(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useRegisterCouponByCode(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponCode: string) => CouponService.registerCouponByCode(userId!, couponCode),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>) =>
      CouponService.createCoupon(coupon),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, updateData }: { couponId: string; updateData: Partial<Coupon> }) =>
      CouponService.updateCoupon(couponId, updateData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => CouponService.deleteCoupon(couponId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export const getDaysUntilCouponExpiry = CouponService.getDaysUntilExpiry.bind(CouponService);
