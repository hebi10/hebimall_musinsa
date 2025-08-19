import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase Functions와 호환되는 설정
  serverExternalPackages: ['firebase-admin'],

  // 출력 설정
  output: 'standalone',
  trailingSlash: true,

  images: {
    // 호스팅 환경에서 안정성을 위해 이미지 최적화 비활성화
    unoptimized: true,
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
