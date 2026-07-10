import { NextRequest, NextResponse } from "next/server";
import { loadKbData } from "@/lib/kbData";

export const runtime = "nodejs";

interface RegionRatioEntry {
  code: string;
  name: string;
  latest: number | null;
  series: { date: string; value: number }[];
}
interface RatioSet {
  updatedAt: string;
  nationwide: { latest: number; series: { date: string; value: number }[] };
  regions: RegionRatioEntry[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const code = searchParams.get("code");

  if (!code || (level !== "sido" && level !== "sgg")) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const sidoData = await loadKbData<{ ratio: RatioSet }>("kb-ratio-sido.json");
  const source = level === "sido" ? sidoData : await loadKbData<{ ratio: RatioSet }>("kb-ratio-sigungu.json");
  const region = source.ratio.regions.find((r) => r.code === code);

  if (!region) {
    return NextResponse.json({ error: "region not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: region.name,
    ratio: region.series,
    ratioNational: sidoData.ratio.nationwide.series,
  });
}
