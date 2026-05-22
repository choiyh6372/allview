import type { Metadata } from "next";
import { fetchAptTradeData, fetchSilvTradeData, fetchAptRentData } from "@/lib/molitApi";
import { buildComplexList } from "@/lib/aptTradeApi";
import RealEstateClient from "@/components/real-estate/RealEstateClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "아파트 실거래가 | AllView - 부산 강서구",
  description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트·분양권·전월세 실거래가를 실시간으로 확인하세요.",
  keywords: "아파트 실거래가, 부산 강서구, 명지오션시티, 명지국제신도시, 에코델타시티, 분양권, 전월세, 부동산 시세",
  openGraph: {
    title: "아파트 실거래가 | AllView - 부산 강서구",
    description: "부산 강서구 명지오션시티, 명지국제신도시, 에코델타시티 아파트·분양권·전월세 실거래가를 실시간으로 확인하세요.",
    url: "https://allview.kr/real-estate",
  },
};

export default async function RealEstatePage() {
  const [aptItems, silvItems, rentItems] = await Promise.all([
    fetchAptTradeData("26440", 60),
    fetchSilvTradeData("26440", 60),
    fetchAptRentData("26440", 60),
  ]);

  const aptComplexes = buildComplexList(aptItems);
  const silvComplexes = buildComplexList(
    silvItems.filter((i) => (i.ownershipGbn ?? "").trim() !== "입주권")
  );

  return (
    <RealEstateClient
      aptComplexes={aptComplexes}
      silvComplexes={silvComplexes}
      rentItems={rentItems}
    />
  );
}
