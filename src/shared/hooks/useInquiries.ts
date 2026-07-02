'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InquiryService } from '@/shared/services/inquiryService';
import type { CreateInquiryData, Inquiry, InquiryAnswer } from '@/shared/types/inquiry';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  admin: (limitCount: number) => [...inquiryKeys.all, 'admin', limitCount] as const,
  user: (userId: string) => [...inquiryKeys.all, 'user', userId] as const,
};

export function useAdminInquiries(limitCount = 100) {
  return useQuery({
    queryKey: inquiryKeys.admin(limitCount),
    queryFn: () => InquiryService.getAllInquiries(limitCount),
    staleTime: 60 * 1000,
  });
}

export function useUserInquiries(userId: string | null) {
  return useQuery({
    queryKey: inquiryKeys.user(userId || ''),
    queryFn: () => InquiryService.getUserInquiries(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useCreateInquiry(
  user: { uid: string; email?: string | null; displayName?: string | null } | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInquiryData) =>
      InquiryService.createInquiry(user!.uid, user!.email || '', user!.displayName || 'User', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
      if (user?.uid) queryClient.invalidateQueries({ queryKey: inquiryKeys.user(user.uid) });
    },
  });
}

export function useAnswerInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inquiryId,
      answer,
    }: {
      inquiryId: string;
      answer: Omit<InquiryAnswer, 'answeredAt'>;
    }) => InquiryService.answerInquiry(inquiryId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inquiryId, status }: { inquiryId: string; status: Inquiry['status'] }) =>
      InquiryService.updateInquiryStatus(inquiryId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
  });
}
