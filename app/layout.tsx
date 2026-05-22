import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AllView - 부산 부동산 통합 플랫폼",
  description: "VR투어, 실거래가, 가게홍보를 한 곳에서 - AllView",
  other: {
    "naver-site-verification": "b540b6786711318500caa5d1bf4a0fcbc7d92022",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-bg text-gray-100 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
