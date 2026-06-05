import { NextResponse } from "next/server";
import { fetchOffiTradeData, CACHE_TTL } from "@/lib/molitApi";
import { getTradeCache, saveTradeCache } from "@/lib/tradeCache";
import type { RawItem } from "@/lib/molitApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawdCd = searchParams.get("lawdCd") ?? "26440";
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 60);

  const cached = await getTradeCache<RawItem>("offi-trade");
  if (cached) {
    return NextResponse.json(
      { items: cached, count: cached.length },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
    );
  }

  const raw = await fetchOffiTradeData(lawdCd, months);
  const items = raw.map((i) => ({ ...i, aptNm: i.aptNm ?? i.offiNm }));
  saveTradeCache("offi-trade", items).catch(() => {});

  return NextResponse.json(
    { items, count: items.length },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
