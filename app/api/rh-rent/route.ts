import { NextResponse } from "next/server";
import { fetchRHRentData, CACHE_TTL } from "@/lib/molitApi";
import { getTradeCache, saveTradeCache } from "@/lib/tradeCache";
import type { RentRawItem } from "@/lib/molitApi";

const EXCLUDE_UMD = new Set(["대항동", "동선동", "성북동", "송정동", "천성동", "눌차동"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawdCd = searchParams.get("lawdCd") ?? "26440";
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 60);

  const cached = await getTradeCache<RentRawItem>("rh-rent");
  if (cached) {
    return NextResponse.json(
      { items: cached, count: cached.length },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
    );
  }

  const raw = await fetchRHRentData(lawdCd, months);
  const items = raw
    .filter((i) => !EXCLUDE_UMD.has((i.umdNm ?? "").trim()))
    .map((i) => ({ ...i, aptNm: i.aptNm ?? i.mhouseNm }));
  if (items.length > 0) saveTradeCache("rh-rent", items).catch(() => {});

  return NextResponse.json(
    { items, count: items.length },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
