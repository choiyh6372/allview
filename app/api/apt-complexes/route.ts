import { NextResponse } from "next/server";
import { fetchAptTradeData, fetchSilvTradeData, fetchAptRentData } from "@/lib/molitApi";
import { APT_COMPLEXES, RH_SHORT_NAMES } from "@/lib/mapData";

// 전월세만 있는 단지 (매매 데이터 없어도 지도에 표시)
const RENT_ONLY_EXTRAS = [
  { aptNm: "스위트팰리스", umdNm: "명지동" },
];

export const revalidate = 3600;

export async function GET() {
  const [aptItems, silvItems] = await Promise.all([
    fetchAptTradeData("26440", 6),
    fetchSilvTradeData("26440", 6),
  ]);

  const knownNames = new Set<string>([
    ...APT_COMPLEXES.flatMap((c) =>
      [c.name, c.apiName, ...(c.silvApiNames ?? [])].filter(Boolean) as string[]
    ),
    ...Object.keys(RH_SHORT_NAMES),
  ]);

  const countMap = new Map<string, { umdNm: string; count: number }>();
  for (const item of [...aptItems, ...silvItems]) {
    const aptNm = item.aptNm?.trim();
    if (!aptNm || knownNames.has(aptNm)) continue;
    const existing = countMap.get(aptNm);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(aptNm, { umdNm: item.umdNm?.trim() ?? "", count: 1 });
    }
  }

  const result = Array.from(countMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 120)
    .map(([aptNm, { umdNm }]) => ({ aptNm, umdNm }));

  // 전월세 전용 단지 추가 (이미 목록에 없는 경우만)
  const resultNames = new Set(result.map((r) => r.aptNm));
  for (const extra of RENT_ONLY_EXTRAS) {
    if (!resultNames.has(extra.aptNm) && !knownNames.has(extra.aptNm)) {
      result.push(extra);
    }
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
