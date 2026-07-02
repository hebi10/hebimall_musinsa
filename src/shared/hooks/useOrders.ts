'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  OrderService,
  type CreateOrderRequest,
} from '@/shared/services/orderService';
import type { OrderStatus } from '@/shared/types/order';

export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
  user: (userId: string, limitCount: number) => [...orderKeys.all, 'user', userId, limitCount] as const,
  admin: () => [...orderKeys.all, 'admin'] as const,
};

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(orderId || ''),
    queryFn: () => OrderService.getOrder(orderId!),
    enabled: !!orderId,
    staleTime: 60 * 1000,
  });
}

export function useUserOrders(userId: string | null, limitCount = 20) {
  return useQuery({
    queryKey: orderKeys.user(userId || '', limitCount),
    queryFn: () => OrderService.getUserOrders(userId!, limitCount),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: orderKeys.admin(),
    queryFn: async () => {
      const [orders, stats] = await Promise.all([
        OrderService.getAllOrders(100),
        OrderService.getOrderStats(),
      ]);
      return { orders, stats };
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => OrderService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useOrderLookup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.getOrder(orderId),
    onSuccess: (order, orderId) => {
      if (order) queryClient.setQueryData(orderKeys.detail(orderId), order);
    },
  });
}

export function useCancelOrder(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      OrderService.cancelOrder(orderId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      if (userId) queryClient.invalidateQueries({ queryKey: orderKeys.user(userId, 50) });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      OrderService.updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
  });
}
