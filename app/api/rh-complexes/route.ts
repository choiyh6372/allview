import { NextResponse } from "next/server";
import { fetchRHTradeData, type RawItem } from "@/lib/molitApi";
import { getTradeCache } from "@/lib/tradeCache";

const EXCLUDE_UMD = new Set(["대항동", "동선동", "성북동", "송정동", "천성동", "눌차동"]);

export const revalidate = 3600;

export async function GET() {
  const cached = await getTradeCache<RawItem>("rh-trade");
  const items: RawItem[] = cached && cached.length > 0
    ? cached
    : await fetchRHTradeData("26440", 6);

  const countMap = new Map<string, { umdNm: string; count: number }>();
  for (const item of items) {
    const umdNm = item.umdNm?.trim() ?? "";
    if (EXCLUDE_UMD.has(umdNm)) continue;
    const nm = (item.mhouseNm ?? item.aptNm)?.trim();
    if (!nm) continue;
    const existing = countMap.get(nm);
    if (existing) existing.count++;
    else countMap.set(nm, { umdNm, count: 1 });
  }

  const result = Array.from(countMap.entries())
    .filter(([aptNm]) => aptNm === "부산명지중흥S-클래스더테라스")
    .map(([aptNm, { umdNm }]) => ({ aptNm, umdNm }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate" },
  });
}
