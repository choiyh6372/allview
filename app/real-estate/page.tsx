import type { Metadata } from "next";
import RealEstateClient from "@/components/real-estate/RealEstateClient";

export const metadata: Metadata = {
  title: "아파트 실거래가 | AllView360(올뷰360) - 부산 강서구",
  description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트·분양권·전월세 실거래가를 실시간으로 확인하세요.",
  keywords: "아파트 실거래가, 부산 강서구, 명지오션시티, 명지국제신도시, 에코델타시티, 분양권, 전월세, 부동산 시세",
  openGraph: {
    title: "아파트 실거래가 | AllView360(올뷰360) - 부산 강서구",
    description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트·분양권·전월세 실거래가를 실시간으로 확인하세요.",
    url: "https://allview.kr/real-estate",
    images: [
      {
        url: "https://pub-1abde15af80a47a3838045eddaca3717.r2.dev/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RealEstatePage() {
  return <RealEstateClient />;
}
