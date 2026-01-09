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
  display: "swap",
  preload: true,
});

const SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://hebimall.web.app"
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "STYNA - 깔끔한 스타일 쇼핑몰",
  description:
    "최신 패션 트렌드를 만나보세요. 티셔츠, 바지, 아우터, 액세서리까지 다양한 스타일을 STYNA에서 만나보세요.",

  keywords: [
    "쇼핑몰",
    "패션",
    "온라인쇼핑",
    "의류",
    "STYNA",
    "무신사",
    "스타일",
  ],

  authors: [{ name: "STYNA" }],
  creator: "STYNA",
  publisher: "STYNA",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon.ico", sizes: "180x180", type: "image/x-icon" },
    ],
  },

  manifest: "/manifest.json",

  themeColor: "#000000",

  openGraph: {
    title: "STYNA - 깔끔한 스타일 쇼핑몰",
    description:
      "최신 패션 트렌드를 만나보세요. 티셔츠, 바지, 아우터, 액세서리까지 다양한 스타일을 STYNA에서!",
    url: SITE_URL,
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
    google: "",
    other: {
      "naver-site-verification": "",
    },
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "STYNA",
  },

  applicationName: "STYNA",

  formatDetection: {
    telephone: false,
  },

  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.variable}>
        <RootProviders>
          <Header />
          <main style={{ minHeight: "100vh" }}>{children}</main>
          <Footer />
          <ChatWidget />
          <SiteGuideManager />
        </RootProviders>
      </body>
    </html>
  );
}
