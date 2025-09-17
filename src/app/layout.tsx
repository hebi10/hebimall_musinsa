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
  title: "HEBIMALL - 깔끔한 스타일 쇼핑몰",
  description: "최신 패션 트렌드를 만나보세요",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "HEBIMALL - NEW SEASON",
    description: "최신 패션 트렌드를 만나보세요",
    url: "https://hebimall.web.app/",
    siteName: "HEBIMALL",
    images: [
      {
        url: "/thum.png", // 카카오톡 썸네일로 쓰일 이미지 경로
        width: 1200,
        height: 630,
        alt: "HEBIMALL 쇼핑몰",
      },
    ],
    locale: "ko_KR",
    type: "website",
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
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
