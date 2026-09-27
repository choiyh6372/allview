import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "부산 분양정보 | AllView360(올뷰360) - 명지오션시티·명지국제신도시·에코델타시티",
  description: "부산 아파트 청약중·청약예정 분양 단지 정보를 한눈에 확인하세요.",
  keywords: "부산 분양, 부산 청약, 부산 아파트 분양정보, 강서구 분양, 에코델타시티 분양",
  alternates: { canonical: "/subscription" },
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
