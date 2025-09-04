'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 스크롤 복원 비활성화
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
