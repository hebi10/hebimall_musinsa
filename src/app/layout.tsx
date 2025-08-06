import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/variables.css";
import Header from "./_components/header/Header";
import Footer from "./_components/footer/Footer";
import RootProviders from "./_components/providers/RootProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEBIMALL - 깔끔한 스타일 쇼핑몰",
  description: "최신 패션 트렌드를 만나보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable}`}>
        <RootProviders>
          <Header />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
        </RootProviders>
      </body>
    </html>
  );
}
