import { NextResponse } from "next/server";
import { fetchAptTradeData, fetchSilvTradeData } from "@/lib/molitApi";
import { APT_COMPLEXES } from "@/lib/mapData";

export const revalidate = 3600;

export async function GET() {
  const [aptItems, silvItems] = await Promise.all([
    fetchAptTradeData("26440", 6),
    fetchSilvTradeData("26440", 6),
  ]);

  const knownNames = new Set<string>(
    APT_COMPLEXES.flatMap((c) =>
      [c.name, c.apiName, ...(c.silvApiNames ?? [])].filter(Boolean) as string[]
    )
  );

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

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
