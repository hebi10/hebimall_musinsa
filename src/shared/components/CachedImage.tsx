'use client';

import { useState, useRef, useEffect } from 'react';
import { useImageCache } from '@/shared/hooks/useImageCache';

interface CachedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

export default function CachedImage({ 
  src, 
  alt, 
  className, 
  fallback,
  onError,
  onLoad 
}: CachedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // React Query를 통한 URL 캐싱 (2분)
  const { data: cachedSrc, isLoading } = useImageCache(src, !!src && !imageError);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // 캐시된 URL이 변경되면 이미지 상태 리셋
  useEffect(() => {
    if (cachedSrc && cachedSrc !== src) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [cachedSrc, src]);

  // 이미지 표시 조건
  const shouldShowImage = cachedSrc && !imageError;
  const showLoading = isLoading && !imageError && !imageLoaded;

  if (!src || imageError) {
    return (
      <div className={className}>
        {fallback || (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            minHeight: '200px'
          }}>
            이미지 준비중
          </div>
        )}
      </div>
    );
  }

  if (showLoading) {
    return (
      <div className={className}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          color: '#6c757d',
          minHeight: '200px'
        }}>
          로딩중...
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={shouldShowImage ? cachedSrc : src}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        opacity: imageLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
}