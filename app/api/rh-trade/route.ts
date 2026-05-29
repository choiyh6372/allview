import { NextResponse } from "next/server";
import { fetchRHTradeData, CACHE_TTL } from "@/lib/molitApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawdCd = searchParams.get("lawdCd") ?? "26440";
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 60);

  const EXCLUDE_UMD = new Set(["대항동", "동선동", "성북동", "송정동", "천성동", "눌차동"]);

  const raw = await fetchRHTradeData(lawdCd, months);
  const items = raw
    .filter((i) => !EXCLUDE_UMD.has((i.umdNm ?? "").trim()))
    .map((i) => ({ ...i, aptNm: i.aptNm ?? i.mhouseNm }));

  return NextResponse.json(
    { items, count: items.length },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
