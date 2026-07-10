import { NextRequest, NextResponse } from "next/server";
import { loadKbData } from "@/lib/kbData";

export const runtime = "nodejs";

interface RegionIndexEntry {
  code: string;
  name: string;
  latest: number | null;
  series: { date: string; value: number }[];
}
interface IndexSet {
  updatedAt: string;
  nationwide: { latest: number; series: { date: string; value: number }[] };
  regions: RegionIndexEntry[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const code = searchParams.get("code");

  if (!code || (level !== "sido" && level !== "sgg")) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const sidoData = await loadKbData<{ saleIndex: IndexSet; jeonseIndex: IndexSet }>("kb-index-sido.json");
  const source =
    level === "sido"
      ? sidoData
      : await loadKbData<{ saleIndex: IndexSet; jeonseIndex: IndexSet }>("kb-index-sigungu.json");

  const saleRegion = source.saleIndex.regions.find((r) => r.code === code);
  const jeonseRegion = source.jeonseIndex.regions.find((r) => r.code === code);

  if (!saleRegion && !jeonseRegion) {
    return NextResponse.json({ error: "region not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: saleRegion?.name ?? jeonseRegion?.name ?? "",
    saleIndex: saleRegion?.series ?? [],
    jeonseIndex: jeonseRegion?.series ?? [],
    saleIndexNational: sidoData.saleIndex.nationwide.series,
    jeonseIndexNational: sidoData.jeonseIndex.nationwide.series,
  });
}
