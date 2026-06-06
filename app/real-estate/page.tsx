import type { Metadata } from "next";
import RealEstateClient from "@/components/real-estate/RealEstateClient";
import { parseAptMapping } from "@/lib/parseAptMapping";
import { getTradeCache } from "@/lib/tradeCache";
import { buildComplexList, buildRentOnlyComplexes, buildRentOnlyDynamic } from "@/lib/aptTradeApi";
import type { RawItem, RentRawItem } from "@/lib/molitApi";

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

export default async function RealEstatePage() {
  const areaTypeMap = parseAptMapping();

  const [aptItems, silvItems, offiItems, rhItems, rentItems, offiRentItems, rhRentItems] = await Promise.all([
    getTradeCache<RawItem>("apt-trade"),
    getTradeCache<RawItem>("silv-trade"),
    getTradeCache<RawItem>("offi-trade"),
    getTradeCache<RawItem>("rh-trade"),
    getTradeCache<RentRawItem>("apt-rent"),
    getTradeCache<RentRawItem>("offi-rent"),
    getTradeCache<RentRawItem>("rh-rent"),
  ]);

  const initialData = aptItems && silvItems && offiItems && rhItems && rentItems && offiRentItems && rhRentItems
    ? (() => {
        const aptComplexes = (() => {
          const base = buildComplexList(aptItems);
          const rentOnly = buildRentOnlyComplexes(rentItems, new Set(base.map((c) => c.name)));
          return [...base, ...rentOnly].sort((a, b) => a.name.localeCompare(b.name, "ko"));
        })();
        const silvComplexes = buildComplexList(
          silvItems.filter((i) => (i.ownershipGbn ?? "").trim() !== "입주권")
        );
        const offiComplexes = (() => {
          const base = buildComplexList(offiItems);
          const rentOnly = buildRentOnlyDynamic(offiRentItems, new Set(base.map((c) => c.name)), 8000);
          return [...base, ...rentOnly].sort((a, b) => a.name.localeCompare(b.name, "ko"));
        })();
        const rhComplexes = buildComplexList(rhItems).filter((c) =>
          c.name === "부산명지중흥S-클래스더테라스"
        );
        return { aptComplexes, silvComplexes, offiComplexes, rhComplexes, rentItems, offiRentItems, rhRentItems };
      })()
    : undefined;

  return <RealEstateClient areaTypeMap={areaTypeMap} initialData={initialData} />;
}
