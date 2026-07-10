import { NextRequest, NextResponse } from "next/server";
import indexSido from "@/lib/data/kb-index-sido.json";
import indexSgg from "@/lib/data/kb-index-sigungu.json";

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

const sidoData = indexSido as unknown as { saleIndex: IndexSet; jeonseIndex: IndexSet };
const sggData = indexSgg as unknown as { saleIndex: IndexSet; jeonseIndex: IndexSet };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const code = searchParams.get("code");

  if (!code || (level !== "sido" && level !== "sgg")) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const source = level === "sido" ? sidoData : sggData;
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
