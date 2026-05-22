import { NextResponse } from "next/server";
import { VR_AREA_MAP } from "@/lib/vrAreaMapping";
import { complexData, R2_BASE } from "@/lib/vrData";

export const revalidate = 86400;

const REGION_LABELS: Record<string, string> = {
  ocean:    "명지오션시티",
  kukje:    "명지국제신도시",
  ecodelta: "에코델타시티",
};

export async function GET() {
  // VR_AREA_MAP을 단일 소스로 사용 (VRModal과 동일)
  const checks: { regionId: string; slug: string; type: string }[] = [];
  const totals: Record<string, number> = {};

  for (const complex of complexData) {
    const areaMap = VR_AREA_MAP[`${complex.regionId}_${complex.slug}`] ?? {};
    const types = Object.keys(areaMap);
    totals[complex.regionId] = (totals[complex.regionId] ?? 0) + types.length;
    for (const type of types) {
      checks.push({ regionId: complex.regionId, slug: complex.slug, type });
    }
  }

  const results = await Promise.all(
    checks.map(async ({ regionId, slug, type }) => {
      const url = `${R2_BASE}/${regionId}/${slug}/${encodeURIComponent(type)}/vtour/tour.html`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { method: "HEAD", signal: controller.signal });
        clearTimeout(timer);
        return { regionId, available: res.ok };
      } catch {
        return { regionId, available: false };
      }
    })
  );

  const available: Record<string, number> = {};
  for (const { regionId, available: ok } of results) {
    if (ok) available[regionId] = (available[regionId] ?? 0) + 1;
  }

  const stats = ["ocean", "kukje", "ecodelta"].map((id) => ({
    id,
    label: REGION_LABELS[id],
    total: totals[id] ?? 0,
    available: available[id] ?? 0,
  }));

  return NextResponse.json(stats);
}
