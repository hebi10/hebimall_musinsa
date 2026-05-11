import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type ApiCacheRule = {
  pattern: RegExp;
  cacheControl: string;
};

const API_NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const API_PUBLIC_CACHE_RULES: ApiCacheRule[] = [
  // 공개 목록 API가 새로 필요하면 해당 엔드포인트만 명시적으로 추가합니다.
  // { pattern: /^\/api\/products(?:\?|$)/, cacheControl: 'public, max-age=120, s-maxage=120, stale-while-revalidate=300' },
  // { pattern: /^\/api\/categories(?:\?|$)/, cacheControl: 'public, max-age=120, s-maxage=120, stale-while-revalidate=300' },
  // { pattern: /^\/api\/events(?:\?|$)/, cacheControl: 'public, max-age=120, s-maxage=120, stale-while-revalidate=300' },
];

const STATIC_CACHE_CONTROL = 'public, max-age=120, s-maxage=120, stale-while-revalidate=300';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Static assets: CDN cache allowed
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    response.headers.set('Cache-Control', STATIC_CACHE_CONTROL);
  }

  // Firebase Storage CDN cache allowed
  if (pathname.includes('firebasestorage.googleapis.com')) {
    response.headers.set('Cache-Control', STATIC_CACHE_CONTROL);
  }

  // API default policy: all non-public API responses are no-store
  if (pathname.startsWith('/api/')) {
    const publicRule = API_PUBLIC_CACHE_RULES.find((rule) => rule.pattern.test(pathname));
    if (publicRule) {
      response.headers.set('Cache-Control', publicRule.cacheControl);
      response.headers.delete('Pragma');
      response.headers.delete('Expires');
    } else {
      Object.entries(API_NO_STORE_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/(.*\\.(jpg|jpeg|png|gif|webp|svg|ico))',
    '/api/(.*)',
    '/(.*firebasestorage.googleapis.com.*)',
  ],
};
