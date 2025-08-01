import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/variables.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { AuthProvider } from "./auth/authProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEBIMALL - 무신사 스타일 쇼핑몰",
  description: "최신 패션 트렌드를 만나보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLogin = null;

  return (
    <html lang="ko">
      <body className={`${inter.variable}`}>
        <AuthProvider>
          <Header />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
