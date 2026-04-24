import type { Metadata } from "next";
import "./globals.css";
import "../styles/variables.css";
import Header from "./_components/header/Header";
import Footer from "./_components/footer/Footer";
import RootProviders from "./_components/providers/RootProviders";
import ChatWidget from "./_components/chat/ChatWidget";
import SiteGuideManager from "./_components/popup/SiteGuideManager";

const SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://hebimall.web.app"
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: "STYNA - 패션 쇼핑몰",
  description:
    "티셔츠, 바지, 아우터, 액세서리 등 다양한 패션 상품을 판매하는 온라인 쇼핑몰입니다.",

  keywords: [
    "쇼핑몰",
    "패션",
    "온라인쇼핑",
    "의류",
    "STYNA",
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

  themeColor: "#0a0a0a",

  openGraph: {
    title: "STYNA - 패션 쇼핑몰",
    description:
      "티셔츠, 바지, 아우터, 액세서리 등 패션 상품을 판매하는 온라인 쇼핑몰입니다.",
    url: SITE_URL,
    siteName: "STYNA",
    images: [
      {
        url: "/thum.png",
        width: 1200,
        height: 630,
        alt: "STYNA 쇼핑몰",
        type: "image/png",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "STYNA - 패션 쇼핑몰",
    description: "패션 상품을 판매하는 온라인 쇼핑몰입니다",
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
      <body>
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
