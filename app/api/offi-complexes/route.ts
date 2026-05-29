import { NextResponse } from "next/server";
import { fetchOffiTradeData, fetchOffiRentData } from "@/lib/molitApi";

export const revalidate = 3600;

export async function GET() {
  const [tradeItems, rentItems] = await Promise.all([
    fetchOffiTradeData("26440", 24),
    fetchOffiRentData("26440", 6),
  ]);

  const countMap = new Map<string, { umdNm: string; count: number }>();
  for (const item of tradeItems) {
    const nm = (item.offiNm ?? item.aptNm)?.trim();
    if (!nm) continue;
    const existing = countMap.get(nm);
    if (existing) existing.count++;
    else countMap.set(nm, { umdNm: item.umdNm?.trim() ?? "", count: 1 });
  }

  // 전월세만 있는 단지 추가
  for (const item of rentItems) {
    const nm = (item.offiNm ?? item.aptNm)?.trim();
    if (!nm || countMap.has(nm)) continue;
    countMap.set(nm, { umdNm: item.umdNm?.trim() ?? "", count: 0 });
  }

  const result = Array.from(countMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 80)
    .map(([aptNm, { umdNm }]) => ({ aptNm, umdNm }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
