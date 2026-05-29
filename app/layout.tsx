import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Analytics } from "@vercel/analytics/react";
import VisitTracker from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
  description: "AllView360(올뷰360) - 부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 VR투어, 실거래가, 지도보기",
  openGraph: {
    siteName: "AllView360(올뷰360)",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
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
        <Analytics />
        <VisitTracker />
      </body>
    </html>
  );
}
