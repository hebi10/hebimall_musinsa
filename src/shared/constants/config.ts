export const APP_CONFIG = {
  name: 'HEBIMALL',
  description: '무신사 스타일 쇼핑몰',
  version: '1.0.0',
  author: 'HEBIMALL Team',
  
  // API 설정
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 10000,
  },
  
  // 페이지네이션 설정
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // 파일 업로드 설정
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // 사용자 설정
  user: {
    minPasswordLength: 8,
    maxCartItems: 50,
  },
  
  // SEO 설정
  seo: {
    defaultTitle: 'HEBIMALL - 무신사 스타일 쇼핑몰',
    defaultDescription: '최신 패션 트렌드를 만나보세요',
    keywords: ['패션', '쇼핑몰', '무신사', '의류', '브랜드'],
  },
} as const;
