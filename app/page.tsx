import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import ServiceCards from "@/components/home/ServiceCards";
import StoreBanner from "@/components/home/StoreBanner";
import NewsSection from "@/components/home/NewsSection";

export const metadata: Metadata = {
  title: "AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
  description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 실거래가와 VR투어를 한 곳에서 확인하세요.",
  keywords: "명지오션시티, 명지국제신도시, 에코델타시티, 부산 강서구 아파트, 실거래가, VR투어, 부산 부동산",
  openGraph: {
    title: "AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
    description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트 실거래가와 VR투어를 한 곳에서 확인하세요.",
    url: "https://allview.kr",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServiceCards />
      <NewsSection />
      <StoreBanner />
    </>
  );
}
