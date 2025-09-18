import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 이미지 파일에 대한 캐시 헤더 설정 (2분)
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=120, stale-while-revalidate=300');
  }
  
  // Firebase Storage 이미지에 대한 캐시 헤더
  if (request.nextUrl.pathname.includes('firebasestorage.googleapis.com')) {
    response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=120, stale-while-revalidate=300');
  }
  
  // API 응답에 대한 기본 캐시 헤더
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
  }
  
  return response;
}

export const config = {
  matcher: [
    // 이미지 파일들
    '/(.*\\.(jpg|jpeg|png|gif|webp|svg|ico))',
    // API 라우트
    '/api/(.*)',
    // Firebase Storage
    '/(.*firebasestorage.googleapis.com.*)',
  ],
};