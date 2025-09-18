import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/variables.css";
import Header from "./_components/header/Header";
import Footer from "./_components/footer/Footer";
import RootProviders from "./_components/providers/RootProviders";
import ChatWidget from "./_components/chat/ChatWidget";
import SiteGuideManager from "./_components/popup/SiteGuideManager";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap', // 폰트 로딩 최적화
  preload: true,  // 폰트 프리로드
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://hebimall.web.app' : 'http://localhost:3000'),
  title: "STYNA - 깔끔한 스타일 쇼핑몰",
  description: "최신 패션 트렌드를 만나보세요. 티셔츠, 바지, 아우터, 액세서리까지 다양한 스타일을 STYNA에서 만나보세요.",
  keywords: ["쇼핑몰", "패션", "온라인쇼핑", "의류", "STYNA", "무신사", "스타일"],
  authors: [{ name: "STYNA" }],
  creator: "STYNA",
  publisher: "STYNA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/x-icon' },
    ],
  },
  openGraph: {
    title: "STYNA - 깔끔한 스타일 쇼핑몰",
    description: "최신 패션 트렌드를 만나보세요. 티셔츠, 바지, 아우터, 액세서리까지 다양한 스타일을 STYNA에서!",
    url: "https://hebimall.web.app",
    siteName: "STYNA",
    images: [
      {
        url: "/thum.png",
        width: 1200,
        height: 630,
        alt: "STYNA 쇼핑몰 - 최신 패션 트렌드",
        type: "image/png",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STYNA - 깔끔한 스타일 쇼핑몰",
    description: "최신 패션 트렌드를 만나보세요",
    images: ["/thum.png"],
    creator: "@STYNA",
  },
  verification: {
    google: "", // 필요시 Google Search Console 인증 코드
    other: {
      'naver-site-verification': '', // 필요시 네이버 웹마스터 인증 코드
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 파비콘 설정 */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" sizes="180x180" />
        
        {/* PWA 매니페스트 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 추가 메타 태그 - 카카오톡, 네이버 등 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        
        {/* 카카오톡 공유용 추가 메타 태그 */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        
        {/* 카카오톡 앱 공유용 */}
        <meta property="al:web:url" content="https://hebimall.web.app" />
        
        {/* iOS 웹앱 설정 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="STYNA" />
        
        {/* 기타 모바일 최적화 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="STYNA" />
      </head>
      <body className={`${inter.variable}`}>
        <RootProviders>
          <Header />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
          <ChatWidget />
          <SiteGuideManager />
        </RootProviders>
      </body>
    </html>
  );
}
