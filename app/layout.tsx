import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";

export const metadata: Metadata = {
  title: "AllView - 부산 강서구 부동산 통합 플랫폼",
  description: "VR투어, 실거래가, 가게홍보를 한 곳에서 - AllView",
  openGraph: {
    siteName: "AllView",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AllView - 부산 강서구 부동산 통합 플랫폼",
      },
    ],
  },
  other: {
    "naver-site-verification": "b540b6786711318500caa5d1bf4a0fcbc7d92022",
    "google-site-verification": "OAIfaDPoEVnOgXiHpbfiAAa14JhKTEdd0_OzQfKrRds",
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
        <main className="flex-1 pt-16">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
