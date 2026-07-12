import { NextRequest, NextResponse } from "next/server";
import { loadKbData } from "@/lib/kbData";

export const runtime = "nodejs";

interface RegionEntry {
  code: string;
  name: string;
  latest: number | null;
  series: { date: string; value: number }[];
}
interface IndexSet {
  updatedAt: string;
  nationwide: { latest: number; series: { date: string; value: number }[] };
  regions: RegionEntry[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const code = searchParams.get("code");

  if (!code || (level !== "sido" && level !== "sgg")) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  // 매수우위지수/전세수급지수는 시/도 단위로만 제공됨: 시/군/구가 선택되면 상위 시/도 값을 사용
  const sidoCode = level === "sido" ? code : code.slice(0, 2);

  const data = await loadKbData<{ buyIndex: IndexSet; jeonseSupplyIndex: IndexSet }>("kb-supply-sido.json");

  const buyRegion = data.buyIndex.regions.find((r) => r.code === sidoCode);
  const supplyRegion = data.jeonseSupplyIndex.regions.find((r) => r.code === sidoCode);

  if (!buyRegion && !supplyRegion) {
    return NextResponse.json({ error: "region not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: buyRegion?.name ?? supplyRegion?.name ?? "",
    bySido: level === "sgg",
    buyIndex: buyRegion?.series ?? [],
    jeonseSupplyIndex: supplyRegion?.series ?? [],
    buyIndexNational: data.buyIndex.nationwide.series,
    jeonseSupplyIndexNational: data.jeonseSupplyIndex.nationwide.series,
  });
}
