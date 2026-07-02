'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  SiteContentService,
  type RecommendationSettingContent,
} from '@/shared/services/siteContentService';

export const siteContentKeys = {
  all: ['siteContent'] as const,
  mainBanners: () => [...siteContentKeys.all, 'mainBanners'] as const,
  faqs: () => [...siteContentKeys.all, 'faqs'] as const,
  notices: () => [...siteContentKeys.all, 'notices'] as const,
  offline: () => [...siteContentKeys.all, 'offline'] as const,
  recommendations: () => [...siteContentKeys.all, 'recommendations'] as const,
};

export function useMainBanners() {
  return useQuery({
    queryKey: siteContentKeys.mainBanners(),
    queryFn: () => SiteContentService.getMainBanners(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: siteContentKeys.faqs(),
    queryFn: () => SiteContentService.getFaqs(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotices() {
  return useQuery({
    queryKey: siteContentKeys.notices(),
    queryFn: () => SiteContentService.getNotices(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOfflineContent() {
  return useQuery({
    queryKey: siteContentKeys.offline(),
    queryFn: async () => {
      const [stores, services, info] = await Promise.all([
        SiteContentService.getOfflineStores(),
        SiteContentService.getOfflineServices(),
        SiteContentService.getOfflineInfo(),
      ]);

      return { stores, services, info };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecommendationSettings() {
  return useQuery({
    queryKey: siteContentKeys.recommendations(),
    queryFn: () => SiteContentService.getRecommendationSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveRecommendationSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setting: RecommendationSettingContent) =>
      SiteContentService.saveRecommendationSetting(setting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteContentKeys.recommendations() });
    },
  });
}
