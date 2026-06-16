import { NextResponse } from "next/server";
import { fetchAptRentData, CACHE_TTL } from "@/lib/molitApi";
import { getTradeCache, saveTradeCache } from "@/lib/tradeCache";
import type { RentRawItem } from "@/lib/molitApi";

export type { RentRawItem } from "@/lib/molitApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawdCd = searchParams.get("lawdCd") ?? "26440";
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 60);

  const cached = await getTradeCache<RentRawItem>("apt-rent");
  if (cached) {
    return NextResponse.json(
      { items: cached, count: cached.length },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
    );
  }

  const items = await fetchAptRentData(lawdCd, months);
  if (items.length > 0) saveTradeCache("apt-rent", items).catch(() => {});

  return NextResponse.json(
    { items, count: items.length },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
