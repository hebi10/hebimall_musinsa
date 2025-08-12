'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardService, DashboardStats } from '@/shared/services/dashboardService';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 대시보드 데이터 로드
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardStats = await DashboardService.getDashboardStats();
      setStats(dashboardStats);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '대시보드 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('대시보드 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 실시간 데이터 업데이트 (부분 업데이트)
  const updateRealtimeData = useCallback(async () => {
    if (!stats) return;

    try {
      const realtimeStats = await DashboardService.getRealtimeStats();
      setStats(prevStats => ({
        ...prevStats!,
        ...realtimeStats
      }));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('실시간 데이터 업데이트 실패:', err);
    }
  }, [stats]);

  // 수동 새로고침
  const refresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 컴포넌트 마운트시 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 실시간 업데이트 (30초마다)
  useEffect(() => {
    if (!stats) return;

    const interval = setInterval(() => {
      updateRealtimeData();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [updateRealtimeData, stats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
    updateRealtimeData
  };
}

// 대시보드 통계 포맷팅 유틸리티 훅
export function useDashboardFormatters() {
  const formatNumber = useCallback((num: number): string => {
    return DashboardService.formatNumber(num);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return DashboardService.formatCurrency(amount);
  }, []);

  const formatTimeAgo = useCallback((timestamp: Date): string => {
    return DashboardService.formatTimeAgo(timestamp);
  }, []);

  const getGrowthColor = useCallback((growth: number): string => {
    if (growth > 0) return '#10b981'; // green
    if (growth < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  }, []);

  const getGrowthIcon = useCallback((growth: number): string => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  }, []);

  const getPriorityColor = useCallback((priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }, []);

  return {
    formatNumber,
    formatCurrency,
    formatTimeAgo,
    getGrowthColor,
    getGrowthIcon,
    getPriorityColor
  };
}
