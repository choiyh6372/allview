import { NextResponse } from "next/server";
import { getTradeCache, saveTradeCache } from "@/lib/tradeCache";
import { fetchAptTradeData, fetchSilvTradeData } from "@/lib/molitApi";
import type { RawItem } from "@/lib/molitApi";

export async function GET() {
  let [aptItems, silvItems] = await Promise.all([
    getTradeCache<RawItem>("apt-trade"),
    getTradeCache<RawItem>("silv-trade"),
  ]);

  if (!aptItems) {
    aptItems = await fetchAptTradeData("26440", 60);
    saveTradeCache("apt-trade", aptItems).catch(() => {});
  }
  if (!silvItems) {
    silvItems = await fetchSilvTradeData("26440", 60);
    saveTradeCache("silv-trade", silvItems).catch(() => {});
  }

  const extract = (items: RawItem[], source: string) => {
    const map = new Map<string, { umdNm: string; count: number }>();
    for (const item of items) {
      const nm = item.aptNm?.trim();
      const umd = item.umdNm?.trim() ?? "";
      if (!nm || umd !== "강동동") continue;
      const ex = map.get(nm);
      if (ex) ex.count++;
      else map.set(nm, { umdNm: umd, count: 1 });
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([aptNm, { count }]) => ({ aptNm, count, source }));
  };

  return NextResponse.json({
    aptTrade: extract(aptItems ?? [], "apt-trade"),
    silvTrade: extract(silvItems ?? [], "silv-trade"),
  });
}
