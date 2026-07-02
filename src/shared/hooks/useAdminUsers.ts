'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AdminUserService,
  type AdminUserData,
  type PointOperation,
  type UserFilter,
} from '@/shared/services/adminUserService';

export const adminUserKeys = {
  all: ['adminUsers'] as const,
  list: (filters: UserFilter, page: number, limitCount: number) =>
    [...adminUserKeys.all, 'list', filters, page, limitCount] as const,
  stats: () => [...adminUserKeys.all, 'stats'] as const,
  pointHistory: (userId: string) => [...adminUserKeys.all, 'pointHistory', userId] as const,
};

export function useAdminUsers(filters: UserFilter, page = 1, limitCount = 10) {
  return useQuery({
    queryKey: adminUserKeys.list(filters, page, limitCount),
    queryFn: () => AdminUserService.getUsers(filters, page, limitCount),
    staleTime: 60 * 1000,
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: adminUserKeys.stats(),
    queryFn: () => AdminUserService.getUserStats(),
    staleTime: 60 * 1000,
  });
}

export function useAdminUserPointHistory(userId: string | null) {
  return useQuery({
    queryKey: adminUserKeys.pointHistory(userId || ''),
    queryFn: () => AdminUserService.getUserPointHistory(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useAdminUserPointHistoryLookup() {
  return useMutation({
    mutationFn: (userId: string) => AdminUserService.getUserPointHistory(userId),
  });
}

function invalidateAdminUsers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminUserData['status'] }) =>
      AdminUserService.updateUserStatus(userId, status),
    onSuccess: () => invalidateAdminUsers(queryClient),
  });
}

export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AdminUserData['role'] }) =>
      AdminUserService.updateUserRole(userId, role),
    onSuccess: () => invalidateAdminUsers(queryClient),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => AdminUserService.deleteUser(userId),
    onSuccess: () => invalidateAdminUsers(queryClient),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: { name: string; email: string; role?: 'user' | 'admin'; status?: 'active' | 'inactive' }) =>
      AdminUserService.createUser(userData),
    onSuccess: () => invalidateAdminUsers(queryClient),
  });
}

export function useUpdateAdminUserPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operation: PointOperation) => AdminUserService.updateUserPoints(operation),
    onSuccess: (_, variables) => {
      invalidateAdminUsers(queryClient);
      queryClient.invalidateQueries({ queryKey: adminUserKeys.pointHistory(variables.userId) });
    },
  });
}

export function useGivePointsToAllUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      AdminUserService.givePointsToAllUsers(amount, description),
    onSuccess: () => invalidateAdminUsers(queryClient),
  });
}

export function useExportAdminUsersCsv() {
  return useMutation({
    mutationFn: () => AdminUserService.exportUsersToCSV(),
  });
}
