import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

// 이미지 URL을 미리 로드하고 캐싱하는 함수
const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('이미지 URL이 없습니다'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      resolve(url);
    };
    
    img.onerror = (error) => {
      console.error('❌ 이미지 로드 실패:', url, error);
      // CORS 에러일 경우에도 URL 자체는 유효하다고 가정하고 resolve
      resolve(url);
    };
    
    // CORS 문제를 피하기 위해 crossOrigin 제거
    // img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

// 단일 이미지 캐싱 훅 (단순 URL 캐싱)
export const useImageCache = (imageUrl: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['image', imageUrl],
    queryFn: () => {
      // 단순히 URL을 반환 (브라우저가 자체적으로 캐싱 처리)
      return Promise.resolve(imageUrl);
    },
    enabled: enabled && !!imageUrl,
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 0, // 재시도 비활성화
  });
};

// 다중 이미지 캐싱 훅 (단순 URL 배열 캐싱)
export const useMultipleImageCache = (imageUrls: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['images', ...imageUrls.sort()],
    queryFn: async () => {
      // 단순히 URL 배열을 반환
      return imageUrls.filter(Boolean);
    },
    enabled: enabled && imageUrls.length > 0,
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 0,
  });
};

// 상품 이미지 캐싱 훅 (상품 전용)
export const useProductImageCache = (product: any, enabled: boolean = true) => {
  const imageUrls = [
    product?.mainImage,
    ...(product?.images || [])
  ].filter(Boolean);

  return useMultipleImageCache(imageUrls, enabled);
};

// 이미지 프리로드 유틸리티 함수 (옵션)
export const useImagePreloader = () => {
  const preloadImages = useCallback(async (urls: string[]) => {
    // 백그라운드에서 이미지를 미리 로드 (에러 무시)
    const promises = urls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(url); // 에러도 성공으로 처리
        img.src = url;
      });
    });
    
    const results = await Promise.all(promises);
    return results;
  }, []);

  return { preloadImages };
};

// 이미지 캐시 키 관리
export const imageKeys = {
  single: (url: string) => ['image', url] as const,
  multiple: (urls: string[]) => ['images', ...urls.sort()] as const,
  product: (productId: string) => ['product-images', productId] as const,
  category: (categoryId: string) => ['category-images', categoryId] as const,
} as const;

export default {
  useImageCache,
  useMultipleImageCache,
  useProductImageCache,
  useImagePreloader,
  imageKeys,
};