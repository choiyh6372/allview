import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import ServiceCards from "@/components/home/ServiceCards";
import StoreBanner from "@/components/home/StoreBanner";
import NewsSection from "@/components/home/NewsSection";

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
