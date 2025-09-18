import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase Functions와 호환되는 설정
  serverExternalPackages: ['firebase-admin'],

  // 출력 설정 - 개발 환경에서는 기본값 사용
  // output: 'standalone',
  trailingSlash: true,

  images: {
    // 호스팅 환경에서 안정성을 위해 이미지 최적화 비활성화
    unoptimized: true,
    // 이미지 캐시 설정 (2분)
    minimumCacheTTL: 120,
    // 이미지 크기 제한
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/hebimall.firebasestorage.app/o/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Webpack 설정 최소화
  webpack: (config, { dev, isServer }) => {
    // 개발 환경에서 캐시 문제 해결
    if (dev) {
      config.cache = false;
    }

    // 폰트 파일 처리 최적화
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[name].[hash][ext]',
      },
    });
    
    return config;
  },
};

export default nextConfig;
