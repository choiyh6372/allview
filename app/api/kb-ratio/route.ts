import { NextRequest, NextResponse } from "next/server";
import ratioSido from "@/lib/data/kb-ratio-sido.json";
import ratioSgg from "@/lib/data/kb-ratio-sigungu.json";

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

const sidoData = ratioSido as unknown as { ratio: RatioSet };
const sggData = ratioSgg as unknown as { ratio: RatioSet };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const code = searchParams.get("code");

  if (!code || (level !== "sido" && level !== "sgg")) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const source = level === "sido" ? sidoData : sggData;
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
