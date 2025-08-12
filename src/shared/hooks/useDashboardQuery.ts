'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardService, DashboardStats } from '@/shared/services/dashboardService';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  realtime: () => [...dashboardKeys.all, 'realtime'] as const,
};

// 대시보드 통계 조회
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: DashboardService.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 새로고침
  });
}

// 실시간 데이터 조회 (더 자주 업데이트)
export function useRealtimeDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.realtime(),
    queryFn: DashboardService.getRealtimeStats,
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 새로고침
  });
}

// 대시보드 데이터 관리 Hook
export function useDashboardData() {
  const queryClient = useQueryClient();
  
  const statsQuery = useDashboardStats();
  const realtimeQuery = useRealtimeDashboardStats();

  // 수동 새로고침
  const refreshDashboard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.realtime() }),
    ]);
  };

  // 실시간 데이터를 메인 stats에 병합
  const mergedStats: DashboardStats | undefined = statsQuery.data ? {
    ...statsQuery.data,
    ...(realtimeQuery.data || {}),
  } : undefined;

  return {
    // 데이터
    stats: mergedStats,
    
    // 상태
    loading: statsQuery.isLoading,
    error: statsQuery.error?.message || realtimeQuery.error?.message || null,
    isRefreshing: statsQuery.isFetching || realtimeQuery.isFetching,
    
    // 메타 정보
    lastUpdated: statsQuery.dataUpdatedAt ? new Date(statsQuery.dataUpdatedAt) : null,
    isStale: statsQuery.isStale,
    
    // 액션
    refresh: refreshDashboard,
    
    // 개별 쿼리 상태 (디버깅용)
    statsQuery,
    realtimeQuery,
  };
}

// 대시보드 포맷팅 유틸리티 (기존과 동일)
export function useDashboardFormatters() {
  const formatNumber = (num: number): string => {
    return DashboardService.formatNumber(num);
  };

  const formatCurrency = (amount: number): string => {
    return DashboardService.formatCurrency(amount);
  };

  const formatTimeAgo = (timestamp: Date): string => {
    return DashboardService.formatTimeAgo(timestamp);
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return '#10b981'; // green
    if (growth < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getGrowthIcon = (growth: number): string => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return {
    formatNumber,
    formatCurrency,
    formatTimeAgo,
    getGrowthColor,
    getGrowthIcon,
    getPriorityColor
  };
}
