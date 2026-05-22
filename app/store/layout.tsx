import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "가게 홍보 | AllView - 명지오션시티·명지국제신도시·에코델타시티",
  description: "명지오션시티, 명지국제신도시, 에코델타시티 입주 단지 주변 가게를 업종별·지역별로 찾아보세요.",
  keywords: "명지오션시티 맛집, 명지국제신도시 카페, 에코델타시티 가게, 부산 강서구 상가, 가게홍보, 입주민 혜택",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
