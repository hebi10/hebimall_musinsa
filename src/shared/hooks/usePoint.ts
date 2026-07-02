// 포인트 관련 React Hook
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import PointService from '@/shared/services/pointService';
import { AddPointRequest, UsePointRequest, RefundPointRequest } from '@/shared/types/point';
import { useAuth } from '@/context/authProvider';

// 포인트 잔액 조회 Hook
export const usePointBalance = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pointBalance', user?.uid],
    queryFn: () => PointService.getPointBalance(user!.uid),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 포인트 내역 조회 Hook
export const usePointHistory = (limit: number = 50) => {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['pointHistory', user?.uid, limit],
    queryFn: ({ pageParam }) => PointService.getPointHistory(user!.uid, limit, pageParam),
    enabled: !!user,
    initialPageParam: null as QueryDocumentSnapshot<DocumentData> | null,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
  });

  return {
    history: data?.pages.flatMap((page) => page.history) || [],
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasMore: Boolean(hasNextPage),
    error,
    loadMore: () => fetchNextPage(),
    reset: refetch,
  };
};

// 포인트 적립 Hook
export const useAddPoint = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: AddPointRequest) => PointService.addPoint(data),
    onSuccess: () => {
      // 포인트 잔액과 내역 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['pointBalance', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.uid] });
    },
  });
};

// 포인트 사용 Hook
export const useUsePoint = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: UsePointRequest) => PointService.spendPoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointBalance', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.uid] });
    },
  });
};

// 포인트 환불 Hook
export const useRefundPoint = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: RefundPointRequest) => PointService.refundPoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointBalance', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.uid] });
    },
  });
};

// 특정 상황별 포인트 적립 Hook들
export const useSignupPoint = () => {
  return useMutation({
    mutationFn: () => PointService.addSignupPoint(),
  });
};

export const useOrderPoint = () => {
  return useMutation({
    mutationFn: ({ orderAmount, orderId }: { orderAmount: number; orderId: string }) => 
      PointService.addOrderPoint(orderAmount, orderId),
  });
};

export const useReviewPoint = () => {
  return useMutation({
    mutationFn: ({ productName, orderId }: { productName: string; orderId: string }) => 
      PointService.addReviewPoint(productName, orderId),
  });
};

export const useBirthdayPoint = () => {
  return useMutation({
    mutationFn: () => PointService.addBirthdayPoint(),
  });
};

const pointHooks = {
  usePointBalance,
  usePointHistory,
  useAddPoint,
  useUsePoint,
  useRefundPoint,
  useSignupPoint,
  useOrderPoint,
  useReviewPoint,
  useBirthdayPoint,
};

export default pointHooks;
