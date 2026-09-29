import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Analytics } from "@vercel/analytics/react";
import { ADSENSE_CLIENT } from "@/lib/siteInfo";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.allview.kr"),
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
    "google-adsense-account": ADSENSE_CLIENT,
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
        {/* Google 애드센스 (사이트 승인·자동 광고) */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-bg text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <ConditionalFooter />
        <Analytics />
      </body>
    </html>
  );
}
