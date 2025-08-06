// 포인트 관련 React Hook
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PointService from '@/shared/services/pointService';
import { PointHistory, AddPointRequest, UsePointRequest, RefundPointRequest } from '@/shared/types/point';
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
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [allHistory, setAllHistory] = useState<PointHistory[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pointHistory', user?.uid, limit],
    queryFn: () => PointService.getPointHistory(user!.uid, limit),
    enabled: !!user,
  });

  useEffect(() => {
    if (data?.success && data.history) {
      setAllHistory(data.history);
      setLastDoc(data.lastDoc);
      setHasMore(data.hasMore);
    }
  }, [data]);

  const loadMore = async () => {
    if (!hasMore || isLoadingMore || !lastDoc) return;

    setIsLoadingMore(true);
    try {
      const response = await PointService.getPointHistory(user!.uid, limit, lastDoc);
      if (response.success) {
        setAllHistory(prev => [...prev, ...response.history]);
        setLastDoc(response.lastDoc);
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('포인트 내역 추가 로드 실패:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const reset = () => {
    setAllHistory([]);
    setLastDoc(null);
    setHasMore(true);
    refetch();
  };

  return {
    history: allHistory,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset,
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
    mutationFn: (data: UsePointRequest) => PointService.usePoint(data),
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

export default {
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
