import { NextResponse } from "next/server";
import { fetchOffiRentData, CACHE_TTL } from "@/lib/molitApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lawdCd = searchParams.get("lawdCd") ?? "26440";
  const months = Math.min(parseInt(searchParams.get("months") ?? "12"), 60);

  const raw = await fetchOffiRentData(lawdCd, months);
  const items = raw.map((i) => ({ ...i, aptNm: i.aptNm ?? i.offiNm }));

  return NextResponse.json(
    { items, count: items.length },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate` } }
  );
}
